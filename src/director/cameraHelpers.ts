import type { CameraKeyframe, EasingType, Scene } from '../types/project';
import { getTransformAtTime } from '../core/interpolation';

export type CameraPoint = {
  x: number;
  y: number;
  zoom: number;
};

export type CameraHoldOptions = {
  time: number;
  duration?: number;
  x?: number;
  y?: number;
  zoom?: number;
  easing?: EasingType;
};

export type CameraMoveToOptions = {
  startTime: number;
  endTime: number;
  from: CameraPoint;
  to: CameraPoint;
  easing?: EasingType;
};

export type CameraPanOptions = {
  startTime: number;
  endTime: number;
  fromX: number;
  toX: number;
  y?: number;
  zoom?: number;
  easing?: EasingType;
};

export type CameraZoomOptions = {
  startTime: number;
  endTime: number;
  x?: number;
  y?: number;
  fromZoom: number;
  toZoom: number;
  easing?: EasingType;
};

export type CameraFollowOptions = {
  startTime: number;
  endTime: number;
  layerId: string;
  scene: Scene;
  y?: number;
  zoom?: number;
  /** Offset applied to layer x when computing camera x. */
  offsetX?: number;
  easing?: EasingType;
};

export type CameraShakeOptions = {
  time: number;
  duration: number;
  x: number;
  y: number;
  zoom: number;
  intensity?: number;
  easing?: EasingType;
};

const DEFAULT_POINT: CameraPoint = { x: 0, y: 0, zoom: 1 };

/** Hold camera at a position for a duration (or single keyframe). */
export function cameraHold(opts: CameraHoldOptions): CameraKeyframe[] {
  const point: CameraPoint = {
    x: opts.x ?? 0,
    y: opts.y ?? 0,
    zoom: opts.zoom ?? 1,
  };
  const easing = opts.easing ?? 'linear';
  const start: CameraKeyframe = { time: opts.time, ...point, easing };
  if (!opts.duration || opts.duration <= 0) return [start];
  return [
    start,
    { time: opts.time + opts.duration, ...point, easing: 'linear' },
  ];
}

/** Pan and optionally zoom between two camera states. */
export function cameraMoveTo(opts: CameraMoveToOptions): CameraKeyframe[] {
  const easing = opts.easing ?? 'ease-in-out';
  return [
    { time: opts.startTime, ...opts.from, easing },
    { time: opts.endTime, ...opts.to, easing: 'linear' },
  ];
}

/** Horizontal pan with constant y/zoom. */
export function cameraPan(opts: CameraPanOptions): CameraKeyframe[] {
  const y = opts.y ?? 0;
  const zoom = opts.zoom ?? 1;
  return cameraMoveTo({
    startTime: opts.startTime,
    endTime: opts.endTime,
    from: { x: opts.fromX, y, zoom },
    to: { x: opts.toX, y, zoom },
    easing: opts.easing ?? 'ease-in-out',
  });
}

/** Zoom in/out while holding position. */
export function cameraZoom(opts: CameraZoomOptions): CameraKeyframe[] {
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  return cameraMoveTo({
    startTime: opts.startTime,
    endTime: opts.endTime,
    from: { x, y, zoom: opts.fromZoom },
    to: { x, y, zoom: opts.toZoom },
    easing: opts.easing ?? 'ease-in-out',
  });
}

/**
 * Script-driven follow: pan camera to track a layer's x at start and end times.
 * Does not add runtime auto-follow — only generates keyframes.
 */
export function cameraFollow(opts: CameraFollowOptions): CameraKeyframe[] {
  const layer = opts.scene.layers.find((l) => l.id === opts.layerId);
  if (!layer) {
    return cameraHold({
      time: opts.startTime,
      duration: opts.endTime - opts.startTime,
      x: 0,
      y: opts.y ?? 0,
      zoom: opts.zoom ?? 1,
    });
  }

  const offsetX = opts.offsetX ?? 0;
  const startTransform = getTransformAtTime(layer, opts.startTime);
  const endTransform = getTransformAtTime(layer, opts.endTime);
  const y = opts.y ?? 0;
  const zoom = opts.zoom ?? 1;
  const easing = opts.easing ?? 'ease-in-out';

  return [
    {
      time: opts.startTime,
      x: startTransform.x + offsetX,
      y,
      zoom,
      easing,
    },
    {
      time: opts.endTime,
      x: endTransform.x + offsetX,
      y,
      zoom,
      easing: 'linear',
    },
  ];
}

/** Short shake offset keyframes returning to rest. */
export function cameraShake(opts: CameraShakeOptions): CameraKeyframe[] {
  const intensity = opts.intensity ?? 12;
  const { time, duration, x, y, zoom } = opts;
  const mid = time + duration / 2;
  const q1 = time + duration * 0.25;
  const q3 = time + duration * 0.75;

  return [
    { time, x, y, zoom, easing: 'linear' },
    { time: q1, x: x + intensity, y: y - intensity * 0.5, zoom, easing: 'linear' },
    { time: mid, x: x - intensity * 0.8, y: y + intensity * 0.3, zoom, easing: 'linear' },
    { time: q3, x: x + intensity * 0.5, y: y - intensity * 0.2, zoom, easing: 'linear' },
    { time: time + duration, x, y, zoom, easing: 'ease-out' },
  ];
}

/** Merge multiple camera preset keyframe arrays, sorted by time. */
export function mergeCameraKeyframes(...groups: CameraKeyframe[][]): CameraKeyframe[] {
  const merged = groups.flat();
  return merged.sort((a, b) => a.time - b.time);
}

/** Deduplicate keyframes at similar times (within tolerance). Later wins. */
export function dedupeCameraKeyframes(
  keyframes: CameraKeyframe[],
  tolerance = 0.05,
): CameraKeyframe[] {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const result: CameraKeyframe[] = [];
  for (const kf of sorted) {
    const existing = result.findIndex((k) => Math.abs(k.time - kf.time) < tolerance);
    if (existing >= 0) {
      result[existing] = kf;
    } else {
      result.push(kf);
    }
  }
  return result;
}

export { DEFAULT_POINT as DEFAULT_CAMERA_POINT };
