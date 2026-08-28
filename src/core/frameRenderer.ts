import { getAssetByIdWithRuntime, getCharacterReferenceHeightsFromRegistry } from '../assets/registry';
import { getCachedImage } from '../assets/loadImage';
import {
  computePreviewLayout,
  type PreviewLayout,
} from './composition';
import {
  getTransformAtTime,
  getCameraAtTime,
  getSceneTransitionOpacity,
} from './interpolation';
import { getActivePose } from './pose';
import {
  computeRenderScale,
  getGroundAnchor,
  getPropGroundAnchor,
  getReferenceAlphaHeight,
} from './characterRender';
import { computeAutoFitScale } from './characterFraming';
import { allowsSpeakingMotion, isLayerSpeaking, speakingBobOffset } from './speaking';
import type { OutputFormat, Scene } from '../types/project';
import type { AssetMeta } from '../types/assets';

export type RenderOptions = {
  scene: Scene;
  outputFormat: OutputFormat;
  localTime: number;
  canvasWidth: number;
  canvasHeight: number;
  sceneOpacity?: number;
  prevScene?: Scene | null;
  transitionProgress?: number;
};

let characterReferenceHeights: Map<string, number> | null = null;

function getCharRefHeights(): Map<string, number> {
  if (!characterReferenceHeights) {
    characterReferenceHeights = getCharacterReferenceHeightsFromRegistry();
  }
  return characterReferenceHeights;
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
): void {
  const {
    scene,
    outputFormat,
    localTime,
    canvasWidth,
    canvasHeight,
    sceneOpacity = 1,
    prevScene = null,
    transitionProgress = 0,
  } = options;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const layout = computePreviewLayout(canvasWidth, canvasHeight, outputFormat);
  const { logicalScale } = layout;
  const camera = getCameraAtTime(scene.camera, localTime);

  ctx.save();
  ctx.globalAlpha = sceneOpacity;

  if (prevScene && transitionProgress > 0 && transitionProgress < 1) {
    ctx.globalAlpha = sceneOpacity * (1 - transitionProgress);
    drawSceneContent(ctx, prevScene, layout, logicalScale, prevScene.duration, camera, outputFormat);
    ctx.globalAlpha = sceneOpacity * transitionProgress;
  }

  drawSceneContent(ctx, scene, layout, logicalScale, localTime, camera, outputFormat);
  ctx.restore();
}

function drawSceneContent(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  layout: PreviewLayout,
  logicalScale: number,
  time: number,
  camera: { x: number; y: number; zoom: number },
  outputFormat: OutputFormat,
) {
  const { viewport } = layout;
  const centerX = viewport.x + viewport.width / 2;
  const centerY = viewport.y + viewport.height / 2;

  ctx.save();

  // Clip to output frame in canvas space before camera transform.
  ctx.beginPath();
  ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.clip();

  // Camera: zoom around viewport center, pan in logical units.
  ctx.translate(centerX, centerY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x * logicalScale, -camera.y * logicalScale);

  if (scene.backgroundAssetId) {
    drawBackground(ctx, scene.backgroundAssetId, outputFormat, logicalScale);
  } else {
    const vpW = outputFormat.width * logicalScale;
    const vpH = outputFormat.height * logicalScale;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-vpW / 2, -vpH / 2, vpW, vpH);
  }

  const sortedLayers = [...scene.layers]
    .filter((l) => l.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const charRefHeights = getCharRefHeights();

  for (const layer of sortedLayers) {
    if (time < layer.startTime || time > layer.endTime) continue;
    drawLayer(ctx, layer, logicalScale, time, charRefHeights, outputFormat, scene);
  }

  ctx.restore();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  assetId: string,
  outputFormat: OutputFormat,
  logicalScale: number,
) {
  const asset = getAssetByIdWithRuntime(assetId);
  const vpW = outputFormat.width * logicalScale;
  const vpH = outputFormat.height * logicalScale;

  if (!asset) {
    ctx.fillStyle = '#2a4a6a';
    ctx.fillRect(-vpW / 2, -vpH / 2, vpW, vpH);
    return;
  }

  const img = getCachedImage(asset.url);
  if (!img) {
    ctx.fillStyle = '#2a4a6a';
    ctx.fillRect(-vpW / 2, -vpH / 2, vpW, vpH);
    return;
  }

  const imgAspect = img.width / img.height;
  const vpAspect = vpW / vpH;
  let dw = vpW;
  let dh = vpH;
  let dx = -vpW / 2;
  let dy = -vpH / 2;

  if (imgAspect > vpAspect) {
    dh = vpH;
    dw = dh * imgAspect;
    dx = -dw / 2;
  } else {
    dw = vpW;
    dh = dw / imgAspect;
    dy = -dh / 2;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: import('../types/project').Layer,
  logicalScale: number,
  time: number,
  charRefHeights: Map<string, number>,
  outputFormat: OutputFormat,
  scene: Scene,
) {
  const activeAssetId = getActivePose(layer, time);
  const asset = getAssetByIdWithRuntime(activeAssetId);
  if (!asset) return;
  const img = getCachedImage(asset.url);
  const transform = getTransformAtTime(layer, time);
  const posX = transform.x * logicalScale;
  const posY = transform.y * logicalScale;

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
    logicalScale,
    asset,
    refHeight,
    outputFormat.height,
    autoFitScale,
  );
  const nativeW = asset.nativeWidth || asset.width || (img?.width ?? 100);
  const nativeH = asset.nativeHeight || asset.height || (img?.height ?? 150);

  const anchor =
    asset.type === 'character'
      ? getGroundAnchor(asset)
      : asset.type === 'prop'
        ? getPropGroundAnchor(asset)
        : { x: nativeW / 2, y: nativeH / 2 };

  const speaking =
    asset.type === 'character' &&
    isLayerSpeaking(scene, layer.id, asset.character, time) &&
    allowsSpeakingMotion(asset.action);
  const bob = speaking ? speakingBobOffset(time) : 0;

  ctx.save();
  ctx.globalAlpha = transform.opacity;
  ctx.translate(posX, posY + bob * logicalScale);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(renderScale, renderScale);

  if (img) {
    ctx.drawImage(img, -anchor.x, -anchor.y, nativeW, nativeH);
  } else {
    drawPlaceholder(ctx, asset, nativeW, nativeH, anchor);
  }
  ctx.restore();
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  asset: AssetMeta,
  nativeW: number,
  nativeH: number,
  anchor: { x: number; y: number },
) {
  const bounds = asset.alphaBounds ?? { x: 0, y: 0, width: nativeW, height: nativeH };
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(-anchor.x + bounds.x, -anchor.y + bounds.y, bounds.width, bounds.height);
}

export function computeSceneOpacityAtGlobalTime(
  scene: Scene,
  sceneIndex: number,
  scenes: Scene[],
  globalTime: number,
  sceneStart: number,
): { opacity: number; prevScene: Scene | null; transitionProgress: number } {
  const localTime = globalTime - sceneStart;
  const prevScene = sceneIndex > 0 ? scenes[sceneIndex - 1] : null;
  const prevTransition = prevScene?.transition ?? { type: 'none', duration: 0 };

  let transitionProgress = 0;
  if (prevTransition.type === 'crossfade' && localTime < prevTransition.duration) {
    transitionProgress = localTime / prevTransition.duration;
  }

  const transitionIn = sceneIndex > 0 ? prevTransition : { type: 'none', duration: 0 };
  const opacity = getSceneTransitionOpacity(
    localTime,
    scene.duration,
    transitionIn,
    scene.transition,
  );

  return { opacity, prevScene, transitionProgress };
}
