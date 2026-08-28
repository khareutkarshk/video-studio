import { useCallback, useEffect, useRef, useState } from 'react';
import { getAssetById } from '../../assets/registry';
import { getCachedImage, loadImage } from '../../assets/loadImage';
import {
  computePreviewLayout,
  drawSafeAreaGuides,
  drawViewportBorder,
  logicalToScreen,
  screenToLogical,
  type PreviewLayout,
} from '../../core/composition';
import { getTransformAtTime } from '../../core/interpolation';
import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState } from '../../store/projectReducer';
import type { Layer } from '../../types/project';

type DragState = {
  layerId: string;
  offsetX: number;
  offsetY: number;
} | null;

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<PreviewLayout | null>(null);
  const dragRef = useRef<DragState>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const { outputFormat, editor } = state;
  const { currentTime, selection } = editor;

  const selectedLayerId =
    selection.type !== 'none' ? selection.layerId : null;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const layout = computePreviewLayout(rect.width, rect.height, outputFormat);
    layoutRef.current = layout;

    const { viewport, logicalScale } = layout;

    // Background
    if (scene.backgroundAssetId) {
      const asset = getAssetById(scene.backgroundAssetId);
      if (asset) {
        const img = getCachedImage(asset.url);
        if (img) {
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
        } else {
          ctx.fillStyle = '#2a4a6a';
          ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
        }
      }
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
    }

    // Layers sorted by zIndex
    const sortedLayers = [...scene.layers].sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      if (currentTime < layer.startTime || currentTime > layer.endTime) continue;
      drawLayer(ctx, layer, layout, logicalScale, currentTime);
    }

    drawSafeAreaGuides(ctx, layout, outputFormat);
    drawViewportBorder(ctx, layout);

    // Selection box
    if (selectedLayerId) {
      const layer = scene.layers.find((l) => l.id === selectedLayerId);
      if (layer) {
        drawSelectionBox(ctx, layer, layout, currentTime);
      }
    }
  }, [
    scene,
    outputFormat,
    currentTime,
    selectedLayerId,
    imagesLoaded,
  ]);

  useEffect(() => {
    const urls: string[] = [];
    if (scene.backgroundAssetId) {
      const asset = getAssetById(scene.backgroundAssetId);
      if (asset) urls.push(asset.url);
    }
    for (const layer of scene.layers) {
      const asset = getAssetById(layer.assetId);
      if (asset) urls.push(asset.url);
    }
    Promise.all(urls.map((url) => loadImage(url).catch(() => null))).then(() => {
      setImagesLoaded((n) => n + 1);
    });
  }, [scene.backgroundAssetId, scene.layers]);

  useEffect(() => {
    render();
  }, [render]);

  // Continuous render during playback for smooth animation
  useEffect(() => {
    if (state.editor.playbackState !== 'playing') return;
    let rafId: number;
    const loop = () => {
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [state.editor.playbackState, render]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => render());
    observer.observe(container);
    return () => observer.disconnect();
  }, [render]);

  const hitTestLayer = (clientX: number, clientY: number): Layer | null => {
    const canvas = canvasRef.current;
    const layout = layoutRef.current;
    if (!canvas || !layout) return null;

    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const sortedLayers = [...scene.layers].sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (currentTime < layer.startTime || currentTime > layer.endTime) continue;
      const asset = getAssetById(layer.assetId);
      if (!asset) continue;
      const img = getCachedImage(asset.url);
      if (!img) continue;

      const transform = getTransformAtTime(layer, currentTime);
      const pos = logicalToScreen(transform.x, transform.y, layout);
      const w = img.width * transform.scale * layout.logicalScale;
      const h = img.height * transform.scale * layout.logicalScale;

      const left = pos.x - w / 2;
      const top = pos.y - h / 2;

      if (
        screenX >= left &&
        screenX <= left + w &&
        screenY >= top &&
        screenY <= top + h
      ) {
        return layer;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const layer = hitTestLayer(e.clientX, e.clientY);
    if (!layer) {
      dispatch({ type: 'SELECT', selection: { type: 'none' } });
      return;
    }

    dispatch({ type: 'SELECT', selection: { type: 'layer', layerId: layer.id } });

    const layout = layoutRef.current;
    if (!layout) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const logical = screenToLogical(screenX, screenY, layout);
    const transform = getTransformAtTime(layer, currentTime);

    dragRef.current = {
      layerId: layer.id,
      offsetX: transform.x - logical.x,
      offsetY: transform.y - logical.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const drag = dragRef.current;
    const layout = layoutRef.current;
    if (!drag || !layout) return;

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const logical = screenToLogical(screenX, screenY, layout);

    dispatch({
      type: 'UPDATE_LAYER_TRANSFORM',
      layerId: drag.layerId,
      transform: {
        x: logical.x + drag.offsetX,
        y: logical.y + drag.offsetY,
      },
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  return (
    <div ref={containerRef} className="preview-canvas-container">
      <canvas
        ref={canvasRef}
        className="preview-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  layout: PreviewLayout,
  logicalScale: number,
  time: number,
) {
  const asset = getAssetById(layer.assetId);
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

function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  layout: PreviewLayout,
  time: number,
) {
  const asset = getAssetById(layer.assetId);
  if (!asset) return;

  const img = getCachedImage(asset.url);
  const transform = getTransformAtTime(layer, time);
  const pos = logicalToScreen(transform.x, transform.y, layout);
  const w = (img?.width ?? 100) * transform.scale * layout.logicalScale;
  const h = (img?.height ?? 150) * transform.scale * layout.logicalScale;

  ctx.save();
  ctx.strokeStyle = '#4da6ff';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(pos.x - w / 2, pos.y - h / 2, w, h);
  ctx.restore();
}
