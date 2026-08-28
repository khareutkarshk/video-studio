import type { Keyframe, Layer, TransformProps } from '../types/project';

const DEFAULT_TRANSFORM: TransformProps = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + 180) % 360) - 180;
  if (diff < -180) diff += 360;
  return a + diff * t;
}

export function getTransformAtTime(layer: Layer, time: number): TransformProps {
  const { keyframes } = layer;
  if (keyframes.length === 0) return { ...DEFAULT_TRANSFORM };

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) {
    const k = sorted[0];
    return { x: k.x, y: k.y, scale: k.scale, rotation: k.rotation, opacity: k.opacity };
  }

  const last = sorted[sorted.length - 1];
  if (time >= last.time) {
    return {
      x: last.x,
      y: last.y,
      scale: last.scale,
      rotation: last.rotation,
      opacity: last.opacity,
    };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (time >= a.time && time <= b.time) {
      const duration = b.time - a.time;
      const t = duration === 0 ? 0 : (time - a.time) / duration;
      return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        scale: lerp(a.scale, b.scale, t),
        rotation: lerpAngle(a.rotation, b.rotation, t),
        opacity: lerp(a.opacity, b.opacity, t),
      };
    }
  }

  return { ...DEFAULT_TRANSFORM };
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
