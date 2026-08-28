import type { OutputFormat } from '../types/project';

/** Reference composition size (landscape logical space). */
export const REFERENCE_WIDTH = 1920;
export const REFERENCE_HEIGHT = 1080;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PreviewLayout = {
  /** Canvas pixel rect where output is drawn (letterboxed). */
  viewport: Rect;
  /** Scale from logical units to viewport pixels. */
  logicalScale: number;
};

export function computePreviewLayout(
  containerWidth: number,
  containerHeight: number,
  outputFormat: OutputFormat,
): PreviewLayout {
  const aspect = outputFormat.width / outputFormat.height;
  let width = containerWidth;
  let height = width / aspect;

  if (height > containerHeight) {
    height = containerHeight;
    width = height * aspect;
  }

  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;

  const logicalScale = width / outputFormat.width;

  return {
    viewport: { x, y, width, height },
    logicalScale,
  };
}

/** Map logical composition coords (center origin) to canvas pixel coords. */
export function logicalToScreen(
  logicalX: number,
  logicalY: number,
  layout: PreviewLayout,
): { x: number; y: number } {
  const centerX = layout.viewport.x + layout.viewport.width / 2;
  const centerY = layout.viewport.y + layout.viewport.height / 2;
  return {
    x: centerX + logicalX * layout.logicalScale,
    y: centerY + logicalY * layout.logicalScale,
  };
}

/** Map logical composition coords (center origin) to canvas pixel coords with camera. */
export function logicalToScreenWithCamera(
  logicalX: number,
  logicalY: number,
  layout: PreviewLayout,
  camera: { x: number; y: number; zoom: number },
): { x: number; y: number } {
  const centerX = layout.viewport.x + layout.viewport.width / 2;
  const centerY = layout.viewport.y + layout.viewport.height / 2;
  const ls = layout.logicalScale;
  return {
    x: centerX + camera.zoom * (logicalX - camera.x) * ls,
    y: centerY + camera.zoom * (logicalY - camera.y) * ls,
  };
}

/** Map canvas pixel coords to logical composition coords. */
export function screenToLogical(
  screenX: number,
  screenY: number,
  layout: PreviewLayout,
): { x: number; y: number } {
  const centerX = layout.viewport.x + layout.viewport.width / 2;
  const centerY = layout.viewport.y + layout.viewport.height / 2;
  return {
    x: (screenX - centerX) / layout.logicalScale,
    y: (screenY - centerY) / layout.logicalScale,
  };
}

/**
 * Safe area: the region visible when cropping to the alternate aspect ratio.
 * 16:9 preview → inner 9:16 portrait safe area.
 * 9:16 preview → inner 16:9 landscape safe area.
 */
export function computeSafeAreaRect(
  layout: PreviewLayout,
  outputFormat: OutputFormat,
): Rect | null {
  const { viewport } = layout;

  if (outputFormat.aspectRatio === '16:9') {
    // Inner 9:16 portrait crop centered in landscape
    const safeHeight = viewport.height;
    const safeWidth = safeHeight * (9 / 16);
    if (safeWidth >= viewport.width) return null;
    return {
      x: viewport.x + (viewport.width - safeWidth) / 2,
      y: viewport.y,
      width: safeWidth,
      height: safeHeight,
    };
  }

  // Inner 16:9 landscape crop centered in portrait
  const safeWidth = viewport.width;
  const safeHeight = safeWidth * (9 / 16);
  if (safeHeight >= viewport.height) return null;
  return {
    x: viewport.x,
    y: viewport.y + (viewport.height - safeHeight) / 2,
    width: safeWidth,
    height: safeHeight,
  };
}

export function drawSafeAreaGuides(
  ctx: CanvasRenderingContext2D,
  layout: PreviewLayout,
  outputFormat: OutputFormat,
  showLabel = true,
): void {
  const safe = computeSafeAreaRect(layout, outputFormat);
  if (!safe) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 220, 80, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(safe.x, safe.y, safe.width, safe.height);

  ctx.fillStyle = 'rgba(255, 220, 80, 0.12)';
  // Dim areas outside safe zone
  const { viewport } = layout;
  ctx.globalCompositeOperation = 'source-over';

  if (outputFormat.aspectRatio === '16:9') {
    const leftW = safe.x - viewport.x;
    const rightX = safe.x + safe.width;
    const rightW = viewport.x + viewport.width - rightX;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    if (leftW > 0) ctx.fillRect(viewport.x, viewport.y, leftW, viewport.height);
    if (rightW > 0) ctx.fillRect(rightX, viewport.y, rightW, viewport.height);
  } else {
    const topH = safe.y - viewport.y;
    const bottomY = safe.y + safe.height;
    const bottomH = viewport.y + viewport.height - bottomY;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    if (topH > 0) ctx.fillRect(viewport.x, viewport.y, viewport.width, topH);
    if (bottomH > 0) ctx.fillRect(viewport.x, bottomY, viewport.width, bottomH);
  }

  ctx.strokeStyle = 'rgba(255, 220, 80, 0.85)';
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(safe.x, safe.y, safe.width, safe.height);

  if (showLabel) {
    const label =
      outputFormat.aspectRatio === '16:9' ? 'Portrait safe' : 'Landscape safe';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 220, 80, 0.95)';
    ctx.textAlign = 'center';
    ctx.fillText(label, safe.x + safe.width / 2, safe.y + 16);
  }

  ctx.restore();
}

export function drawViewportBorder(
  ctx: CanvasRenderingContext2D,
  layout: PreviewLayout,
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    layout.viewport.x,
    layout.viewport.y,
    layout.viewport.width,
    layout.viewport.height,
  );
  ctx.restore();
}
