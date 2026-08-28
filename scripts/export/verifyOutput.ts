import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import type { MasterProject, OutputFormat } from '../../src/types/project.ts';
import { getTotalDuration } from '../../src/store/projectReducer.ts';
import { collectProjectAudioPaths } from './projectAssets.ts';
import { resolveFfprobePath } from './ffmpegCheck.ts';

export type OutputVerification = {
  ok: boolean;
  fileSize: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasVideo: boolean;
  hasAudio: boolean;
  message?: string;
};

type FfprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
};

type FfprobeResult = {
  format?: { duration?: string; size?: string };
  streams?: FfprobeStream[];
};

function parseFrameRate(rate: string | undefined): number {
  if (!rate) return 0;
  const parts = rate.split('/');
  if (parts.length === 2) {
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    if (den > 0) return num / den;
  }
  const n = Number(rate);
  return Number.isFinite(n) ? n : 0;
}

function runFfprobeJson(filePath: string): FfprobeResult | null {
  const ffprobePath = resolveFfprobePath();
  if (!ffprobePath) return null;

  const result = spawnSync(
    ffprobePath,
    [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_streams',
      '-show_format',
      filePath,
    ],
    { encoding: 'utf-8' },
  );

  if (result.status !== 0) return null;
  try {
    return JSON.parse(result.stdout) as FfprobeResult;
  } catch {
    return null;
  }
}

export function verifyExportOutput(
  filePath: string,
  project: MasterProject,
  format: OutputFormat,
  toleranceSeconds = 0.5,
): OutputVerification {
  if (!existsSync(filePath)) {
    return {
      ok: false,
      fileSize: 0,
      duration: 0,
      width: 0,
      height: 0,
      fps: 0,
      hasVideo: false,
      hasAudio: false,
      message: 'Output file was not created.',
    };
  }

  const fileSize = statSync(filePath).size;
  if (fileSize <= 0) {
    return {
      ok: false,
      fileSize,
      duration: 0,
      width: 0,
      height: 0,
      fps: 0,
      hasVideo: false,
      hasAudio: false,
      message: 'Output file is empty.',
    };
  }

  const probe = runFfprobeJson(filePath);
  if (!probe) {
    return {
      ok: false,
      fileSize,
      duration: 0,
      width: 0,
      height: 0,
      fps: 0,
      hasVideo: false,
      hasAudio: false,
      message: 'Could not verify output (ffprobe not available or failed).',
    };
  }

  const videoStream = probe.streams?.find((s) => s.codec_type === 'video');
  const audioStream = probe.streams?.find((s) => s.codec_type === 'audio');
  const duration = Number(probe.format?.duration ?? 0);
  const width = videoStream?.width ?? 0;
  const height = videoStream?.height ?? 0;
  const fps = parseFrameRate(videoStream?.r_frame_rate);
  const expectedDuration = getTotalDuration(project);
  const expectsAudio = collectProjectAudioPaths(project).length > 0;

  const issues: string[] = [];

  if (!videoStream) {
    issues.push('no video stream');
  } else {
    if (width !== format.width) issues.push(`width ${width} (expected ${format.width})`);
    if (height !== format.height) issues.push(`height ${height} (expected ${format.height})`);
    if (fps > 0 && Math.abs(fps - format.fps) > 1) {
      issues.push(`fps ${fps.toFixed(2)} (expected ${format.fps})`);
    }
  }

  if (Math.abs(duration - expectedDuration) > toleranceSeconds) {
    issues.push(`duration ${duration.toFixed(2)}s (expected ${expectedDuration.toFixed(2)}s)`);
  }

  if (expectsAudio && !audioStream) {
    issues.push('missing audio stream (project has audio assets)');
  }

  const ok = issues.length === 0;

  return {
    ok,
    fileSize,
    duration,
    width,
    height,
    fps,
    hasVideo: Boolean(videoStream),
    hasAudio: Boolean(audioStream),
    message: ok
      ? 'Verified: resolution, duration, and streams look correct.'
      : `Output verification failed: ${issues.join('; ')}`,
  };
}
