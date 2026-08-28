import type { AssetMeta, AlphaBounds } from '../types/assets';
import { CHARACTER_HEIGHT_FRACTION, PROP_HEIGHT_FRACTION } from './characterFraming';

const DEFAULT_BOUNDS: AlphaBounds = { x: 0, y: 0, width: 1, height: 1 };

export function getAssetAlphaBounds(asset: AssetMeta | undefined): AlphaBounds {
  if (!asset) return DEFAULT_BOUNDS;
  if (asset.alphaBounds && asset.alphaBounds.width > 0 && asset.alphaBounds.height > 0) {
    return asset.alphaBounds;
  }
  const w = asset.nativeWidth || asset.width || 1;
  const h = asset.nativeHeight || asset.height || 1;
  return { x: 0, y: 0, width: w, height: h };
}

/** Ground anchor (feet center) in native image pixel coordinates. */
export function getGroundAnchor(asset: AssetMeta | undefined): { x: number; y: number } {
  const bounds = getAssetAlphaBounds(asset);
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height,
  };
}

/**
 * Pose-to-pose size normalization: taller visible content renders smaller so layer.scale
 * stays visually consistent across pose changes.
 */
export function getPoseSizeMultiplier(
  asset: AssetMeta | undefined,
  referenceAlphaHeight: number,
): number {
  if (!asset || referenceAlphaHeight <= 0) return 1;
  const bounds = getAssetAlphaBounds(asset);
  if (bounds.height <= 0) return 1;
  return referenceAlphaHeight / bounds.height;
}

/** Character-relative sizing from registry metadata (Bogo = 1.0). */
export function getCharacterSizeRatio(asset: AssetMeta | undefined): number {
  return asset?.characterSizeRatio ?? 1;
}

export function getReferenceAlphaHeight(
  asset: AssetMeta | undefined,
  characterReferenceHeights: Map<string, number>,
): number {
  if (!asset?.character) {
    const bounds = getAssetAlphaBounds(asset);
    return bounds.height;
  }
  return characterReferenceHeights.get(asset.character) ?? getAssetAlphaBounds(asset).height;
}

export function buildCharacterReferenceHeights(assets: AssetMeta[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const asset of assets) {
    if (asset.type !== 'character' || !asset.character || !asset.productionReady) continue;
    const bounds = getAssetAlphaBounds(asset);
    if (bounds.height <= 0) continue;

    const isNeutral =
      asset.action === 'idle' &&
      (asset.direction === 'unknown' || asset.direction === 'right' || asset.direction === 'front');
    if (!isNeutral) continue;

    const existing = map.get(asset.character);
    if (existing === undefined || bounds.height > existing) {
      map.set(asset.character, bounds.height);
    }
  }
  return map;
}

/** Bottom-center anchor for props that sit on the ground. */
export function getPropGroundAnchor(asset: AssetMeta | undefined): { x: number; y: number } {
  const bounds = getAssetAlphaBounds(asset);
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height,
  };
}

export function getFrameNormScale(
  asset: AssetMeta | undefined,
  referenceAlphaHeight: number,
  outputHeight: number,
): number {
  if (!asset) return 1;
  const bounds = getAssetAlphaBounds(asset);
  const contentHeight = asset.type === 'character' ? referenceAlphaHeight : bounds.height;
  if (contentHeight <= 0) return 1;

  const fraction =
    asset.type === 'character'
      ? CHARACTER_HEIGHT_FRACTION
      : asset.type === 'prop'
        ? PROP_HEIGHT_FRACTION
        : 1;

  if (asset.type !== 'character' && asset.type !== 'prop') return 1;
  return (outputHeight * fraction) / contentHeight;
}

export function computeRenderScale(
  layerScale: number,
  logicalScale: number,
  asset: AssetMeta | undefined,
  referenceAlphaHeight: number,
  outputHeight: number,
  autoFitScale = 1,
): number {
  const poseMultiplier = getPoseSizeMultiplier(asset, referenceAlphaHeight);
  const characterRatio = getCharacterSizeRatio(asset);
  const frameNorm = getFrameNormScale(asset, referenceAlphaHeight, outputHeight);
  return (
    layerScale *
    autoFitScale *
    logicalScale *
    poseMultiplier *
    characterRatio *
    frameNorm
  );
}
