import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MasterProject, OutputFormat } from '../../src/types/project.ts';
import { getTotalDuration, getSceneStartTimes } from '../../src/store/projectReducer.ts';
import {
  renderFrame,
  computeSceneOpacityAtGlobalTime,
  type FrameImageSource,
} from '../../src/core/frameRenderer.ts';

export type RenderFrameProgress = {
  frame: number;
  totalFrames: number;
};

export async function renderExportFrames(
  project: MasterProject,
  format: OutputFormat,
  framesDir: string,
  images: FrameImageSource,
  onProgress?: (progress: RenderFrameProgress) => void,
  signal?: AbortSignal,
): Promise<number> {
  const totalDuration = getTotalDuration(project);
  const sceneStarts = getSceneStartTimes(project);
  const fps = format.fps;
  const totalFrames = Math.ceil(totalDuration * fps);

  const canvas = createCanvas(format.width, format.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create export canvas context');

  for (let frame = 0; frame < totalFrames; frame++) {
    if (signal?.aborted) throw new Error('Export cancelled');

    const globalTime = frame / fps;

    let sceneIndex = 0;
    for (let i = project.scenes.length - 1; i >= 0; i--) {
      const start = sceneStarts.get(project.scenes[i].id) ?? 0;
      if (globalTime >= start) {
        sceneIndex = i;
        break;
      }
    }

    const scene = project.scenes[sceneIndex];
    const sceneStart = sceneStarts.get(scene.id) ?? 0;
    const localTime = globalTime - sceneStart;
    const { opacity, prevScene, transitionProgress } = computeSceneOpacityAtGlobalTime(
      scene,
      sceneIndex,
      project.scenes,
      globalTime,
      sceneStart,
    );

    renderFrame(
      ctx as unknown as CanvasRenderingContext2D,
      {
        scene,
        outputFormat: format,
        localTime: Math.min(localTime, scene.duration),
        canvasWidth: format.width,
        canvasHeight: format.height,
        sceneOpacity: opacity,
        prevScene,
        transitionProgress,
      },
      images,
    );

    const name = `frame${String(frame + 1).padStart(6, '0')}.png`;
    writeFileSync(join(framesDir, name), canvas.toBuffer('image/png'));
    onProgress?.({ frame: frame + 1, totalFrames });
  }

  return totalFrames;
}
