import type { Scene } from '../types/project';
import type { ProjectFile } from '../types/projectFile';
import { PROJECT_DATA_VERSION, PROJECT_FILE_VERSION } from '../types/projectFile';

export type CreateProjectFileOptions = {
  name: string;
  fps?: number;
  outputFormatId?: string;
  scenes: Scene[];
};

export function createProjectFile(options: CreateProjectFileOptions): ProjectFile {
  return {
    fileVersion: PROJECT_FILE_VERSION,
    settings: {
      name: options.name,
      fps: options.fps ?? 30,
      version: PROJECT_DATA_VERSION,
    },
    outputFormatId: options.outputFormatId ?? 'youtube-landscape',
    scenes: options.scenes,
  };
}

export {
  createScene,
  addCharacter,
  addProp,
  setBackground,
  setCameraKeyframe,
  setLayerTransform,
  applyKeyframesToLayer,
  setLayerKeyframes,
  setLayerPoseSegments,
  addLayerPoseSegment,
  resetLayerCounter,
} from './sceneHelpers';
export * from './presets';
export * from './poseHelpers';
export * from './visualBeats';
export * from './timing';
export * from './assetSelection';
export * from './compositionHelpers';
export * from './audioHelpers';
export { buildForestEggEpisode } from './episodes/forestEggEpisode';
export { findAsset, findAssets, findBackground, findProp, findCharacterPose, findAudio, getAssetCatalogSummary } from '../assets/assetQuery';
