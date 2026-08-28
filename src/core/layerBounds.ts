import type { CameraKeyframe, Layer, OutputFormat } from '../types/project';
import type { AssetMeta } from '../types/assets';
import type { PreviewLayout } from './composition';
import { logicalToScreenWithCamera } from './composition';
import { getTransformAtTime } from './interpolation';
import { getActivePose } from './pose';
import {
  computeRenderScale,
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
  camera: Pick<CameraKeyframe, 'x' | 'y' | 'zoom'>,
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
  const zoom = camera.zoom;
  const ls = layout.logicalScale;

  if (asset.type === 'character') {
    const vb = getCharacterVisualBounds(
      transform.x,
      transform.y,
      transform.scale * autoFitScale,
      asset,
      refHeight,
      outputFormat.height,
    );
    const topLeft = logicalToScreenWithCamera(vb.left, vb.top, layout, camera);
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: vb.width * ls * zoom,
      height: vb.height * ls * zoom,
    };
  }

  const anchor =
    asset.type === 'prop'
      ? getPropGroundAnchor(asset)
      : { x: nativeW / 2, y: nativeH / 2 };
  const pos = logicalToScreenWithCamera(transform.x, transform.y, layout, camera);
  const scaledRender = renderScale * zoom;

  return {
    x: pos.x - anchor.x * scaledRender,
    y: pos.y - anchor.y * scaledRender,
    width: nativeW * scaledRender,
    height: nativeH * scaledRender,
  };
}

export function getLayerScreenRectAtTime(
  layer: Layer,
  time: number,
  layout: PreviewLayout,
  outputFormat: OutputFormat,
  getAsset: (id: string) => AssetMeta | undefined,
  charRefHeights: Map<string, number>,
  camera: Pick<CameraKeyframe, 'x' | 'y' | 'zoom'>,
): LayerScreenRect | null {
  const activeAssetId = getActivePose(layer, time);
  const asset = getAsset(activeAssetId);
  if (!asset) return null;
  return getLayerScreenRect(layer, time, layout, outputFormat, asset, charRefHeights, camera);
}
