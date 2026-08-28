/**
 * Validate a project JSON file.
 * Usage: node scripts/validate-project.mjs projects/episode-01.json
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectPath = process.argv[2] ?? join(root, 'projects/episode-01.json');

const file = JSON.parse(readFileSync(projectPath, 'utf-8'));
const registrySrc = readFileSync(join(root, 'src/assets/registry.generated.ts'), 'utf-8');
const assetIds = new Set([...registrySrc.matchAll(/"id": "([^"]+)"/g)].map((m) => m[1]));

const issues = [];

if (!file.settings?.name) issues.push('[ERROR] settings.name: required');
if (!file.scenes?.length) issues.push('[ERROR] scenes: must have at least one scene');

const outputIds = ['youtube-landscape', 'youtube-shorts', 'instagram-reels'];
if (file.outputFormatId && !outputIds.includes(file.outputFormatId)) {
  issues.push(`[WARNING] outputFormatId: unknown format ${file.outputFormatId}`);
}

for (const scene of file.scenes ?? []) {
  const sp = `scenes.${scene.id}`;
  if (!scene.duration || scene.duration <= 0) issues.push(`[ERROR] ${sp}.duration: must be positive`);
  if (scene.backgroundAssetId && !assetIds.has(scene.backgroundAssetId)) {
    issues.push(`[ERROR] ${sp}.backgroundAssetId: unknown asset ${scene.backgroundAssetId}`);
  }
  const layerIds = new Set();
  for (const layer of scene.layers ?? []) {
    const lp = `${sp}.layers.${layer.id}`;
    if (layerIds.has(layer.id)) issues.push(`[ERROR] ${lp}: duplicate layer id`);
    layerIds.add(layer.id);
    if (!assetIds.has(layer.assetId)) issues.push(`[ERROR] ${lp}.assetId: unknown asset ${layer.assetId}`);
    if (layer.startTime > scene.duration) issues.push(`[ERROR] ${lp}.startTime: outside duration`);
    if (layer.endTime > scene.duration) issues.push(`[ERROR] ${lp}.endTime: outside duration`);
    for (const kf of layer.keyframes ?? []) {
      if (kf.time > scene.duration) issues.push(`[ERROR] ${lp}.keyframes: time ${kf.time} outside duration`);
    }
    if (layer.visible && !layer.keyframes?.length) issues.push(`[WARNING] ${lp}.keyframes: empty`);
  }
}

const errors = issues.filter((i) => i.startsWith('[ERROR]'));
console.log(`Validating: ${projectPath}`);
if (issues.length === 0) {
  console.log('Project is valid.');
  process.exit(0);
}
console.log(issues.join('\n'));
process.exit(errors.length > 0 ? 1 : 0);
