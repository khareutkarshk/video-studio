import type { AssetMeta } from '../types/assets';
import {
  getAssetAlphaBounds,
  getCharacterSizeRatio,
  getPoseSizeMultiplier,
} from './characterRender';

/** At scale 1.0, a character fills this fraction of frame height (kid-friendly hero size). */
export const CHARACTER_HEIGHT_FRACTION = 0.65;

/** At scale 1.0, a large prop fills this fraction of frame height. */
export const PROP_HEIGHT_FRACTION = 0.38;

/** Ground line as fraction of frame height from center-origin (≈74% from top). */
export const GROUND_Y_FRACTION = 0.24;

export function getGroundY(outputHeight: number): number {
  return outputHeight * GROUND_Y_FRACTION;
}

export function getFrameHeightFraction(outputHeight: number): number {
  return outputHeight * CHARACTER_HEIGHT_FRACTION;
}

export type CharacterVisualBounds = {
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** Visible character bounds in logical coordinates (feet at anchor y). */
export function getCharacterVisualBounds(
  x: number,
  y: number,
  layerScale: number,
  asset: AssetMeta | undefined,
  referenceAlphaHeight: number,
  outputHeight: number,
): CharacterVisualBounds {
  const bounds = getAssetAlphaBounds(asset);
  const poseMultiplier = getPoseSizeMultiplier(asset, referenceAlphaHeight);
  const characterRatio = getCharacterSizeRatio(asset);
  const frameNorm = getFrameHeightFraction(outputHeight) / referenceAlphaHeight;
  const effectiveScale = layerScale * poseMultiplier * characterRatio * frameNorm;
  const height = bounds.height * effectiveScale;
  const width = bounds.width * effectiveScale;
  return {
    width,
    height,
    top: y - height,
    bottom: y,
    left: x - width / 2,
    right: x + width / 2,
  };
}

/**
 * Prevent head clipping only — never shrink for horizontal safe-area edges.
 * Characters walk across the full frame width; side auto-fit made them invisible.
 */
export function computeAutoFitScale(
  x: number,
  y: number,
  layerScale: number,
  asset: AssetMeta | undefined,
  referenceAlphaHeight: number,
  outputHeight: number,
): number {
  if (!asset || asset.type !== 'character') return 1;

  const vb = getCharacterVisualBounds(x, y, layerScale, asset, referenceAlphaHeight, outputHeight);
  const frameTop = -outputHeight / 2 + outputHeight * 0.05;

  if (vb.top >= frameTop || vb.height <= 0) return 1;

  const available = y - frameTop;
  return Math.max(0.85, Math.min(1, available / vb.height));
}
