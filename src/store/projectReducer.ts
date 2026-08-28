import type {
  MasterProject,
  OutputFormat,
  Scene,
  Layer,
  Keyframe,
  AudioTrack,
  CameraKeyframe,
} from '../types/project';
import type { EditorState, PlaybackState, Selection } from '../types/editor';
import { DEFAULT_PROJECT, createDefaultScene } from '../constants/defaultProject';
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

const HISTORY_LIMIT = 50;

export type HistoryState = {
  past: AppState[];
  present: AppState;
  future: AppState[];
};

export type AppAction =
  | { type: 'SET_OUTPUT_FORMAT'; format: OutputFormat }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_PLAYBACK_STATE'; state: PlaybackState }
  | { type: 'SELECT'; selection: Selection }
  | { type: 'SET_BACKGROUND'; assetId: string }
  | { type: 'ADD_OR_SELECT_LAYER'; assetId: string; layerId: string; name?: string }
  | { type: 'UPDATE_LAYER_TRANSFORM'; layerId: string; transform: Partial<Keyframe> }
  | { type: 'UPDATE_KEYFRAME'; layerId: string; keyframeTime: number; updates: Partial<Keyframe> }
  | { type: 'ADD_KEYFRAME'; layerId: string; time?: number }
  | { type: 'SELECT_KEYFRAME'; layerId: string; keyframeTime: number }
  | { type: 'RESET_PROJECT' }
  | { type: 'LOAD_PROJECT'; project: MasterProject; outputFormatId?: string }
  | { type: 'SET_PROJECT_NAME'; name: string }
  | { type: 'ADD_SCENE' }
  | { type: 'DELETE_SCENE'; sceneId: string }
  | { type: 'DUPLICATE_SCENE'; sceneId: string }
  | { type: 'SET_ACTIVE_SCENE'; sceneId: string }
  | { type: 'UPDATE_SCENE'; sceneId: string; updates: Partial<Pick<Scene, 'name' | 'duration' | 'transition'>> }
  | { type: 'DELETE_LAYER'; layerId: string }
  | { type: 'TOGGLE_LAYER_VISIBLE'; layerId: string }
  | { type: 'TOGGLE_LAYER_LOCK'; layerId: string }
  | { type: 'REORDER_LAYER'; layerId: string; direction: 'up' | 'down' }
  | { type: 'RENAME_LAYER'; layerId: string; name: string }
  | { type: 'SET_LAYER_ASSET'; layerId: string; assetId: string }
  | { type: 'UPDATE_CAMERA'; keyframe: CameraKeyframe }
  | { type: 'ADD_AUDIO_TRACK'; assetId: string; name: string }
  | { type: 'REMOVE_AUDIO_TRACK'; trackId: string }
  | { type: 'UPDATE_AUDIO_TRACK'; trackId: string; updates: Partial<AudioTrack> }
  | { type: 'SET_EXPORT_STATUS'; progress: number | null; message: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export const initialAppState: AppState = {
  project: structuredClone(DEFAULT_PROJECT),
  outputFormat: DEFAULT_OUTPUT_FORMAT,
  editor: {
    activeSceneId: DEFAULT_PROJECT.scenes[0].id,
    currentTime: 0,
    playbackState: 'stopped',
    selection: { type: 'layer', layerId: 'pogo' },
    exportProgress: null,
    exportMessage: null,
  },
};

export const initialHistoryState: HistoryState = {
  past: [],
  present: initialAppState,
  future: [],
};

const NO_HISTORY: AppAction['type'][] = [
  'SET_CURRENT_TIME',
  'SET_PLAYBACK_STATE',
  'SELECT',
  'SELECT_KEYFRAME',
  'SET_EXPORT_STATUS',
  'UNDO',
  'REDO',
];

function getActiveScene(state: AppState): Scene {
  return (
    state.project.scenes.find((s) => s.id === state.editor.activeSceneId) ??
    state.project.scenes[0]
  );
}

function updateSceneInProject(
  project: MasterProject,
  sceneId: string,
  updater: (scene: Scene) => Scene,
): MasterProject {
  return {
    ...project,
    scenes: project.scenes.map((s) => (s.id === sceneId ? updater(s) : s)),
  };
}

function updateActiveScene(state: AppState, updater: (scene: Scene) => Scene): AppState {
  return {
    ...state,
    project: updateSceneInProject(state.project, state.editor.activeSceneId, updater),
  };
}

function updateLayer(scene: Scene, layerId: string, updater: (layer: Layer) => Layer): Scene {
  return {
    ...scene,
    layers: scene.layers.map((l) => (l.id === layerId ? updater(l) : l)),
  };
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.format };

    case 'SET_CURRENT_TIME':
      return { ...state, editor: { ...state.editor, currentTime: action.time } };

    case 'SET_PLAYBACK_STATE':
      return { ...state, editor: { ...state.editor, playbackState: action.state } };

    case 'SELECT':
      return { ...state, editor: { ...state.editor, selection: action.selection } };

    case 'SET_PROJECT_NAME':
      return { ...state, project: { ...state.project, name: action.name } };

    case 'LOAD_PROJECT': {
      const scenes = action.project.scenes;
      return {
        ...state,
        project: action.project,
        editor: {
          ...state.editor,
          activeSceneId: scenes[0]?.id ?? 'scene-1',
          currentTime: 0,
          playbackState: 'stopped',
          selection: { type: 'none' },
          exportProgress: null,
          exportMessage: null,
        },
      };
    }

    case 'SET_BACKGROUND':
      return updateActiveScene(state, (scene) => ({
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
      const assetName = action.name ?? action.layerId;
      const newLayer: Layer = {
        id: action.layerId,
        name: assetName,
        assetId: action.assetId,
        startTime: 0,
        endTime: scene.duration,
        zIndex: scene.layers.length + 1,
        visible: true,
        locked: false,
        keyframes: [
          { time: 0, x: 0, y: 0, scale: 0.7, rotation: 0, opacity: 1, easing: 'linear' },
        ],
      };
      return {
        ...updateActiveScene(state, (scene) => ({
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
      if (!layer || layer.locked) return state;

      const time = state.editor.currentTime;
      const existingKf = layer.keyframes.find((k) => Math.abs(k.time - time) < 0.05);

      if (existingKf) {
        return updateActiveScene(state, (scene) =>
          updateLayer(scene, layerId, (l) =>
            updateKeyframeInLayer(l, existingKf.time, transform),
          ),
        );
      }

      const currentTransform = getTransformAtTime(layer, time);
      const merged = { ...currentTransform, ...transform };
      const tempLayer = addKeyframeToLayer(layer, { time, ...merged });

      return updateActiveScene(state, (scene) =>
        updateLayer(scene, layerId, () => tempLayer),
      );
    }

    case 'UPDATE_KEYFRAME':
      return updateActiveScene(state, (scene) =>
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
        ...updateActiveScene(state, (scene) =>
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

    case 'ADD_SCENE': {
      const id = newId('scene');
      const num = state.project.scenes.length + 1;
      const newScene = createDefaultScene(id, `Scene ${num}`);
      newScene.layers = [];
      newScene.backgroundAssetId = getActiveScene(state).backgroundAssetId;
      return {
        ...state,
        project: { ...state.project, scenes: [...state.project.scenes, newScene] },
        editor: {
          ...state.editor,
          activeSceneId: id,
          currentTime: 0,
          playbackState: 'stopped',
          selection: { type: 'none' },
        },
      };
    }

    case 'DELETE_SCENE': {
      if (state.project.scenes.length <= 1) return state;
      const scenes = state.project.scenes.filter((s) => s.id !== action.sceneId);
      const activeSceneId =
        state.editor.activeSceneId === action.sceneId
          ? scenes[0].id
          : state.editor.activeSceneId;
      return {
        ...state,
        project: { ...state.project, scenes },
        editor: {
          ...state.editor,
          activeSceneId,
          currentTime: 0,
          selection: { type: 'none' },
        },
      };
    }

    case 'DUPLICATE_SCENE': {
      const source = state.project.scenes.find((s) => s.id === action.sceneId);
      if (!source) return state;
      const id = newId('scene');
      const copy = structuredClone(source);
      copy.id = id;
      copy.name = `${source.name} Copy`;
      return {
        ...state,
        project: { ...state.project, scenes: [...state.project.scenes, copy] },
        editor: { ...state.editor, activeSceneId: id, currentTime: 0, selection: { type: 'none' } },
      };
    }

    case 'SET_ACTIVE_SCENE':
      return {
        ...state,
        editor: {
          ...state.editor,
          activeSceneId: action.sceneId,
          currentTime: 0,
          playbackState: 'stopped',
          selection: { type: 'none' },
        },
      };

    case 'UPDATE_SCENE':
      return {
        ...state,
        project: updateSceneInProject(state.project, action.sceneId, (scene) => ({
          ...scene,
          ...action.updates,
        })),
      };

    case 'DELETE_LAYER':
      return {
        ...updateActiveScene(state, (scene) => ({
          ...scene,
          layers: scene.layers.filter((l) => l.id !== action.layerId),
        })),
        editor: { ...state.editor, selection: { type: 'none' } },
      };

    case 'TOGGLE_LAYER_VISIBLE':
      return updateActiveScene(state, (scene) =>
        updateLayer(scene, action.layerId, (l) => ({ ...l, visible: !l.visible })),
      );

    case 'TOGGLE_LAYER_LOCK':
      return updateActiveScene(state, (scene) =>
        updateLayer(scene, action.layerId, (l) => ({ ...l, locked: !l.locked })),
      );

    case 'REORDER_LAYER': {
      const scene = getActiveScene(state);
      const layers = [...scene.layers].sort((a, b) => a.zIndex - b.zIndex);
      const idx = layers.findIndex((l) => l.id === action.layerId);
      if (idx < 0) return state;
      const swapIdx = action.direction === 'up' ? idx + 1 : idx - 1;
      if (swapIdx < 0 || swapIdx >= layers.length) return state;
      const a = layers[idx];
      const b = layers[swapIdx];
      const aZ = a.zIndex;
      a.zIndex = b.zIndex;
      b.zIndex = aZ;
      return updateActiveScene(state, (s) => ({ ...s, layers: [...layers] }));
    }

    case 'RENAME_LAYER':
      return updateActiveScene(state, (scene) =>
        updateLayer(scene, action.layerId, (l) => ({ ...l, name: action.name })),
      );

    case 'SET_LAYER_ASSET':
      return updateActiveScene(state, (scene) =>
        updateLayer(scene, action.layerId, (l) => ({ ...l, assetId: action.assetId })),
      );

    case 'UPDATE_CAMERA':
      return updateActiveScene(state, (scene) => {
        const kfs = scene.camera.keyframes;
        const existing = kfs.find((k) => Math.abs(k.time - action.keyframe.time) < 0.05);
        const keyframes = existing
          ? kfs.map((k) =>
              Math.abs(k.time - action.keyframe.time) < 0.05 ? { ...k, ...action.keyframe } : k,
            )
          : [...kfs, action.keyframe];
        return {
          ...scene,
          camera: {
            keyframes: keyframes.sort((a, b) => a.time - b.time),
          },
        };
      });

    case 'ADD_AUDIO_TRACK':
      return updateActiveScene(state, (scene) => ({
        ...scene,
        audioTracks: [
          ...scene.audioTracks,
          {
            id: newId('audio'),
            assetId: action.assetId,
            name: action.name,
            startTime: 0,
            volume: 1,
          },
        ],
      }));

    case 'REMOVE_AUDIO_TRACK':
      return updateActiveScene(state, (scene) => ({
        ...scene,
        audioTracks: scene.audioTracks.filter((t) => t.id !== action.trackId),
      }));

    case 'UPDATE_AUDIO_TRACK':
      return updateActiveScene(state, (scene) => ({
        ...scene,
        audioTracks: scene.audioTracks.map((t) =>
          t.id === action.trackId ? { ...t, ...action.updates } : t,
        ),
      }));

    case 'SET_EXPORT_STATUS':
      return {
        ...state,
        editor: {
          ...state.editor,
          exportProgress: action.progress,
          exportMessage: action.message,
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
          exportProgress: null,
          exportMessage: null,
        },
      };

    default:
      return state;
  }
}

export function historyReducer(state: HistoryState, action: AppAction): HistoryState {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1),
    };
  }

  const nextPresent = appReducer(state.present, action);

  if (nextPresent === state.present) return state;

  if (NO_HISTORY.includes(action.type)) {
    return { ...state, present: nextPresent };
  }

  return {
    past: [...state.past, state.present].slice(-HISTORY_LIMIT),
    present: nextPresent,
    future: [],
  };
}

export function getActiveSceneFromState(state: AppState): Scene {
  return getActiveScene(state);
}

export function getSelectedLayer(state: AppState): Layer | undefined {
  const { selection } = state.editor;
  if (selection.type === 'none') return undefined;
  const scene = getActiveScene(state);
  return scene.layers.find((l) => l.id === selection.layerId);
}

export function getTotalDuration(project: MasterProject): number {
  return project.scenes.reduce((sum, s) => sum + s.duration, 0);
}

export function getSceneStartTimes(project: MasterProject): Map<string, number> {
  const map = new Map<string, number>();
  let t = 0;
  for (const scene of project.scenes) {
    map.set(scene.id, t);
    t += scene.duration;
  }
  return map;
}

export { appReducer };
