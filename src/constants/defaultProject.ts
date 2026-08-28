import { getGroundY } from '../core/characterFraming';
import type { Layer, MasterProject, Scene } from '../types/project';
import { PROJECT_DATA_VERSION } from '../types/projectFile';

const GROUND_Y = getGroundY(1080);

const defaultCamera = {
  keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, easing: 'linear' as const }],
};

function makeLayer(
  id: string,
  name: string,
  assetId: string,
  keyframes: Layer['keyframes'],
  zIndex: number,
): Layer {
  return {
    id,
    name,
    assetId,
    startTime: 0,
    endTime: 5,
    zIndex,
    visible: true,
    locked: false,
    keyframes,
  };
}

export function createDefaultScene(id: string, name: string, duration = 5): Scene {
  return {
    id,
    name,
    duration,
    backgroundAssetId: 'characters-background-bg_forest_main',
    transition: { type: 'fade', duration: 0.5 },
    camera: structuredClone(defaultCamera),
    audioTracks: [],
    reactionCues: [],
    layers: [
      makeLayer(
        'pogo',
        'Pogo',
        'characters-pogo-pogo_walk_right',
        [
          { time: 0, x: -700, y: GROUND_Y, scale: 1.0, rotation: 0, opacity: 1, easing: 'linear' },
          { time: 4, x: -200, y: GROUND_Y, scale: 1.0, rotation: 0, opacity: 1, easing: 'ease-in-out' },
        ],
        1,
      ),
    ],
  };
}

export const DEFAULT_PROJECT: MasterProject = {
  name: 'Untitled Animation',
  fps: 30,
  version: PROJECT_DATA_VERSION,
  scenes: [createDefaultScene('scene-1', 'Scene 1')],
};
