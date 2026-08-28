import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

export type FfmpegStatus = {
  available: boolean;
  version?: string;
  error?: string;
};

const MISSING_MESSAGE =
  'FFmpeg was not found. Install FFmpeg and try again. (Linux: sudo apt install ffmpeg)';

const require = createRequire(import.meta.url);

let cachedFfmpegPath: string | undefined;
let cachedFfprobePath: string | undefined;

function probeBinary(path: string, args: string[]): boolean {
  const result = spawnSync(path, args, { encoding: 'utf-8' });
  return !result.error && result.status === 0;
}

function ffmpegStaticPath(): string | undefined {
  try {
    const path = require('ffmpeg-static') as string;
    return path && existsSync(path) ? path : undefined;
  } catch {
    return undefined;
  }
}

export function resolveFfmpegPath(): string | undefined {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  const candidates = [
    process.env.FFMPEG_PATH,
    ffmpegStaticPath(),
    'ffmpeg',
  ].filter((c): c is string => Boolean(c));

  for (const path of candidates) {
    if (path !== 'ffmpeg' && !existsSync(path)) continue;
    if (probeBinary(path, ['-version'])) {
      cachedFfmpegPath = path;
      return path;
    }
  }
  return undefined;
}

export function resolveFfprobePath(): string | undefined {
  if (cachedFfprobePath) return cachedFfprobePath;

  const candidates = [process.env.FFPROBE_PATH, 'ffprobe'].filter((c): c is string => Boolean(c));

  for (const path of candidates) {
    if (path !== 'ffprobe' && !existsSync(path)) continue;
    if (probeBinary(path, ['-version'])) {
      cachedFfprobePath = path;
      return path;
    }
  }
  return undefined;
}

export function checkFfmpeg(): FfmpegStatus {
  const ffmpegPath = resolveFfmpegPath();
  if (!ffmpegPath) {
    return { available: false, error: MISSING_MESSAGE };
  }
  const result = spawnSync(ffmpegPath, ['-version'], { encoding: 'utf-8' });
  const version = result.stdout.split('\n')[0]?.trim();
  return { available: true, version };
}

export function assertFfmpegAvailable(): void {
  const status = checkFfmpeg();
  if (!status.available) {
    throw new Error(status.error ?? MISSING_MESSAGE);
  }
}
