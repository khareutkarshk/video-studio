import type { ProjectFile } from '../types/projectFile';
import type { AssetMeta } from '../types/assets';
import { ASSET_REGISTRY } from '../assets/registry.generated';
import { isValidOutputFormatId } from './projectIO';

export type ValidationIssue = {
  level: 'error' | 'warning';
  path: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

function issue(
  level: ValidationIssue['level'],
  path: string,
  message: string,
): ValidationIssue {
  return { level, path, message };
}

export function validateProjectFile(
  file: ProjectFile,
  registry: AssetMeta[] = ASSET_REGISTRY,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const assetIds = new Set(registry.map((a) => a.id));

  if (!file.settings?.name) {
    issues.push(issue('error', 'settings.name', 'Project name is required'));
  }
  if (!file.settings?.fps || file.settings.fps <= 0) {
    issues.push(issue('error', 'settings.fps', 'FPS must be a positive number'));
  }
  if (!Array.isArray(file.scenes) || file.scenes.length === 0) {
    issues.push(issue('error', 'scenes', 'Project must contain at least one scene'));
  }
  if (file.outputFormatId && !isValidOutputFormatId(file.outputFormatId)) {
    issues.push(issue('warning', 'outputFormatId', `Unknown output format: ${file.outputFormatId}`));
  }

  const sceneIds = new Set<string>();

  for (const scene of file.scenes ?? []) {
    const sp = `scenes.${scene.id}`;

    if (sceneIds.has(scene.id)) {
      issues.push(issue('error', sp, `Duplicate scene id: ${scene.id}`));
    }
    sceneIds.add(scene.id);

    if (!scene.duration || scene.duration <= 0) {
      issues.push(issue('error', `${sp}.duration`, 'Scene duration must be positive'));
    }

    if (scene.backgroundAssetId && !assetIds.has(scene.backgroundAssetId)) {
      issues.push(issue('error', `${sp}.backgroundAssetId`, `Unknown asset: ${scene.backgroundAssetId}`));
    }

    const layerIds = new Set<string>();

    for (const layer of scene.layers ?? []) {
      const lp = `${sp}.layers.${layer.id}`;

      if (layerIds.has(layer.id)) {
        issues.push(issue('error', lp, `Duplicate layer id: ${layer.id}`));
      }
      layerIds.add(layer.id);

      if (!assetIds.has(layer.assetId)) {
        issues.push(issue('error', `${lp}.assetId`, `Unknown asset: ${layer.assetId}`));
      }

      if (layer.startTime < 0 || layer.startTime > scene.duration) {
        issues.push(issue('error', `${lp}.startTime`, `startTime ${layer.startTime} outside scene duration`));
      }
      if (layer.endTime < 0 || layer.endTime > scene.duration) {
        issues.push(issue('error', `${lp}.endTime`, `endTime ${layer.endTime} outside scene duration`));
      }
      if (layer.startTime > layer.endTime) {
        issues.push(issue('error', lp, 'startTime must be <= endTime'));
      }

      if (layer.visible && layer.keyframes.length === 0) {
        issues.push(issue('warning', `${lp}.keyframes`, 'Visible layer has no keyframes'));
      }

      for (const kf of layer.keyframes) {
        if (kf.time < 0 || kf.time > scene.duration) {
          issues.push(issue('error', `${lp}.keyframes`, `Keyframe at ${kf.time}s outside scene duration`));
        }
      }
    }

    for (const track of scene.audioTracks ?? []) {
      if (!assetIds.has(track.assetId)) {
        issues.push(issue('error', `${sp}.audioTracks.${track.id}`, `Unknown audio asset: ${track.assetId}`));
      }
    }
  }

  return {
    valid: !issues.some((i) => i.level === 'error'),
    issues,
  };
}

export function formatValidationResult(result: ValidationResult): string {
  if (result.valid && result.issues.length === 0) return 'Project is valid.';
  return result.issues
    .map((i) => `[${i.level.toUpperCase()}] ${i.path}: ${i.message}`)
    .join('\n');
}
