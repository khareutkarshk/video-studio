import type { CameraKeyframe, Layer, OutputFormat, Scene } from '../types/project';
import type { AssetMeta } from '../types/assets';
import { getCharacterVisualBounds } from './characterFraming';
import { getAssetAlphaBounds, getReferenceAlphaHeight } from './characterRender';
import { getTransformAtTime } from './interpolation';
import { getActivePose } from './pose';

const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;

export type LogicalRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export type FrameSubjectsOptions = {
  /** Union of subject bounding boxes in logical space. */
  bounds: LogicalRect;
  outputFormat: OutputFormat;
  padding?: number;
  minZoom?: number;
  maxZoom?: number;
};

export type FrameSubjectsResult = {
  x: number;
  y: number;
  zoom: number;
};

const DEFAULT_PADDING = 120;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

function toLogicalRect(
  left: number,
  right: number,
  top: number,
  bottom: number,
): LogicalRect {
  const width = right - left;
  const height = bottom - top;
  return {
    left,
    right,
    top,
    bottom,
    width,
    height,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
}

/** Visible viewport in master logical space (center origin) given camera and output format. */
export function getVisibleLogicalRect(
  camera: CameraKeyframe,
  outputFormat: OutputFormat,
): LogicalRect {
  const halfW = outputFormat.width / (2 * camera.zoom);
  const halfH = outputFormat.height / (2 * camera.zoom);
  const cx = camera.x;
  const cy = camera.y;
  return toLogicalRect(cx - halfW, cx + halfW, cy - halfH, cy + halfH);
}

/** Inner portrait-safe rect when viewing landscape master (center 9:16 crop). */
export function getPortraitSafeRect(outputFormat: OutputFormat): LogicalRect {
  if (outputFormat.aspectRatio === '9:16') {
    return toLogicalRect(
      -outputFormat.width / 2,
      outputFormat.width / 2,
      -outputFormat.height / 2,
      outputFormat.height / 2,
    );
  }
  const safeWidth = REFERENCE_HEIGHT * (9 / 16);
  const halfW = safeWidth / 2;
  const halfH = REFERENCE_HEIGHT / 2;
  return toLogicalRect(-halfW, halfW, -halfH, halfH);
}

/** Inner landscape-safe rect when viewing portrait master (center 16:9 crop). */
export function getLandscapeSafeRect(outputFormat: OutputFormat): LogicalRect {
  if (outputFormat.aspectRatio === '16:9') {
    return toLogicalRect(
      -outputFormat.width / 2,
      outputFormat.width / 2,
      -outputFormat.height / 2,
      outputFormat.height / 2,
    );
  }
  const safeHeight = outputFormat.width * (9 / 16);
  const halfW = outputFormat.width / 2;
  const halfH = safeHeight / 2;
  return toLogicalRect(-halfW, halfW, -halfH, halfH);
}

export function getLayerVisualBoundsAtTime(
  layer: Layer,
  time: number,
  outputFormat: OutputFormat,
  getAsset: (id: string) => AssetMeta | undefined,
  charRefHeights: Map<string, number>,
): LogicalRect | null {
  const transform = getTransformAtTime(layer, time);
  const assetId = getActivePose(layer, time);
  const asset = getAsset(assetId);
  if (!asset) return null;

  if (asset.type === 'character') {
    const refHeight = getReferenceAlphaHeight(asset, charRefHeights);
    const vb = getCharacterVisualBounds(
      transform.x,
      transform.y,
      transform.scale,
      asset,
      refHeight,
      outputFormat.height,
    );
    return toLogicalRect(vb.left, vb.right, vb.top, vb.bottom);
  }

  const bounds = getAssetAlphaBounds(asset);
  const nativeH = asset.nativeHeight || asset.height || 150;
  const propNorm = (outputFormat.height * 0.38) / nativeH;
  const effectiveScale = transform.scale * propNorm;
  const w = bounds.width * effectiveScale;
  const h = bounds.height * effectiveScale;
  const anchorX = bounds.x + bounds.width / 2;
  const anchorY = bounds.y + bounds.height;
  const left = transform.x - anchorX * effectiveScale;
  const top = transform.y - anchorY * effectiveScale;
  return toLogicalRect(left, left + w, top, top + h);
}

export function unionRects(rects: LogicalRect[]): LogicalRect | null {
  if (rects.length === 0) return null;
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  const top = Math.min(...rects.map((r) => r.top));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return toLogicalRect(left, right, top, bottom);
}

export function computeSubjectBounds(
  scene: Scene,
  layerIds: string[],
  time: number,
  outputFormat: OutputFormat,
  getAsset: (id: string) => AssetMeta | undefined,
  charRefHeights: Map<string, number>,
): LogicalRect | null {
  const rects: LogicalRect[] = [];
  for (const id of layerIds) {
    const layer = scene.layers.find((l) => l.id === id);
    if (!layer || !layer.visible) continue;
    const bounds = getLayerVisualBoundsAtTime(layer, time, outputFormat, getAsset, charRefHeights);
    if (bounds) rects.push(bounds);
  }
  return unionRects(rects);
}

/** Compute camera x/y/zoom to fit subject bounds in the output viewport. */
export function frameSubjects(opts: FrameSubjectsOptions): FrameSubjectsResult {
  const padding = opts.padding ?? DEFAULT_PADDING;
  const minZoom = opts.minZoom ?? MIN_ZOOM;
  const maxZoom = opts.maxZoom ?? MAX_ZOOM;
  const { bounds, outputFormat } = opts;

  const subjectW = bounds.width + padding * 2;
  const subjectH = bounds.height + padding * 2;

  const zoomX = outputFormat.width / subjectW;
  const zoomY = outputFormat.height / subjectH;
  const zoom = Math.max(minZoom, Math.min(maxZoom, Math.min(zoomX, zoomY)));

  return {
    x: bounds.centerX,
    y: bounds.centerY,
    zoom,
  };
}

export function isRectInsideViewport(subject: LogicalRect, viewport: LogicalRect): boolean {
  return (
    subject.left >= viewport.left &&
    subject.right <= viewport.right &&
    subject.top >= viewport.top &&
    subject.bottom <= viewport.bottom
  );
}

export function distanceToViewportEdge(subject: LogicalRect, viewport: LogicalRect): number {
  const dl = subject.left - viewport.left;
  const dr = viewport.right - subject.right;
  const dt = subject.top - viewport.top;
  const db = viewport.bottom - subject.bottom;
  return Math.min(dl, dr, dt, db);
}

export function rectsOverlapHorizontally(a: LogicalRect, b: LogicalRect): boolean {
  return a.left < b.right && b.left < a.right;
}

/** Default landscape output format for composition math. */
export const LANDSCAPE_OUTPUT: OutputFormat = {
  id: 'composition-landscape',
  label: 'Landscape',
  width: REFERENCE_WIDTH,
  height: REFERENCE_HEIGHT,
  fps: 30,
  aspectRatio: '16:9',
};

export const PORTRAIT_OUTPUT: OutputFormat = {
  id: 'composition-portrait',
  label: 'Portrait',
  width: 1080,
  height: 1920,
  fps: 30,
  aspectRatio: '9:16',
};
