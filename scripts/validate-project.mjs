/**
 * Validate a project JSON file.
 * Usage: npm run validate
 */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectPath = process.argv[2] ?? 'projects/episode-01.json';

const result = spawnSync('tsx', ['scripts/validate-project.ts', projectPath], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
