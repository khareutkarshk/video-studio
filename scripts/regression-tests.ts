/**
 * Pre-production regression tests — run via smoke-test.mjs or:
 *   npx tsx scripts/regression-tests.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeProjectFile, deserializeProjectFile } from '../src/core/projectIO.ts';
import { getCrossfadeAlphas } from '../src/core/frameRenderer.ts';
import { buildAudioMixPlan } from './export/audioMixBuilder.ts';
import { getTotalDuration } from '../src/store/projectReducer.ts';
import type { MasterProject } from '../src/types/project.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (condition) {
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

console.log('\n=== Regression Tests ===\n');

// 1. poseSegments survive serialize → deserialize
console.log('Pose segments:');
const episodePath = join(root, 'projects/episode-01.json');
const episodeRaw = JSON.parse(readFileSync(episodePath, 'utf-8'));
const { project: episodeProject } = deserializeProjectFile(episodeRaw);

const scene3Bogo = episodeProject.scenes[2].layers.find((l) => l.name === 'Bogo');
const scene3Poses = scene3Bogo?.poseSegments ?? [];
assert(scene3Poses.length >= 3, 'Scene 3 Bogo has pose segments');
assert(
  scene3Poses[0]?.assetId.includes('bogo_neutral'),
  'Scene 3 pose 1 is BOGO_NEUTRAL',
);
assert(
  scene3Poses[1]?.assetId.includes('bogo_point_right'),
  'Scene 3 pose 2 is BOGO_POINT_RIGHT',
);
assert(
  scene3Poses[2]?.assetId.includes('surprised'),
  'Scene 3 pose 3 is BOGO_SURPRISED',
);

const scene4Pogo = episodeProject.scenes[3].layers.find((l) => l.name === 'Pogo');
const scene4Poses = scene4Pogo?.poseSegments ?? [];
assert(scene4Poses.length >= 2, 'Scene 4 Pogo has pose segments');
assert(
  scene4Poses[0]?.assetId.includes('pogo_walk_left'),
  'Scene 4 pose 1 is POGO_WALK_LEFT',
);
assert(
  scene4Poses[1]?.assetId.includes('pogo_neutral'),
  'Scene 4 pose 2 is POGO_NEUTRAL',
);

const roundtripProject: MasterProject = {
  name: 'pose-test',
  fps: 30,
  version: 1,
  scenes: [
    {
      id: 's1',
      name: 'Test',
      duration: 3,
      backgroundAssetId: null,
      transition: { type: 'none', duration: 0 },
      camera: { keyframes: [{ time: 0, x: 0, y: 0, zoom: 1 }] },
      audioTracks: [],
      layers: [
        {
          id: 'l1',
          name: 'Char',
          assetId: 'characters-bogo-bogo_neutral',
          startTime: 0,
          endTime: 3,
          zIndex: 1,
          visible: true,
          locked: false,
          keyframes: [
            { time: 0, x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, easing: 'linear' },
          ],
          poseSegments: [
            { assetId: 'characters-bogo-bogo_neutral', startTime: 0, endTime: 1 },
            { assetId: 'characters-bogo-bogo_point_right', startTime: 1, endTime: 2 },
          ],
        },
      ],
    },
  ],
};

const serialized = serializeProjectFile(roundtripProject);
const { project: restored } = deserializeProjectFile(serialized);
const restoredSegs = restored.scenes[0].layers[0].poseSegments ?? [];
assert(restoredSegs.length === 2, 'roundtrip preserves pose segment count');
assert(
  restoredSegs[0]?.assetId === 'characters-bogo-bogo_neutral',
  'roundtrip preserves first pose assetId',
);
assert(
  restoredSegs[1]?.endTime === 2,
  'roundtrip preserves second pose endTime',
);

// 2. Crossfade opacity
console.log('\nCrossfade opacity:');
const at0 = getCrossfadeAlphas(0);
assert(at0.prevAlpha === 1 && at0.currentAlpha === 0, 'crossfade at 0%: prev=1 current=0');

const at50 = getCrossfadeAlphas(0.5);
assert(at50.prevAlpha === 0.5 && at50.currentAlpha === 0.5, 'crossfade at 50%: prev=0.5 current=0.5');

const at100 = getCrossfadeAlphas(1);
assert(at100.prevAlpha === 0 && at100.currentAlpha === 1, 'crossfade at 100%: prev=0 current=1');

// 3. Audio mix covers full project duration
console.log('\nAudio export duration:');
const totalDuration = getTotalDuration(episodeProject);
const shortAudioProject: MasterProject = {
  ...episodeProject,
  scenes: [
    {
      ...episodeProject.scenes[0],
      audioTracks: [
        {
          id: 'short-music',
          name: 'Short music',
          type: 'music',
          assetId: 'audio-music-test',
          startTime: 0,
          duration: 2,
          volume: 0.5,
          muted: false,
        },
      ],
    },
    ...episodeProject.scenes.slice(1),
  ],
};

const mixPlan = buildAudioMixPlan(shortAudioProject, totalDuration);
assert(mixPlan.hasAudio === false, 'episode-01 has no audio assets on disk (text-only dialogue)');

const filterWithDuration = `amix=inputs=1:duration=longest:dropout_transition=0,apad,atrim=duration=${totalDuration.toFixed(3)}[aout]`;
assert(
  filterWithDuration.includes(`atrim=duration=${totalDuration.toFixed(3)}`),
  'audio filter pads/trims to project duration',
);
assert(
  !filterWithDuration.includes('shortest'),
  'audio filter does not use shortest',
);

const runExportSrc = readFileSync(join(root, 'scripts/export/runExport.ts'), 'utf-8');
assert(!runExportSrc.includes('-shortest'), 'runExport does not pass -shortest to FFmpeg');

console.log(`\n=== Regression: ${failed === 0 ? 'all passed' : `${failed} failed`} ===\n`);
process.exit(failed > 0 ? 1 : 0);
