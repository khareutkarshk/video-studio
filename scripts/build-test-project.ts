/**
 * Builds projects/episode-01.json using the director episode builder.
 * Run: npm run build-project
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildForestEggEpisode } from '../src/director/episodes/forestEggEpisode';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'projects');
mkdirSync(outDir, { recursive: true });

const { project, assets, decisions } = buildForestEggEpisode();

writeFileSync(join(outDir, 'episode-01.json'), JSON.stringify(project, null, 2));

console.log('Wrote projects/episode-01.json');
console.log('Assets used:', assets);
console.log(
  'Asset decisions:',
  decisions.filter((d) => d.decision !== 'exact').map((d) => d.reason).filter(Boolean),
);
