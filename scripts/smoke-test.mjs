/**
 * Smoke tests — run with: npm run test
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log('\n=== Smoke Tests ===\n');

// 1. Asset registry with enriched metadata
console.log('Asset Registry:');
const registryPath = join(root, 'src/assets/registry.generated.ts');
const registryContent = await readFile(registryPath, 'utf-8');
assert(registryContent.includes('characters-pogo-pogo_walk_right'), 'POGO walk right registered');
assert(registryContent.includes('characters-background-bg_forest_main'), 'Forest background registered');
assert(registryContent.includes('"action": "walk"'), 'Action metadata present');
assert(registryContent.includes('"productionReady"'), 'productionReady metadata present');
assert(registryContent.includes('"width"'), 'Width metadata present');
const assetCount = (registryContent.match(/"id":/g) ?? []).length;
assert(assetCount >= 50, `At least 50 assets registered (found ${assetCount})`);

// 2. Director system
console.log('\nDirector System:');
const directorFiles = [
  'src/director/sceneHelpers.ts',
  'src/director/presets.ts',
  'src/assets/assetQuery.ts',
  'src/core/validateProject.ts',
  'docs/animation-director.md',
  'src/schema/project.schema.json',
];
for (const f of directorFiles) {
  try {
    await readFile(join(root, f), 'utf-8');
    assert(true, `${f} exists`);
  } catch {
    assert(false, `${f} exists`);
  }
}

// 3. Episode project file
console.log('\nEpisode Project:');
const episodePath = join(root, 'projects/episode-01.json');
const episode = JSON.parse(await readFile(episodePath, 'utf-8'));
assert(episode.fileVersion === 3, 'episode-01 uses fileVersion 3');
assert(episode.scenes?.length === 3, 'episode-01 has 3 scenes');
assert(episode.scenes[0].layers.some((l) => l.assetId.includes('bogo')), 'Scene 1 has Bogo');
assert(episode.scenes[2].layers.some((l) => l.assetId.includes('pogo')), 'Scene 3 has Pogo');

// 4. Dev server (optional)
console.log('\nDev Server:');
try {
  const res = await fetch('http://localhost:5173/');
  assert(res.ok, 'Dev server responds 200');
  const projectRes = await fetch('http://localhost:5173/projects/episode-01.json');
  assert(projectRes.ok, 'episode-01.json served');
  const assetRes = await fetch('http://localhost:5173/assets/Characters/POGO/POGO_WALK_RIGHT.png');
  assert(assetRes.ok, 'POGO asset served');
} catch {
  console.log('  (skipped — dev server not running)');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
