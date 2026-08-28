import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function resolveCollisionSafeFilename(exportsDir: string, filename: string): string {
  const safe = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
  if (!existsSync(join(exportsDir, safe))) return safe;

  const base = safe.replace(/\.mp4$/i, '');
  let n = 2;
  while (existsSync(join(exportsDir, `${base}-${n}.mp4`))) {
    n += 1;
  }
  return `${base}-${n}.mp4`;
}
