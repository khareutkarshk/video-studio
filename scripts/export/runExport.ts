import { spawn } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { MasterProject, OutputFormat } from '../../src/types/project.ts';
import { serializeProjectFile } from '../../src/core/projectIO.ts';
import { validateProjectFile, type ValidationIssue } from '../../src/core/validateProject.ts';
import {
  DEFAULT_EXPORT_QUALITY_ID,
  findExportQuality,
  isValidExportQualityId,
} from '../../src/constants/exportQuality.ts';
import { defaultExportFilename } from '../../src/export/exportNaming.ts';
import { resolveCollisionSafeFilename } from './exportNaming.ts';
import type { ExportPhase, OutputVerification } from '../../src/export/exportTypes.ts';
import { getTotalDuration } from '../../src/store/projectReducer.ts';
import { assertFfmpegAvailable, resolveFfmpegPath } from './ffmpegCheck.ts';
import { buildAudioMixPlan } from './audioMixBuilder.ts';
import {
  collectProjectImageUrls,
  findMissingAudioAssets,
  findMissingImageAssets,
} from './projectAssets.ts';
import { clearNodeImageCache, preloadNodeImages } from './nodeImageLoader.ts';
import { renderExportFrames } from './renderExportFrames.ts';
import { verifyExportOutput } from './verifyOutput.ts';
import { toUserExportError } from './exportErrors.ts';
import {
  checkDiskSpace,
  estimateExportBytes,
  resolveExportsDir,
} from './resolveExportsDir.ts';

export type ExportProgressUpdate = {
  phase: ExportPhase;
  progress: number | null;
  message: string;
};

export type RunExportOptions = {
  project: MasterProject;
  format: OutputFormat;
  filename?: string;
  exportsDir?: string;
  qualityPresetId?: string;
  onProgress?: (update: ExportProgressUpdate) => void;
  signal?: AbortSignal;
};

export type RunExportResult = {
  outputPath: string;
  filename: string;
  verification: OutputVerification;
};

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '');
  return base.endsWith('.mp4') ? base : `${base}.mp4`;
}

function runFfmpeg(args: string[], signal?: AbortSignal): Promise<void> {
  const ffmpegPath = resolveFfmpegPath();
  if (!ffmpegPath) {
    return Promise.reject(
      new Error('FFmpeg was not found. Install FFmpeg and try again. (Linux: sudo apt install ffmpeg)'),
    );
  }

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    const onAbort = () => {
      child.kill('SIGTERM');
      reject(new Error('Export cancelled'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error: Error) => {
      signal?.removeEventListener('abort', onAbort);
      reject(error);
    });

    child.on('close', (code: number | null) => {
      signal?.removeEventListener('abort', onAbort);
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `FFmpeg exited with code ${code}`));
    });
  });
}

export function validateExportProject(
  project: MasterProject,
  outputFormatId?: string,
  options?: {
    exportsDir?: string;
    qualityPresetId?: string;
    outputFormat?: OutputFormat;
  },
): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const file = serializeProjectFile(project, outputFormatId);
  const result = validateProjectFile(file);
  const errors = result.issues.filter((i: ValidationIssue) => i.level === 'error');
  const warnings = result.issues.filter((i: ValidationIssue) => i.level === 'warning');

  for (const url of findMissingImageAssets(project)) {
    errors.push({ level: 'error', path: url, message: `Missing image asset: ${url}` });
  }
  for (const url of findMissingAudioAssets(project)) {
    errors.push({ level: 'error', path: url, message: `Missing audio asset: ${url}` });
  }

  if (options?.qualityPresetId && !isValidExportQualityId(options.qualityPresetId)) {
    errors.push({
      level: 'error',
      path: 'qualityPresetId',
      message: `Invalid quality preset: ${options.qualityPresetId}`,
    });
  }

  if (options?.exportsDir) {
    try {
      resolveExportsDir(options.exportsDir);
    } catch (error) {
      errors.push({
        level: 'error',
        path: 'exportsDir',
        message: error instanceof Error ? error.message : 'Invalid output directory',
      });
    }
  }

  const format = options?.outputFormat;
  if (format) {
    if (project.fps !== format.fps) {
      warnings.push({
        level: 'warning',
        path: 'settings.fps',
        message: `Project FPS (${project.fps}) differs from export preset (${format.fps})`,
      });
    }
  }

  return { errors, warnings };
}

export async function runExport(options: RunExportOptions): Promise<RunExportResult> {
  const { project, format, onProgress, signal } = options;
  const qualityId = options.qualityPresetId ?? DEFAULT_EXPORT_QUALITY_ID;
  const quality = findExportQuality(qualityId);
  if (!quality) {
    throw new Error(`Invalid quality preset: ${qualityId}`);
  }

  const exportsDir = resolveExportsDir(options.exportsDir);
  const requestedFilename = sanitizeFilename(
    options.filename ?? defaultExportFilename(project.name, format.id),
  );
  const filename = resolveCollisionSafeFilename(exportsDir, requestedFilename);

  const report = (phase: ExportPhase, progress: number | null, message: string) => {
    onProgress?.({ phase, progress, message });
  };

  report('preparing', 0, 'Preparing...');
  assertFfmpegAvailable();

  const validation = validateExportProject(project, format.id, {
    exportsDir: options.exportsDir ?? 'exports',
    qualityPresetId: qualityId,
    outputFormat: format,
  });
  if (validation.errors.length > 0) {
    const summary = validation.errors.map((e: ValidationIssue) => e.message).join('; ');
    throw new Error(`Validation failed: ${summary}`);
  }

  const totalDuration = getTotalDuration(project);
  const totalFrames = Math.ceil(totalDuration * format.fps);
  checkDiskSpace(exportsDir, estimateExportBytes(totalFrames, format.width, format.height));

  if (signal?.aborted) throw new Error('Export cancelled');

  const tempDir = mkdtempSync(join(tmpdir(), 'kas-export-'));
  const framesDir = join(tempDir, 'frames');
  mkdirSync(framesDir, { recursive: true });
  const tempOutput = join(tempDir, 'output.mp4');
  const finalOutput = join(exportsDir, filename);

  try {
    report('preparing', 5, 'Loading images...');
    const imageUrls = collectProjectImageUrls(project);
    const images = await preloadNodeImages(imageUrls);

    if (signal?.aborted) throw new Error('Export cancelled');

    await renderExportFrames(
      project,
      format,
      framesDir,
      images,
      ({ frame, totalFrames: tf }) => {
        const pct = 10 + Math.round((frame / tf) * 55);
        report('rendering', pct, `Rendering frame ${frame} / ${tf}`);
      },
      signal,
    );

    report('encoding', null, 'Mixing audio...');
    const audioPlan = buildAudioMixPlan(project);

    report('encoding', null, 'Encoding...');
    const ffmpegArgs = ['-y', '-framerate', String(format.fps), '-i', join(framesDir, 'frame%06d.png')];

    for (const input of audioPlan.inputs) {
      ffmpegArgs.push('-i', input.path);
    }

    if (audioPlan.hasAudio) {
      ffmpegArgs.push('-filter_complex', audioPlan.filterComplex, '-map', '0:v', '-map', '[aout]');
    }

    ffmpegArgs.push(
      '-c:v',
      'libx264',
      '-preset',
      quality.videoPreset,
      '-crf',
      String(quality.crf),
      '-pix_fmt',
      'yuv420p',
      '-r',
      String(format.fps),
    );

    if (audioPlan.hasAudio) {
      ffmpegArgs.push(
        '-c:a',
        'aac',
        '-b:a',
        quality.audioBitrate,
        '-ar',
        '48000',
        '-shortest',
      );
    }

    ffmpegArgs.push(tempOutput);

    await runFfmpeg(ffmpegArgs, signal);

    if (!existsSync(tempOutput) || readFileSync(tempOutput).length === 0) {
      throw new Error('FFmpeg did not produce a valid output file');
    }

    report('finalizing', 95, 'Verifying output...');
    const verification = verifyExportOutput(tempOutput, project, format);
    if (!verification.ok) {
      throw new Error(verification.message ?? 'Output verification failed');
    }

    report('finalizing', 98, 'Finalizing...');
    copyFileSync(tempOutput, finalOutput);

    report('complete', 100, 'Export complete');
    return { outputPath: finalOutput, filename, verification };
  } catch (error) {
    throw new Error(toUserExportError(error));
  } finally {
    clearNodeImageCache();
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      /* ignore cleanup errors */
    }
  }
}
