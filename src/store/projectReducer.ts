import type { MasterProject, OutputFormat, Scene, Layer, Keyframe } from '../types/project';
import type { EditorState, PlaybackState, Selection } from '../types/editor';
import { DEFAULT_PROJECT } from '../constants/defaultProject';
import { DEFAULT_OUTPUT_FORMAT } from '../constants/outputPresets';
import {
  addKeyframeToLayer,
  updateKeyframeInLayer,
  captureKeyframeAtTime,
} from '../core/keyframes';
import { getTransformAtTime } from '../core/interpolation';

export type AppState = {
  project: MasterProject;
  outputFormat: OutputFormat;
  editor: EditorState;
};

export type AppAction =
  | { type: 'SET_OUTPUT_FORMAT'; format: OutputFormat }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_PLAYBACK_STATE'; state: PlaybackState }
  | { type: 'SELECT'; selection: Selection }
  | { type: 'SET_BACKGROUND'; assetId: string }
  | { type: 'ADD_OR_SELECT_LAYER'; assetId: string; layerId: string }
  | { type: 'UPDATE_LAYER_TRANSFORM'; layerId: string; transform: Partial<Keyframe> }
  | { type: 'UPDATE_KEYFRAME'; layerId: string; keyframeTime: number; updates: Partial<Keyframe> }
  | { type: 'ADD_KEYFRAME'; layerId: string; time?: number }
  | { type: 'SELECT_KEYFRAME'; layerId: string; keyframeTime: number }
  | { type: 'RESET_PROJECT' };

export const initialState: AppState = {
  project: structuredClone(DEFAULT_PROJECT),
  outputFormat: DEFAULT_OUTPUT_FORMAT,
  editor: {
    activeSceneId: DEFAULT_PROJECT.scenes[0].id,
    currentTime: 0,
    playbackState: 'stopped',
    selection: { type: 'layer', layerId: 'pogo' },
  },
};

function getActiveScene(state: AppState): Scene {
  return (
    state.project.scenes.find((s) => s.id === state.editor.activeSceneId) ??
    state.project.scenes[0]
  );
}

function updateScene(state: AppState, updater: (scene: Scene) => Scene): AppState {
  const activeId = state.editor.activeSceneId;
  return {
    ...state,
    project: {
      ...state.project,
      scenes: state.project.scenes.map((s) => (s.id === activeId ? updater(s) : s)),
    },
  };
}

function updateLayer(
  scene: Scene,
  layerId: string,
  updater: (layer: Layer) => Layer,
): Scene {
  return {
    ...scene,
    layers: scene.layers.map((l) => (l.id === layerId ? updater(l) : l)),
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.format };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        editor: { ...state.editor, currentTime: action.time },
      };

    case 'SET_PLAYBACK_STATE':
      return {
        ...state,
        editor: { ...state.editor, playbackState: action.state },
      };

    case 'SELECT':
      return {
        ...state,
        editor: { ...state.editor, selection: action.selection },
      };

    case 'SET_BACKGROUND':
      return updateScene(state, (scene) => ({
        ...scene,
        backgroundAssetId: action.assetId,
      }));

    case 'ADD_OR_SELECT_LAYER': {
      const scene = getActiveScene(state);
      const existing = scene.layers.find((l) => l.id === action.layerId);
      if (existing) {
        return {
          ...state,
          editor: {
            ...state.editor,
            selection: { type: 'layer', layerId: action.layerId },
          },
        };
      }
      const newLayer: Layer = {
        id: action.layerId,
        assetId: action.assetId,
        startTime: 0,
        endTime: scene.duration,
        zIndex: scene.layers.length + 1,
        keyframes: [
          {
            time: 0,
            x: 0,
            y: 0,
            scale: 0.7,
            rotation: 0,
            opacity: 1,
          },
        ],
      };
      return {
        ...updateScene(state, (scene) => ({
          ...scene,
          layers: [...scene.layers, newLayer],
        })),
        editor: {
          ...state.editor,
          selection: { type: 'layer', layerId: action.layerId },
        },
      };
    }

    case 'UPDATE_LAYER_TRANSFORM': {
      const { layerId, transform } = action;
      const scene = getActiveScene(state);
      const layer = scene.layers.find((l) => l.id === layerId);
      if (!layer) return state;

      const time = state.editor.currentTime;
      const existingKf = layer.keyframes.find((k) => Math.abs(k.time - time) < 0.05);

      if (existingKf) {
        return updateScene(state, (scene) =>
          updateLayer(scene, layerId, (l) =>
            updateKeyframeInLayer(l, existingKf.time, transform),
          ),
        );
      }

      // No keyframe at current time — update nearest or create interpolated value
      const currentTransform = getTransformAtTime(layer, time);
      const merged = { ...currentTransform, ...transform };
      const tempLayer = addKeyframeToLayer(layer, {
        time,
        ...merged,
      });

      return updateScene(state, (scene) =>
        updateLayer(scene, layerId, () => tempLayer),
      );
    }

    case 'UPDATE_KEYFRAME':
      return updateScene(state, (scene) =>
        updateLayer(scene, action.layerId, (l) =>
          updateKeyframeInLayer(l, action.keyframeTime, action.updates),
        ),
      );

    case 'ADD_KEYFRAME': {
      const { layerId } = action;
      const time = action.time ?? state.editor.currentTime;
      const scene = getActiveScene(state);
      const layer = scene.layers.find((l) => l.id === layerId);
      if (!layer) return state;

      const keyframe = captureKeyframeAtTime(layer, time);
      return {
        ...updateScene(state, (scene) =>
          updateLayer(scene, layerId, (l) => addKeyframeToLayer(l, keyframe)),
        ),
        editor: {
          ...state.editor,
          selection: { type: 'keyframe', layerId, keyframeTime: keyframe.time },
        },
      };
    }

    case 'SELECT_KEYFRAME':
      return {
        ...state,
        editor: {
          ...state.editor,
          currentTime: action.keyframeTime,
          selection: {
            type: 'keyframe',
            layerId: action.layerId,
            keyframeTime: action.keyframeTime,
          },
        },
      };

    case 'RESET_PROJECT':
      return {
        project: structuredClone(DEFAULT_PROJECT),
        outputFormat: state.outputFormat,
        editor: {
          activeSceneId: DEFAULT_PROJECT.scenes[0].id,
          currentTime: 0,
          playbackState: 'stopped',
          selection: { type: 'layer', layerId: 'pogo' },
        },
      };

    default:
      return state;
  }
}

export function getActiveSceneFromState(state: AppState): Scene {
  return getActiveScene(state);
}

export function getSelectedLayer(state: AppState): Layer | undefined {
  const { selection } = state.editor;
  if (selection.type === 'none') return undefined;
  const scene = getActiveScene(state);
  const layerId = selection.type === 'layer' ? selection.layerId : selection.layerId;
  return scene.layers.find((l) => l.id === layerId);
}
