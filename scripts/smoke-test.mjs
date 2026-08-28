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
assert(registryContent.includes('"nativeWidth"'), 'nativeWidth metadata present');
assert(registryContent.includes('"alphaBounds"'), 'alphaBounds metadata present');
assert(registryContent.includes('"characterSizeRatio"'), 'characterSizeRatio metadata present');
assert(registryContent.includes('getCharacterReferenceHeights'), 'Character reference heights helper present');
assert(registryContent.includes('getAssetsByAudioCategory'), 'Audio category registry helper present');
const assetCount = (registryContent.match(/"id":/g) ?? []).length;
assert(assetCount >= 50, `At least 50 assets registered (found ${assetCount})`);

// 2. Director system
console.log('\nDirector System:');
const directorFiles = [
  'src/director/sceneHelpers.ts',
  'src/director/presets.ts',
  'src/director/poseHelpers.ts',
  'src/director/visualBeats.ts',
  'src/director/timing.ts',
  'src/director/assetSelection.ts',
  'src/director/compositionHelpers.ts',
  'src/director/audioHelpers.ts',
  'src/director/dialogueHelpers.ts',
  'src/director/episodes/forestEggEpisode.ts',
  'src/core/audioUtils.ts',
  'src/core/audioPreviewEngine.ts',
  'src/core/speaking.ts',
  'src/core/pose.ts',
  'src/core/characterRender.ts',
  'src/assets/assetQuery.ts',
  'src/core/validateProject.ts',
  'docs/animation-director.md',
  'docs/scripts/forest-egg-test-script.md',
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
assert(episode.scenes?.length === 4, 'episode-01 has 4 scenes');
assert(episode.scenes[0].layers.some((l) => l.poseSegments?.length > 0), 'Scene 1 has pose segments');
assert(
  episode.scenes[2].layers.some((l) => l.poseSegments?.length >= 3),
  'Scene 3 has multi-pose sequence',
);
assert(episode.scenes[3].layers.some((l) => l.assetId.includes('pogo')), 'Scene 4 has Pogo');

const durations = episode.scenes.map((s) => s.duration);
const uniqueDurations = new Set(durations);
assert(uniqueDurations.size > 1, 'Scenes have non-uniform durations');
assert(!durations.every((d) => d === 5), 'Not all scenes are 5 seconds');

const scene2 = episode.scenes[1];
const bogoLayer = scene2.layers.find((l) => l.name === 'Bogo');
const eggLayer = scene2.layers.find((l) => l.name === 'Giant Egg');
const bogoX = bogoLayer?.keyframes[0]?.x;
const eggX = eggLayer?.keyframes[0]?.x;
assert(bogoX !== undefined && eggX !== undefined && eggX > bogoX, 'Scene 2 egg is in front of Bogo');

const scene4Pogo = episode.scenes[3].layers.find((l) => l.name === 'Pogo');
const pogoStartX = scene4Pogo?.keyframes[0]?.x;
assert(pogoStartX > 0, 'Scene 4 Pogo starts from right (positive X)');

const directorDoc = await readFile(join(root, 'docs/animation-director.md'), 'utf-8');
assert(directorDoc.includes('Visual Beats'), 'Docs include Visual Beats section');
assert(directorDoc.includes('Feedback Loop'), 'Docs include Feedback Loop section');
assert(directorDoc.includes('17-Step') || directorDoc.includes('16-Step'), 'Docs include director workflow');
assert(directorDoc.includes('Audio Direction'), 'Docs include Audio Direction section');
assert(directorDoc.includes('Dialogue Direction'), 'Docs include Dialogue Direction section');

// 5. Audio utilities (inline pure-function checks)
console.log('\nAudio System:');
function getTrackDuration(track, assetDuration) {
  if (track.duration !== undefined && track.duration > 0) return track.duration;
  if (assetDuration !== undefined && assetDuration > 0) return assetDuration;
  return 1;
}
function isTrackActiveAt(track, sceneTime, assetDuration) {
  const end = track.startTime + getTrackDuration(track, assetDuration);
  return sceneTime >= track.startTime && sceneTime < end;
}
function computeEffectiveVolume(track, localTime, assetDuration) {
  if (track.muted) return 0;
  const clipDuration = getTrackDuration(track, assetDuration);
  let gain = track.volume;
  if (track.fadeIn !== undefined && track.fadeIn > 0 && localTime < track.fadeIn) {
    gain *= localTime / track.fadeIn;
  }
  if (track.fadeOut !== undefined && track.fadeOut > 0) {
    const timeUntilEnd = clipDuration - localTime;
    if (timeUntilEnd < track.fadeOut) gain *= Math.max(0, timeUntilEnd / track.fadeOut);
  }
  return Math.max(0, Math.min(1, gain));
}

const testTrack = {
  id: 't1',
  name: 'Test',
  type: 'sfx',
  assetId: 'a1',
  startTime: 1,
  duration: 2,
  volume: 0.8,
  muted: false,
  fadeIn: 0.5,
  fadeOut: 0.5,
};
assert(isTrackActiveAt(testTrack, 1.5, undefined), 'Track active within window');
assert(!isTrackActiveAt(testTrack, 3.5, undefined), 'Track inactive after end');
assert(computeEffectiveVolume({ ...testTrack, muted: true }, 1, 2) === 0, 'Muted track has zero volume');
assert(
  computeEffectiveVolume(testTrack, 0.25, 2) < testTrack.volume,
  'Fade-in reduces early volume',
);
assert(episode.scenes.every((s) => Array.isArray(s.audioTracks)), 'All scenes have audioTracks array');

const directorIndex = await readFile(join(root, 'src/director/index.ts'), 'utf-8');
assert(directorIndex.includes('audioHelpers'), 'Director index exports audioHelpers');
assert(directorIndex.includes('dialogueHelpers'), 'Director index exports dialogueHelpers');

const schema = JSON.parse(await readFile(join(root, 'src/schema/project.schema.json'), 'utf-8'));
assert(schema.definitions?.audioTrack?.properties?.type, 'Schema defines audioTrack type');
assert(schema.definitions?.audioTrack?.properties?.speaker, 'Schema defines dialogue speaker');
assert(schema.definitions?.audioTrack?.properties?.text, 'Schema defines dialogue text');
assert(schema.definitions?.reactionCue, 'Schema defines reactionCue');

const scene3Dialogue = episode.scenes[2].audioTracks.find((t) => t.type === 'dialogue');
assert(scene3Dialogue?.speaker === 'BOGO', 'Scene 3 has BOGO dialogue');
assert(scene3Dialogue?.text?.includes('giant egg'), 'Scene 3 stores Bogo transcript');
assert(
  scene3Dialogue?.assetId === undefined || typeof scene3Dialogue.assetId === 'string',
  'Dialogue assetId is optional (text-only allowed)',
);
const scene4Dialogue = episode.scenes[3].audioTracks.find((t) => t.type === 'dialogue');
assert(scene4Dialogue?.speaker === 'POGO', 'Scene 4 has POGO dialogue');
assert(Array.isArray(episode.scenes[2].reactionCues), 'Scene 3 has reactionCues');

function computePreviewVolume(track, localTime, assetDuration, dialogueActive) {
  const base = computeEffectiveVolume(track, localTime, assetDuration);
  if (track.type === 'dialogue') return base;
  if (dialogueActive && (track.type === 'music' || track.type === 'ambience')) {
    return Math.max(0, Math.min(1, base * 0.35));
  }
  return base;
}
const music = { type: 'music', volume: 0.4, muted: false, startTime: 0, duration: 5 };
assert(
  computePreviewVolume(music, 0, 5, true) < computePreviewVolume(music, 0, 5, false),
  'Music ducks while dialogue is active',
);

function getSpeakingWindows(scene) {
  return (scene.audioTracks ?? [])
    .filter((t) => t.type === 'dialogue' && t.speaker)
    .map((t) => ({
      speaker: t.speaker,
      startTime: t.startTime,
      endTime: t.startTime + (t.duration ?? 1),
    }));
}
const windows = getSpeakingWindows(episode.scenes[2]);
assert(windows.length >= 1, 'Scene 3 speaking window exists');
assert(windows[0].speaker === 'BOGO', 'Speaking window speaker is BOGO');

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
