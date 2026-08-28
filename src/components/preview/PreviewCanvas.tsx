import { useCallback, useEffect, useRef, useState } from 'react';
import { getAssetByIdWithRuntime } from '../../assets/registry';
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
import { renderFrame } from '../../core/frameRenderer';
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

    renderFrame(ctx, {
      scene,
      outputFormat,
      localTime: currentTime,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    });

    const layout = computePreviewLayout(rect.width, rect.height, outputFormat);
    layoutRef.current = layout;

    drawSafeAreaGuides(ctx, layout, outputFormat);
    drawViewportBorder(ctx, layout);

    if (selectedLayerId) {
      const layer = scene.layers.find((l) => l.id === selectedLayerId);
      if (layer?.visible) {
        drawSelectionBox(ctx, layer, layout, currentTime);
      }
    }
  }, [scene, outputFormat, currentTime, selectedLayerId, imagesLoaded]);

  useEffect(() => {
    const urls: string[] = [];
    if (scene.backgroundAssetId) {
      const asset = getAssetByIdWithRuntime(scene.backgroundAssetId);
      if (asset) urls.push(asset.url);
    }
    for (const layer of scene.layers) {
      const asset = getAssetByIdWithRuntime(layer.assetId);
      if (asset) urls.push(asset.url);
    }
    Promise.all(urls.map((url) => loadImage(url).catch(() => null))).then(() => {
      setImagesLoaded((n) => n + 1);
    });
  }, [scene.backgroundAssetId, scene.layers]);

  useEffect(() => { render(); }, [render]);

  useEffect(() => {
    if (state.editor.playbackState !== 'playing') return;
    let rafId: number;
    const loop = () => { render(); rafId = requestAnimationFrame(loop); };
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

    const sortedLayers = [...scene.layers]
      .filter((l) => l.visible && !l.locked)
      .sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (currentTime < layer.startTime || currentTime > layer.endTime) continue;
      const asset = getAssetByIdWithRuntime(layer.assetId);
      if (!asset) continue;
      const img = getCachedImage(asset.url);
      if (!img) continue;

      const transform = getTransformAtTime(layer, currentTime);
      const pos = logicalToScreen(transform.x, transform.y, layout);
      const w = img.width * transform.scale * layout.logicalScale;
      const h = img.height * transform.scale * layout.logicalScale;

      if (
        screenX >= pos.x - w / 2 &&
        screenX <= pos.x + w / 2 &&
        screenY >= pos.y - h / 2 &&
        screenY <= pos.y + h / 2
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
    const logical = screenToLogical(e.clientX - rect.left, e.clientY - rect.top, layout);
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
    const logical = screenToLogical(e.clientX - rect.left, e.clientY - rect.top, layout);

    dispatch({
      type: 'UPDATE_LAYER_TRANSFORM',
      layerId: drag.layerId,
      transform: { x: logical.x + drag.offsetX, y: logical.y + drag.offsetY },
    });
  };

  const handleMouseUp = () => { dragRef.current = null; };

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

function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  layout: PreviewLayout,
  time: number,
) {
  const asset = getAssetByIdWithRuntime(layer.assetId);
  if (!asset) return;
  const img = getCachedImage(asset.url);
  const transform = getTransformAtTime(layer, time);
  const pos = logicalToScreen(transform.x, transform.y, layout);
  const w = (img?.width ?? 100) * transform.scale * layout.logicalScale;
  const h = (img?.height ?? 150) * transform.scale * layout.logicalScale;

  ctx.save();
  ctx.strokeStyle = layer.locked ? '#888' : '#4da6ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(pos.x - w / 2, pos.y - h / 2, w, h);
  ctx.restore();
}
