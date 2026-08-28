import type { Keyframe, Layer, PoseSegment, Scene, TransformProps, SceneTransition } from '../types/project';
import { getGroundY } from '../core/characterFraming';

const DEFAULT_GROUND_Y = getGroundY(1080);
const DEFAULT_SCALE = 1.0;

const DEFAULT_CAMERA = {
  keyframes: [{ time: 0, x: 0, y: 0, zoom: 1, easing: 'linear' as const }],
};

export type CreateSceneOptions = {
  id: string;
  name: string;
  duration?: number;
  backgroundAssetId?: string | null;
  transition?: SceneTransition;
};

export type AddLayerOptions = {
  assetId: string;
  id?: string;
  name?: string;
  startTime?: number;
  endTime?: number;
  zIndex?: number;
  keyframes?: Keyframe[];
  poseSegments?: PoseSegment[];
};

let layerCounter = 0;

export function resetLayerCounter(): void {
  layerCounter = 0;
}

export function createScene(options: CreateSceneOptions): Scene {
  const duration = options.duration ?? 5;
  return {
    id: options.id,
    name: options.name,
    duration,
    backgroundAssetId: options.backgroundAssetId ?? null,
    transition: options.transition ?? { type: 'fade', duration: 0.5 },
    camera: structuredClone(DEFAULT_CAMERA),
    audioTracks: [],
    reactionCues: [],
    layers: [],
  };
}

export function setBackground(scene: Scene, assetId: string): Scene {
  return { ...scene, backgroundAssetId: assetId };
}

export function addCharacter(scene: Scene, options: AddLayerOptions): Scene {
  return addLayer(scene, {
    ...options,
    name: options.name ?? options.id ?? `Character ${++layerCounter}`,
  });
}

export function addProp(scene: Scene, options: AddLayerOptions): Scene {
  return addLayer(scene, {
    ...options,
    name: options.name ?? options.id ?? `Prop ${++layerCounter}`,
  });
}

export function addLayer(scene: Scene, options: AddLayerOptions): Scene {
  const id = options.id ?? `layer-${options.assetId}`;
  const layer: Layer = {
    id,
    name: options.name ?? id,
    assetId: options.assetId,
    startTime: options.startTime ?? 0,
    endTime: options.endTime ?? scene.duration,
    zIndex: options.zIndex ?? scene.layers.length + 1,
    visible: true,
    locked: false,
    keyframes: options.keyframes ?? [
      { time: 0, x: 0, y: DEFAULT_GROUND_Y, scale: DEFAULT_SCALE, rotation: 0, opacity: 1, easing: 'linear' },
    ],
    ...(options.poseSegments?.length ? { poseSegments: options.poseSegments } : {}),
  };
  return { ...scene, layers: [...scene.layers, layer] };
}

export function setLayerPoseSegments(scene: Scene, layerId: string, poseSegments: PoseSegment[]): Scene {
  return {
    ...scene,
    layers: scene.layers.map((l) =>
      l.id === layerId ? { ...l, poseSegments: [...poseSegments].sort((a, b) => a.startTime - b.startTime) } : l,
    ),
  };
}

export function addLayerPoseSegment(
  scene: Scene,
  layerId: string,
  segment: PoseSegment,
): Scene {
  return {
    ...scene,
    layers: scene.layers.map((layer) => {
      if (layer.id !== layerId) return layer;
      const segments = [...(layer.poseSegments ?? []), segment].sort((a, b) => a.startTime - b.startTime);
      return { ...layer, poseSegments: segments };
    }),
  };
}

export function setCameraKeyframe(
  scene: Scene,
  keyframe: { time: number; x: number; y: number; zoom: number; easing?: Keyframe['easing'] },
): Scene {
  const existing = scene.camera.keyframes.find((k) => Math.abs(k.time - keyframe.time) < 0.05);
  const keyframes = existing
    ? scene.camera.keyframes.map((k) =>
        Math.abs(k.time - keyframe.time) < 0.05 ? { ...k, ...keyframe } : k,
      )
    : [...scene.camera.keyframes, keyframe];
  return {
    ...scene,
    camera: { keyframes: keyframes.sort((a, b) => a.time - b.time) },
  };
}

export function setLayerKeyframes(scene: Scene, layerId: string, keyframes: Keyframe[]): Scene {
  return {
    ...scene,
    layers: scene.layers.map((l) =>
      l.id === layerId ? { ...l, keyframes: [...keyframes].sort((a, b) => a.time - b.time) } : l,
    ),
  };
}

export function setLayerTransform(
  scene: Scene,
  layerId: string,
  time: number,
  transform: Partial<TransformProps & { easing?: Keyframe['easing'] }>,
): Scene {
  return {
    ...scene,
    layers: scene.layers.map((layer) => {
      if (layer.id !== layerId) return layer;
      const existing = layer.keyframes.find((k) => Math.abs(k.time - time) < 0.05);
      if (existing) {
        return {
          ...layer,
          keyframes: layer.keyframes.map((k) =>
            Math.abs(k.time - time) < 0.05 ? { ...k, ...transform, time } : k,
          ),
        };
      }
      const base = layer.keyframes[0] ?? {
        time: 0, x: 0, y: DEFAULT_GROUND_Y, scale: DEFAULT_SCALE, rotation: 0, opacity: 1, easing: 'linear' as const,
      };
      return {
        ...layer,
        keyframes: [...layer.keyframes, { ...base, ...transform, time }].sort(
          (a, b) => a.time - b.time,
        ),
      };
    }),
  };
}

export function applyKeyframesToLayer(
  scene: Scene,
  layerId: string,
  keyframes: Keyframe[],
): Scene {
  return setLayerKeyframes(scene, layerId, keyframes);
}
