/**
 * M2 smoke tests — run with: node scripts/smoke-test.mjs
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

console.log('\n=== M2 Smoke Tests ===\n');

// 1. Asset registry
console.log('Asset Registry:');
const registryPath = join(root, 'src/assets/registry.generated.ts');
const registryContent = await readFile(registryPath, 'utf-8');
assert(registryContent.includes('characters-pogo-pogo_walk_right'), 'POGO walk right registered');
assert(registryContent.includes('characters-background-bg_forest_main'), 'Forest background registered');
assert(registryContent.includes('characters-bogo-bogo_walk_right'), 'BOGO walk right registered');
assert(registryContent.includes('characters-pip-pip_walk_right'), 'PIP walk right registered');
assert(registryContent.includes('characters-props-giant_egg'), 'GIANT_EGG prop registered');
const assetCount = (registryContent.match(/"id":/g) ?? []).length;
assert(assetCount >= 50, `At least 50 assets registered (found ${assetCount})`);

// 2. Default project uses real assets
console.log('\nDefault Project:');
const defaultProject = await readFile(join(root, 'src/constants/defaultProject.ts'), 'utf-8');
assert(defaultProject.includes('characters-background-bg_forest_main'), 'Default uses forest background');
assert(defaultProject.includes('characters-pogo-pogo_walk_right'), 'Default uses POGO walk right');
assert(defaultProject.includes('version: 2'), 'Project version 2');

// 3. M2 features present in codebase
console.log('\nM2 Features:');
const files = {
  'Project save/load': 'src/core/projectIO.ts',
  'Undo/redo history': 'src/store/projectReducer.ts',
  'FFmpeg export': 'src/export/exportPipeline.ts',
  'Frame renderer': 'src/core/frameRenderer.ts',
  'Easing': 'src/core/easing.ts',
  'Scenes panel': 'src/components/panels/ScenesPanel.tsx',
  'Layers panel': 'src/components/panels/ScenesPanel.tsx',
  'Asset generator': 'scripts/generate-asset-registry.mjs',
};

for (const [name, file] of Object.entries(files)) {
  try {
    await readFile(join(root, file), 'utf-8');
    assert(true, `${name} exists`);
  } catch {
    assert(false, `${name} exists`);
  }
}

const reducerContent = await readFile(join(root, 'src/store/projectReducer.ts'), 'utf-8');
assert(reducerContent.includes("'ADD_SCENE'"), 'ADD_SCENE action');
assert(reducerContent.includes("'UNDO'"), 'UNDO action');
assert(reducerContent.includes("'LOAD_PROJECT'"), 'LOAD_PROJECT action');
assert(reducerContent.includes('visible'), 'Layer visibility support');

const typesContent = await readFile(join(root, 'src/types/project.ts'), 'utf-8');
assert(typesContent.includes('EasingType'), 'EasingType defined');
assert(typesContent.includes('audioTracks'), 'Audio tracks defined');
assert(typesContent.includes('camera'), 'Camera defined');
assert(typesContent.includes('transition'), 'Scene transition defined');

// 4. Dev server (optional)
console.log('\nDev Server:');
try {
  const res = await fetch('http://localhost:5173/');
  assert(res.ok, 'Dev server responds 200');
  const assetRes = await fetch('http://localhost:5173/assets/Characters/POGO/POGO_WALK_RIGHT.png');
  assert(assetRes.ok, 'POGO asset served');
  const bgRes = await fetch('http://localhost:5173/assets/Characters/BACKGROUND/BG_FOREST_MAIN.png');
  assert(bgRes.ok, 'Forest background served');
} catch {
  console.log('  (skipped — dev server not running)');
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
