import type { Layer, OutputFormat } from '../types/project';
import type { AssetMeta } from '../types/assets';
import type { PreviewLayout } from './composition';
import { logicalToScreen } from './composition';
import { getTransformAtTime } from './interpolation';
import { getActivePose } from './pose';
import {
  computeRenderScale,
  getGroundAnchor,
  getPropGroundAnchor,
  getReferenceAlphaHeight,
} from './characterRender';
import { computeAutoFitScale, getCharacterVisualBounds } from './characterFraming';

export type LayerScreenRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getLayerScreenRect(
  layer: Layer,
  time: number,
  layout: PreviewLayout,
  outputFormat: OutputFormat,
  asset: AssetMeta,
  charRefHeights: Map<string, number>,
): LayerScreenRect | null {
  const transform = getTransformAtTime(layer, time);
  const refHeight = getReferenceAlphaHeight(asset, charRefHeights);
  const autoFitScale =
    asset.type === 'character'
      ? computeAutoFitScale(
          transform.x,
          transform.y,
          transform.scale,
          asset,
          refHeight,
          outputFormat.height,
        )
      : 1;
  const renderScale = computeRenderScale(
    transform.scale,
    layout.logicalScale,
    asset,
    refHeight,
    outputFormat.height,
    autoFitScale,
  );

  const nativeW = asset.nativeWidth || asset.width || 100;
  const nativeH = asset.nativeHeight || asset.height || 150;
  const anchor =
    asset.type === 'character'
      ? getGroundAnchor(asset)
      : asset.type === 'prop'
        ? getPropGroundAnchor(asset)
        : { x: nativeW / 2, y: nativeH / 2 };

  const pos = logicalToScreen(transform.x, transform.y, layout);

  if (asset.type === 'character') {
    const vb = getCharacterVisualBounds(
      transform.x,
      transform.y,
      transform.scale * autoFitScale,
      asset,
      refHeight,
      outputFormat.height,
    );
    const topLeft = logicalToScreen(vb.left, vb.top, layout);
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: vb.width * layout.logicalScale,
      height: vb.height * layout.logicalScale,
    };
  }

  return {
    x: pos.x - anchor.x * renderScale,
    y: pos.y - anchor.y * renderScale,
    width: nativeW * renderScale,
    height: nativeH * renderScale,
  };
}

export function getLayerScreenRectAtTime(
  layer: Layer,
  time: number,
  layout: PreviewLayout,
  outputFormat: OutputFormat,
  getAsset: (id: string) => AssetMeta | undefined,
  charRefHeights: Map<string, number>,
): LayerScreenRect | null {
  const activeAssetId = getActivePose(layer, time);
  const asset = getAsset(activeAssetId);
  if (!asset) return null;
  return getLayerScreenRect(layer, time, layout, outputFormat, asset, charRefHeights);
}
