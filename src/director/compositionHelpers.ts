import { getGroundY } from '../core/characterFraming';
import type { Scene } from '../types/project';
import { getTransformAtTime } from '../core/interpolation';

export const REFERENCE_WIDTH = 1920;
export const REFERENCE_HEIGHT = 1080;

export const DEFAULT_CHARACTER_SCALE = 1.0;
export const DEFAULT_PROP_SCALE = 0.85;

export const MIN_CHARACTER_SPACING = 180;
export const OFFSCREEN_X = 900;
export const SAFE_ZONE_X = 280;
export const FLY_Y_OFFSET = 200;

export { getGroundY };

export function getDefaultGroundY(): number {
  return getGroundY(REFERENCE_HEIGHT);
}

export function getOffscreenX(side: 'left' | 'right'): number {
  return side === 'left' ? -OFFSCREEN_X : OFFSCREEN_X;
}

export function getFlyY(): number {
  return getDefaultGroundY() - FLY_Y_OFFSET;
}

export function getSafeZoneBounds(): { left: number; right: number } {
  return { left: -SAFE_ZONE_X, right: SAFE_ZONE_X };
}

export function clampToSafeZone(x: number): number {
  const { left, right } = getSafeZoneBounds();
  return Math.max(left, Math.min(right, x));
}

/** Place character to the left of a target when facing right (and vice versa). */
export function placeCharacterFacingTarget(opts: {
  targetX: number;
  direction?: 'left' | 'right';
  spacing?: number;
}): number {
  const direction = opts.direction ?? 'right';
  const spacing = opts.spacing ?? MIN_CHARACTER_SPACING;
  return direction === 'right' ? opts.targetX - spacing : opts.targetX + spacing;
}

/** Pick walk pose direction from movement (not entry side). */
export function getCharacterWalkDirection(startX: number, endX: number): 'left' | 'right' {
  return endX < startX ? 'left' : 'right';
}

/**
 * Copy end transform from a previous scene layer to t=0 of matching layer in next scene.
 * Used when consecutive scenes share location/background.
 */
export function carryLayerContinuity(
  prevScene: Scene,
  nextScene: Scene,
  match: (layer: Scene['layers'][number]) => boolean,
): Scene {
  const prevLayer = prevScene.layers.find(match);
  if (!prevLayer) return nextScene;

  const endTime = Math.min(prevLayer.endTime, prevScene.duration);
  const endTransform = getTransformAtTime(prevLayer, endTime);

  return {
    ...nextScene,
    layers: nextScene.layers.map((layer) => {
      if (!match(layer)) return layer;
      const base = layer.keyframes[0];
      if (!base) return layer;
      const updatedFirst = {
        ...base,
        time: 0,
        x: endTransform.x,
        y: endTransform.y,
        scale: endTransform.scale,
      };
      const rest = layer.keyframes.slice(1).map((kf) => ({
        ...kf,
        y: kf.time === 0 ? endTransform.y : kf.y,
      }));
      return {
        ...layer,
        keyframes: [updatedFirst, ...rest.filter((k) => k.time > 0)],
      };
    }),
  };
}

/** Place a prop in front of a character based on facing direction. */
export function placePropRelativeToCharacter(opts: {
  characterX: number;
  direction?: 'left' | 'right';
  gap?: number;
  /** Extra anchor gap for wide props (e.g. giant egg). */
  visualGap?: number;
}): number {
  const direction = opts.direction ?? 'right';
  const gap = opts.visualGap ?? opts.gap ?? MIN_CHARACTER_SPACING * 0.75;
  return direction === 'right' ? opts.characterX + gap : opts.characterX - gap;
}

/** Ensure horizontal positions maintain minimum spacing (returns adjusted copy). */
export function ensureCharacterSpacing(positions: number[], minGap = MIN_CHARACTER_SPACING): number[] {
  if (positions.length <= 1) return [...positions];
  const sorted = [...positions].sort((a, b) => a - b);
  const result = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = result[result.length - 1];
    result.push(Math.max(sorted[i], prev + minGap));
  }
  return result;
}
