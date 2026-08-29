import type { ProjectFile } from '../types/projectFile';
import type { AssetMeta } from '../types/assets';
import type { Scene } from '../types/project';
import { ASSET_REGISTRY } from '../assets/registry.generated';
import { getCharacterReferenceHeightsFromRegistry } from '../assets/registry';
import { isValidOutputFormatId } from './projectIO';
import { getTrackEndTime } from './audioUtils';
import { listSpeakers } from '../director/assetSelection';
import { getCameraAtTime } from './interpolation';
import {
  distanceToViewportEdge,
  getLayerVisualBoundsAtTime,
  getPortraitSafeRect,
  getVisibleLogicalRect,
  isRectInsideViewport,
  LANDSCAPE_OUTPUT,
  PORTRAIT_OUTPUT,
  rectsOverlapHorizontally,
  type LogicalRect,
} from './compositionFraming';

const SAFE_ZONE_X = 280;
const SCENE_IDLE_THRESHOLD = 1.5;
const EDGE_WARNING_THRESHOLD = 40;
const MIN_CHARACTER_SCALE = 0.5;
const MAX_CHARACTER_SCALE = 1.5;
const MIN_CAMERA_ZOOM = 0.5;
const MAX_CAMERA_ZOOM = 2.5;

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

function validatePoseSegments(
  issues: ValidationIssue[],
  lp: string,
  layer: import('../types/project').Layer,
  sceneDuration: number,
  assetIds: Set<string>,
  registryById: Map<string, AssetMeta>,
): void {
  const segments = layer.poseSegments ?? [];
  if (segments.length === 0) return;

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);

  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i];
    const sp = `${lp}.poseSegments[${i}]`;

    if (!assetIds.has(seg.assetId)) {
      issues.push(issue('error', sp, `Unknown pose asset: ${seg.assetId}`));
    }

    const poseAsset = registryById.get(seg.assetId);
    if (poseAsset) {
      if (poseAsset.type === 'character' && !poseAsset.productionReady) {
        issues.push(issue('error', sp, `Pose asset is not production-ready: ${seg.assetId}`));
      }
      if (poseAsset.type === 'character' && !poseAsset.alphaBounds) {
        issues.push(issue('warning', sp, `Pose asset missing alpha bounds metadata: ${seg.assetId}`));
      }
    }

    if (seg.startTime < 0 || seg.startTime > sceneDuration) {
      issues.push(issue('error', sp, `startTime ${seg.startTime} outside scene duration`));
    }
    if (seg.endTime < 0 || seg.endTime > sceneDuration) {
      issues.push(issue('error', sp, `endTime ${seg.endTime} outside scene duration`));
    }
    if (seg.startTime >= seg.endTime) {
      issues.push(issue('error', sp, 'startTime must be < endTime'));
    }
    if (seg.startTime < layer.startTime || seg.endTime > layer.endTime) {
      issues.push(issue('error', sp, 'Pose segment outside layer lifetime'));
    }

    if (i > 0) {
      const prev = sorted[i - 1];
      if (seg.startTime < prev.endTime) {
        issues.push(
          issue('error', sp, `Overlaps previous pose segment (${prev.startTime}–${prev.endTime})`),
        );
      }
    }
  }
}

function validateSceneComposition(
  issues: ValidationIssue[],
  sp: string,
  scene: Scene,
  registryById: Map<string, AssetMeta>,
  charRefHeights: Map<string, number>,
): void {
  const sampleTimes = [0, scene.duration / 2, scene.duration].filter(
    (t, i, arr) => t <= scene.duration && (i === 0 || t !== arr[i - 1]),
  );

  for (const outputFormat of [LANDSCAPE_OUTPUT, PORTRAIT_OUTPUT]) {
    const formatLabel = outputFormat.aspectRatio;

    for (const time of sampleTimes) {
      const camera = getCameraAtTime(scene.camera, time);
      const viewport = getVisibleLogicalRect(camera, outputFormat);
      const cp = `${sp}.camera@${time.toFixed(1)}s[${formatLabel}]`;

      if (camera.zoom < MIN_CAMERA_ZOOM || camera.zoom > MAX_CAMERA_ZOOM) {
        issues.push(
          issue(
            'warning',
            cp,
            `Camera zoom ${camera.zoom.toFixed(2)} outside sensible range (${MIN_CAMERA_ZOOM}–${MAX_CAMERA_ZOOM})`,
          ),
        );
      }

      const characterBounds: LogicalRect[] = [];
      const propBounds: Array<{ name: string; rect: LogicalRect }> = [];

      for (const layer of scene.layers ?? []) {
        if (!layer.visible) continue;
        if (time < layer.startTime || time > layer.endTime) continue;

        const bounds = getLayerVisualBoundsAtTime(
          layer,
          time,
          outputFormat,
          (id) => registryById.get(id),
          charRefHeights,
        );
        if (!bounds) continue;

        const layerAsset = registryById.get(layer.assetId);
        const lp = `${sp}.layers.${layer.id}`;

        if (!isRectInsideViewport(bounds, viewport)) {
          issues.push(
            issue(
              'warning',
              `${lp}@${time.toFixed(1)}s[${formatLabel}]`,
              `${layer.name} may be outside camera view`,
            ),
          );
        }

        const edgeDist = distanceToViewportEdge(bounds, viewport);
        if (edgeDist < EDGE_WARNING_THRESHOLD) {
          issues.push(
            issue(
              'warning',
              `${lp}@${time.toFixed(1)}s[${formatLabel}]`,
              `${layer.name} is close to frame edge (${edgeDist.toFixed(0)} logical units)`,
            ),
          );
        }

        if (layerAsset?.type === 'character') {
          const scale = layer.keyframes.find((k) => k.time <= time)?.scale ?? layer.keyframes[0]?.scale;
          if (scale !== undefined && (scale < MIN_CHARACTER_SCALE || scale > MAX_CHARACTER_SCALE)) {
            issues.push(
              issue(
                'warning',
                `${lp}.keyframes[${formatLabel}]`,
                `Character scale ${scale} may look too small or too large`,
              ),
            );
          }
          characterBounds.push(bounds);
        } else if (layerAsset?.type === 'prop') {
          propBounds.push({ name: layer.name, rect: bounds });
        }
      }

      for (let i = 0; i < characterBounds.length; i++) {
        for (let j = i + 1; j < characterBounds.length; j++) {
          if (rectsOverlapHorizontally(characterBounds[i], characterBounds[j])) {
            issues.push(
              issue(
                'warning',
                `${sp}.layers@${time.toFixed(1)}s[${formatLabel}]`,
                'Characters may overlap horizontally',
              ),
            );
            break;
          }
        }
      }

      for (const charRect of characterBounds) {
        for (const prop of propBounds) {
          if (rectsOverlapHorizontally(charRect, prop.rect)) {
            // Layout is authored in landscape logical space; portrait scale inflates bounds.
            if (outputFormat.aspectRatio !== '16:9') continue;
            issues.push(
              issue(
                'warning',
                `${sp}.layers@${time.toFixed(1)}s[${formatLabel}]`,
                `Character may overlap prop "${prop.name}" — clear spacing unless the script requires contact`,
              ),
            );
          }
        }
      }

      if (outputFormat.aspectRatio === '16:9') {
        const portraitSafe = getPortraitSafeRect(outputFormat);
        for (const layer of scene.layers ?? []) {
          if (!layer.visible) continue;
          const bounds = getLayerVisualBoundsAtTime(
            layer,
            time,
            outputFormat,
            (id) => registryById.get(id),
            charRefHeights,
          );
          if (!bounds) continue;
          if (
            bounds.centerX < portraitSafe.left ||
            bounds.centerX > portraitSafe.right
          ) {
            issues.push(
              issue(
                'warning',
                `${sp}.layers.${layer.id}@${time.toFixed(1)}s`,
                `${layer.name} center may fall outside portrait safe area`,
              ),
            );
          }
        }
      }
    }
  }
}

export function validateProjectFile(
  file: ProjectFile,
  registry: AssetMeta[] = ASSET_REGISTRY,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const assetIds = new Set(registry.map((a) => a.id));
  const registryById = new Map(registry.map((a) => [a.id, a]));

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
  const speakers = listSpeakers();
  const charRefHeights = getCharacterReferenceHeightsFromRegistry();

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

      const layerAsset = registryById.get(layer.assetId);
      if (layerAsset?.type === 'character' && !layerAsset.productionReady) {
        issues.push(issue('error', `${lp}.assetId`, `Character asset is not production-ready: ${layer.assetId}`));
      }
      if (layerAsset?.type === 'character' && !layerAsset.alphaBounds) {
        issues.push(issue('warning', `${lp}.assetId`, `Character asset missing alpha bounds: ${layer.assetId}`));
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

      validatePoseSegments(issues, lp, layer, scene.duration, assetIds, registryById);

      if (layerAsset?.type === 'character') {
        for (const kf of layer.keyframes) {
          if (Math.abs(kf.x) > SAFE_ZONE_X + 400) {
            issues.push(
              issue('warning', `${lp}.keyframes`, `Character X=${kf.x} may clip in 9:16 portrait safe zone`),
            );
            break;
          }
        }
      }
    }

    let maxLayerActivity = 0;
    for (const layer of scene.layers ?? []) {
      for (const kf of layer.keyframes) maxLayerActivity = Math.max(maxLayerActivity, kf.time);
      for (const seg of layer.poseSegments ?? []) maxLayerActivity = Math.max(maxLayerActivity, seg.endTime);
      maxLayerActivity = Math.max(maxLayerActivity, layer.endTime);
    }
    if (scene.duration - maxLayerActivity > SCENE_IDLE_THRESHOLD) {
      issues.push(
        issue(
          'warning',
          `${sp}.duration`,
          `Scene duration (${scene.duration}s) exceeds layer activity (${maxLayerActivity}s) by more than ${SCENE_IDLE_THRESHOLD}s`,
        ),
      );
    }

    const trackIds = new Set<string>();

    for (const track of scene.audioTracks ?? []) {
      const tp = `${sp}.audioTracks.${track.id}`;
      if (trackIds.has(track.id)) {
        issues.push(issue('error', tp, `Duplicate audio track id: ${track.id}`));
      }
      trackIds.add(track.id);

      const isTextOnlyDialogue = track.type === 'dialogue' && !track.assetId;
      const audioAsset = track.assetId ? registryById.get(track.assetId) : undefined;

      if (track.assetId) {
        if (!assetIds.has(track.assetId)) {
          issues.push(issue('error', tp, `Unknown audio asset: ${track.assetId}`));
        } else if (audioAsset && audioAsset.type !== 'audio') {
          issues.push(issue('error', tp, `Asset is not audio type: ${track.assetId}`));
        }
      } else if (track.type !== 'dialogue') {
        issues.push(issue('error', tp, 'Non-dialogue audio track requires assetId'));
      }

      if (track.speaker) {
        if (speakers.length > 0 && !speakers.includes(track.speaker.toUpperCase())) {
          issues.push(
            issue('warning', tp, `Speaker "${track.speaker}" is not a known character`),
          );
        }
      }

      if (track.startTime < 0) {
        issues.push(issue('error', tp, `startTime ${track.startTime} must be >= 0`));
      }
      if (track.startTime > scene.duration) {
        issues.push(issue('error', tp, `startTime ${track.startTime} starts after scene end`));
      }
      if (track.volume < 0 || track.volume > 1) {
        issues.push(issue('error', tp, `volume ${track.volume} must be between 0 and 1`));
      }
      if (track.fadeIn !== undefined && track.fadeIn < 0) {
        issues.push(issue('error', tp, 'fadeIn must be >= 0'));
      }
      if (track.fadeOut !== undefined && track.fadeOut < 0) {
        issues.push(issue('error', tp, 'fadeOut must be >= 0'));
      }
      if (track.duration !== undefined && track.duration <= 0) {
        issues.push(issue('error', tp, 'duration must be positive when set'));
      }

      const endTime = getTrackEndTime(track, audioAsset?.durationSeconds);
      if (!isTextOnlyDialogue || track.duration !== undefined) {
        if (endTime > scene.duration) {
          issues.push(
            issue(
              'warning',
              tp,
              `Audio clip ends at ${endTime.toFixed(2)}s, beyond scene duration ${scene.duration}s`,
            ),
          );
        }
      }
    }

    for (const cue of scene.reactionCues ?? []) {
      const rp = `${sp}.reactionCues.${cue.id}`;
      if (cue.startTime < 0) {
        issues.push(issue('error', rp, `startTime ${cue.startTime} must be >= 0`));
      }
      if (cue.startTime > scene.duration) {
        issues.push(issue('warning', rp, `Reaction cue starts after scene end`));
      }
      if (speakers.length > 0 && !speakers.includes(cue.speaker.toUpperCase())) {
        issues.push(issue('warning', rp, `Speaker "${cue.speaker}" is not a known character`));
      }
    }

    validateSceneComposition(issues, sp, scene, registryById, charRefHeights);
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
