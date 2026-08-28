import { getAssetByIdWithRuntime, getCharacterReferenceHeightsFromRegistry } from '../assets/registry';
import { getCachedImage } from '../assets/loadImage';
import {
  computePreviewLayout,
  logicalToScreen,
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

  ctx.save();
  const centerX = viewport.x + viewport.width / 2;
  const centerY = viewport.y + viewport.height / 2;
  ctx.translate(centerX, centerY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-centerX - camera.x * logicalScale, -centerY - camera.y * logicalScale);

  if (scene.backgroundAssetId) {
    drawBackground(ctx, scene.backgroundAssetId, viewport);
  } else {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
  }

  const sortedLayers = [...scene.layers]
    .filter((l) => l.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const charRefHeights = getCharRefHeights();

  for (const layer of sortedLayers) {
    if (time < layer.startTime || time > layer.endTime) continue;
    drawLayer(ctx, layer, layout, logicalScale, time, charRefHeights, outputFormat, scene);
  }

  ctx.restore();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  assetId: string,
  viewport: { x: number; y: number; width: number; height: number },
) {
  const asset = getAssetByIdWithRuntime(assetId);
  if (!asset) return;
  const img = getCachedImage(asset.url);
  if (!img) {
    ctx.fillStyle = '#2a4a6a';
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.clip();
  const imgAspect = img.width / img.height;
  const vpAspect = viewport.width / viewport.height;
  let dw = viewport.width;
  let dh = viewport.height;
  let dx = viewport.x;
  let dy = viewport.y;
  if (imgAspect > vpAspect) {
    dh = viewport.height;
    dw = dh * imgAspect;
    dx = viewport.x + (viewport.width - dw) / 2;
  } else {
    dw = viewport.width;
    dh = dw / imgAspect;
    dy = viewport.y + (viewport.height - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: import('../types/project').Layer,
  layout: PreviewLayout,
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
  const pos = logicalToScreen(transform.x, transform.y, layout);

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
  ctx.translate(pos.x, pos.y + bob);
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
