import type { Camera, CameraKeyframe, Keyframe, Layer, TransformProps } from '../types/project';
import { applyEasing } from './easing';

const DEFAULT_TRANSFORM: TransformProps = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
};

const DEFAULT_CAMERA = { x: 0, y: 0, zoom: 1 };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return a + diff * t;
}

function interpolateKeyframes<T extends { time: number; easing?: import('../types/project').EasingType }>(
  keyframes: T[],
  time: number,
  blend: (a: T, b: T, t: number) => T,
  fallback: T,
): T {
  if (keyframes.length === 0) return fallback;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0];
  const last = sorted[sorted.length - 1];
  if (time >= last.time) return last;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (time >= a.time && time <= b.time) {
      const duration = b.time - a.time;
      const rawT = duration === 0 ? 0 : (time - a.time) / duration;
      const t = applyEasing(rawT, a.easing ?? 'linear');
      return blend(a, b, t);
    }
  }
  return fallback;
}

export function getTransformAtTime(layer: Layer, time: number): TransformProps {
  return interpolateKeyframes(
    layer.keyframes,
    time,
    (a, b, t) => ({
      time: lerp(a.time, b.time, t),
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      scale: lerp(a.scale, b.scale, t),
      rotation: lerpAngle(a.rotation, b.rotation, t),
      opacity: lerp(a.opacity, b.opacity, t),
      easing: a.easing,
    }),
    { time: 0, ...DEFAULT_TRANSFORM },
  );
}

export function getCameraAtTime(camera: Camera, time: number): CameraKeyframe {
  return interpolateKeyframes(
    camera.keyframes,
    time,
    (a, b, t) => ({
      time: lerp(a.time, b.time, t),
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      zoom: lerp(a.zoom, b.zoom, t),
      easing: a.easing,
    }),
    { time: 0, ...DEFAULT_CAMERA },
  );
}

export function findKeyframeAtTime(
  layer: Layer,
  time: number,
  tolerance = 0.05,
): Keyframe | undefined {
  return layer.keyframes.find((k) => Math.abs(k.time - time) < tolerance);
}

export function findKeyframeIndexAtTime(
  layer: Layer,
  time: number,
  tolerance = 0.05,
): number {
  return layer.keyframes.findIndex((k) => Math.abs(k.time - time) < tolerance);
}

export function getSceneTransitionOpacity(
  localTime: number,
  sceneDuration: number,
  transitionIn: { type: string; duration: number },
  transitionOut: { type: string; duration: number },
): number {
  let opacity = 1;
  if (transitionIn.type !== 'none' && localTime < transitionIn.duration) {
    opacity = localTime / transitionIn.duration;
  }
  if (transitionOut.type !== 'none') {
    const fadeStart = sceneDuration - transitionOut.duration;
    if (localTime > fadeStart) {
      opacity *= Math.max(0, 1 - (localTime - fadeStart) / transitionOut.duration);
    }
  }
  return opacity;
}
