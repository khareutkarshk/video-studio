import { getAssetByIdWithRuntime } from '../assets/registry';
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
import type { OutputFormat, Scene } from '../types/project';

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

  // Crossfade: draw previous scene underneath
  if (prevScene && transitionProgress > 0 && transitionProgress < 1) {
    ctx.globalAlpha = sceneOpacity * (1 - transitionProgress);
    drawSceneContent(ctx, prevScene, layout, logicalScale, prevScene.duration, camera);
    ctx.globalAlpha = sceneOpacity * transitionProgress;
  }

  drawSceneContent(ctx, scene, layout, logicalScale, localTime, camera);
  ctx.restore();
}

function drawSceneContent(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  layout: PreviewLayout,
  logicalScale: number,
  time: number,
  camera: { x: number; y: number; zoom: number },
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

  for (const layer of sortedLayers) {
    if (time < layer.startTime || time > layer.endTime) continue;
    drawLayer(ctx, layer, layout, logicalScale, time);
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
) {
  const asset = getAssetByIdWithRuntime(layer.assetId);
  if (!asset) return;
  const img = getCachedImage(asset.url);
  const transform = getTransformAtTime(layer, time);
  const pos = logicalToScreen(transform.x, transform.y, layout);

  ctx.save();
  ctx.globalAlpha = transform.opacity;
  ctx.translate(pos.x, pos.y);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale * logicalScale, transform.scale * logicalScale);

  if (img) {
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
  } else {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-50, -75, 100, 150);
  }
  ctx.restore();
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
