import { useCallback, useEffect, useRef, useState } from 'react';
import { getAssetByIdWithRuntime, getCharacterReferenceHeightsFromRegistry } from '../../assets/registry';
import { loadImage } from '../../assets/loadImage';
import {
  computePreviewLayout,
  drawSafeAreaGuides,
  drawViewportBorder,
  screenToLogical,
  type PreviewLayout,
} from '../../core/composition';
import { getTransformAtTime, getCameraAtTime, getSceneTransitionOpacity } from '../../core/interpolation';
import { renderFrame } from '../../core/frameRenderer';
import { getLayerScreenRectAtTime } from '../../core/layerBounds';
import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState } from '../../store/projectReducer';
import type { Layer, Scene } from '../../types/project';

type DragState = {
  layerId: string;
  offsetX: number;
  offsetY: number;
} | null;

function getTransitionRenderState(
  scene: Scene,
  sceneIndex: number,
  scenes: Scene[],
  localTime: number,
): { opacity: number; prevScene: Scene | null; transitionProgress: number } {
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

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<PreviewLayout | null>(null);
  const dragRef = useRef<DragState>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const { outputFormat, editor, project } = state;
  const { currentTime, selection, showSafeAreaGuides } = editor;
  const sceneIndex = project.scenes.findIndex((s) => s.id === editor.activeSceneId);
  const camera = getCameraAtTime(scene.camera, currentTime);
  const transitionState = getTransitionRenderState(scene, sceneIndex, project.scenes, currentTime);

  const selectedLayerId =
    selection.type === 'layer' ||
    selection.type === 'keyframe' ||
    selection.type === 'poseSegment'
      ? selection.layerId
      : null;

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
      sceneOpacity: transitionState.opacity,
      prevScene: transitionState.prevScene,
      transitionProgress: transitionState.transitionProgress,
    });

    const layout = computePreviewLayout(rect.width, rect.height, outputFormat);
    layoutRef.current = layout;

    if (showSafeAreaGuides) {
      drawSafeAreaGuides(ctx, layout, outputFormat);
    }
    drawViewportBorder(ctx, layout);

    if (selectedLayerId) {
      const layer = scene.layers.find((l) => l.id === selectedLayerId);
      if (layer?.visible) {
        drawSelectionBox(ctx, layer, layout, currentTime, outputFormat, camera);
      }
    }
  }, [
    scene,
    outputFormat,
    currentTime,
    selectedLayerId,
    imagesLoaded,
    showSafeAreaGuides,
    transitionState,
    camera,
  ]);

  useEffect(() => {
    const urls: string[] = [];
    if (scene.backgroundAssetId) {
      const asset = getAssetByIdWithRuntime(scene.backgroundAssetId);
      if (asset) urls.push(asset.url);
    }
    for (const layer of scene.layers) {
      urls.push(layer.assetId);
      for (const segment of layer.poseSegments ?? []) {
        urls.push(segment.assetId);
      }
    }
    const uniqueUrls = [...new Set(urls)]
      .map((id) => getAssetByIdWithRuntime(id)?.url)
      .filter((url): url is string => Boolean(url));
    Promise.all(uniqueUrls.map((url) => loadImage(url).catch(() => null))).then(() => {
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
    const charRefHeights = getCharacterReferenceHeightsFromRegistry();

    const sortedLayers = [...scene.layers]
      .filter((l) => l.visible && !l.locked)
      .sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (currentTime < layer.startTime || currentTime > layer.endTime) continue;
      const box = getLayerScreenRectAtTime(
        layer,
        currentTime,
        layout,
        outputFormat,
        getAssetByIdWithRuntime,
        charRefHeights,
        camera,
      );
      if (!box) continue;

      if (
        screenX >= box.x &&
        screenX <= box.x + box.width &&
        screenY >= box.y &&
        screenY <= box.y + box.height
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
  outputFormat: import('../../types/project').OutputFormat,
  camera: { x: number; y: number; zoom: number },
) {
  const charRefHeights = getCharacterReferenceHeightsFromRegistry();
  const box = getLayerScreenRectAtTime(
    layer,
    time,
    layout,
    outputFormat,
    getAssetByIdWithRuntime,
    charRefHeights,
    camera,
  );
  if (!box) return;

  ctx.save();
  ctx.strokeStyle = layer.locked ? '#888' : '#4da6ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.restore();
}
