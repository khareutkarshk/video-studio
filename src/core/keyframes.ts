import type { Keyframe, Layer, TransformProps } from '../types/project';
import { findKeyframeAtTime, getTransformAtTime } from './interpolation';

export function sortKeyframes(keyframes: Keyframe[]): Keyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

export function createKeyframeFromTransform(
  time: number,
  transform: TransformProps,
): Keyframe {
  return {
    time,
    x: transform.x,
    y: transform.y,
    scale: transform.scale,
    rotation: transform.rotation,
    opacity: transform.opacity,
  };
}

export function addKeyframeToLayer(layer: Layer, keyframe: Keyframe): Layer {
  const existing = findKeyframeAtTime(layer, keyframe.time);
  let keyframes: Keyframe[];

  if (existing) {
    keyframes = layer.keyframes.map((k) =>
      Math.abs(k.time - keyframe.time) < 0.05 ? { ...k, ...keyframe } : k,
    );
  } else {
    keyframes = [...layer.keyframes, keyframe];
  }

  return { ...layer, keyframes: sortKeyframes(keyframes) };
}

export function updateKeyframeInLayer(
  layer: Layer,
  keyframeTime: number,
  updates: Partial<Keyframe>,
): Layer {
  let keyframes = layer.keyframes.map((k) =>
    Math.abs(k.time - keyframeTime) < 0.05 ? { ...k, ...updates } : k,
  );

  if (updates.time !== undefined && Math.abs(updates.time - keyframeTime) >= 0.05) {
    keyframes = layer.keyframes
      .filter((k) => Math.abs(k.time - keyframeTime) >= 0.05)
      .concat([
        {
          ...(layer.keyframes.find((k) => Math.abs(k.time - keyframeTime) < 0.05) ?? {
            time: keyframeTime,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
          }),
          ...updates,
        },
      ]);
  }

  return { ...layer, keyframes: sortKeyframes(keyframes) };
}

export function deleteKeyframeFromLayer(layer: Layer, keyframeTime: number): Layer {
  return {
    ...layer,
    keyframes: layer.keyframes.filter((k) => Math.abs(k.time - keyframeTime) >= 0.05),
  };
}

export function captureKeyframeAtTime(layer: Layer, time: number): Keyframe {
  const transform = getTransformAtTime(layer, time);
  return createKeyframeFromTransform(time, transform);
}
