import { accessSync, constants, mkdirSync } from 'node:fs';
import { statfsSync } from 'node:fs';
import { resolve } from 'node:path';

const MIN_FREE_BYTES = 50 * 1024 * 1024;

export function resolveExportsDir(input: string | undefined, cwd = process.cwd()): string {
  const raw = (input?.trim() || 'exports').replace(/\\/g, '/');
  const resolved = raw.startsWith('/') ? resolve(raw) : resolve(cwd, raw);
  const projectRoot = resolve(cwd);

  if (!resolved.startsWith(projectRoot)) {
    throw new Error('Output directory must be inside the project folder.');
  }

  try {
    mkdirSync(resolved, { recursive: true });
    accessSync(resolved, constants.W_OK);
  } catch {
    throw new Error(`Cannot write to output folder: ${resolved}`);
  }

  return resolved;
}

export function checkDiskSpace(exportsDir: string, estimatedBytes = 100 * 1024 * 1024): void {
  try {
    const stats = statfsSync(exportsDir);
    const freeBytes = stats.bsize * stats.bavail;
    if (freeBytes < estimatedBytes + MIN_FREE_BYTES) {
      throw new Error(
        `Insufficient disk space for export (need ~${Math.round(estimatedBytes / 1024 / 1024)}MB free).`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient disk space')) {
      throw error;
    }
    /* statfs unavailable on some platforms — skip */
  }
}

export function estimateExportBytes(
  totalFrames: number,
  width: number,
  height: number,
): number {
  const frameBytes = width * height * 4;
  return totalFrames * frameBytes + 20 * 1024 * 1024;
}
