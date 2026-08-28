/**
 * Builds projects/episode-01.json using real asset IDs from the registry.
 * Run: node scripts/build-test-project.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = join(root, 'src/assets/registry.generated.ts');
const registrySrc = readFileSync(registryPath, 'utf-8');
const jsonMatch = registrySrc.match(/export const ASSET_REGISTRY: AssetMeta\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) throw new Error('Could not parse ASSET_REGISTRY');
const registry = JSON.parse(jsonMatch[1]);

function findAsset(query) {
  return registry.find((a) => {
    if (query.productionReady && !a.productionReady) return false;
    if (query.type && a.type !== query.type) return false;
    if (query.character && a.character !== query.character) return false;
    if (query.action && a.action !== query.action) return false;
    if (query.direction && query.direction !== 'unknown' && a.direction !== query.direction) return false;
    if (query.nameContains && !a.filename.toLowerCase().includes(query.nameContains.toLowerCase())) return false;
    return true;
  });
}

const ASSETS = {
  bgForestMain: findAsset({ type: 'background', nameContains: 'FOREST_MAIN', productionReady: true })?.id,
  bgForestClearing: findAsset({ type: 'background', nameContains: 'FOREST_CLEARING', productionReady: true })?.id,
  bogoWalkRight: findAsset({ character: 'BOGO', action: 'walk', direction: 'right', productionReady: true })?.id,
  bogoPointRight: findAsset({ character: 'BOGO', action: 'point', direction: 'right', productionReady: true })?.id,
  bogoNeutral: findAsset({ character: 'BOGO', action: 'idle', productionReady: true })?.id,
  pogoWalkRight: findAsset({ character: 'POGO', action: 'walk', direction: 'right', productionReady: true })?.id,
  giantEgg:
    findAsset({ type: 'prop', nameContains: 'GIANT_EGG.png', productionReady: true })?.id ??
    findAsset({ type: 'prop', nameContains: 'GIANT_EGG', productionReady: true })?.id,
};

for (const [key, val] of Object.entries(ASSETS)) {
  if (!val) throw new Error(`Missing asset for ${key}`);
}

function kf(time, x, y, easing = 'linear') {
  return { time, x, y, scale: 0.7, rotation: 0, opacity: 1, easing };
}

const scene1 = {
  id: 'scene-1',
  name: 'Bogo Walks Through Forest',
  duration: 5,
  backgroundAssetId: ASSETS.bgForestMain,
  transition: { type: 'fade', duration: 0.5 },
  camera: { keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, easing: 'linear' }] },
  audioTracks: [],
  layers: [
    {
      id: 'layer-bogo-walk',
      name: 'Bogo Walk Right',
      assetId: ASSETS.bogoWalkRight,
      startTime: 0,
      endTime: 5,
      zIndex: 1,
      visible: true,
      locked: false,
      keyframes: [kf(0, -700, 142), kf(4, -200, 142, 'ease-in-out')],
    },
  ],
};

const scene2 = {
  id: 'scene-2',
  name: 'Bogo Finds Giant Egg',
  duration: 5,
  backgroundAssetId: ASSETS.bgForestClearing,
  transition: { type: 'crossfade', duration: 0.5 },
  camera: { keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, easing: 'linear' }] },
  audioTracks: [],
  layers: [
    {
      id: 'layer-bogo-idle',
      name: 'Bogo Neutral',
      assetId: ASSETS.bogoNeutral,
      startTime: 0,
      endTime: 5,
      zIndex: 2,
      visible: true,
      locked: false,
      keyframes: [kf(0, -300, 142), kf(5, -300, 142)],
    },
    {
      id: 'layer-giant-egg',
      name: 'Giant Egg',
      assetId: ASSETS.giantEgg,
      startTime: 0,
      endTime: 5,
      zIndex: 1,
      visible: true,
      locked: false,
      keyframes: [kf(0, 200, 180), kf(5, 200, 180)],
    },
    {
      id: 'layer-bogo-point',
      name: 'Bogo Point Right',
      assetId: ASSETS.bogoPointRight,
      startTime: 2,
      endTime: 5,
      zIndex: 3,
      visible: true,
      locked: false,
      keyframes: [kf(2, -300, 142), kf(5, -300, 142)],
    },
  ],
};

const scene3 = {
  id: 'scene-3',
  name: 'Pogo Enters',
  duration: 5,
  backgroundAssetId: ASSETS.bgForestMain,
  transition: { type: 'fade', duration: 0.5 },
  camera: { keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, easing: 'linear' }] },
  audioTracks: [],
  layers: [
    {
      id: 'layer-pogo-enter',
      name: 'Pogo Walk Right',
      assetId: ASSETS.pogoWalkRight,
      startTime: 0,
      endTime: 5,
      zIndex: 1,
      visible: true,
      locked: false,
      keyframes: [kf(0, -900, 142, 'ease-out'), kf(3, -200, 142, 'ease-out')],
    },
  ],
};

const project = {
  fileVersion: 3,
  settings: {
    name: 'Episode 01 — Forest Egg',
    fps: 30,
    version: 2,
  },
  outputFormatId: 'youtube-landscape',
  scenes: [scene1, scene2, scene3],
};

const outDir = join(root, 'projects');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'episode-01.json'), JSON.stringify(project, null, 2));
console.log('Wrote projects/episode-01.json');
console.log('Assets used:', ASSETS);
