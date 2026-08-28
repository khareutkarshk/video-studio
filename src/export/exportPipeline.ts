import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { MasterProject, OutputFormat } from '../types/project';
import { getTotalDuration, getSceneStartTimes } from '../store/projectReducer';
import { renderFrame, computeSceneOpacityAtGlobalTime } from '../core/frameRenderer';
import { preloadAssets } from '../assets/loadImage';
import { getAssetByIdWithRuntime } from '../assets/registry';

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(onProgress: (p: number, msg: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(Math.round(progress * 100), 'Encoding video...');
  });

  onProgress(0, 'Loading FFmpeg...');
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

function collectAssetUrls(project: MasterProject): string[] {
  const urls = new Set<string>();
  for (const scene of project.scenes) {
    if (scene.backgroundAssetId) {
      const a = getAssetByIdWithRuntime(scene.backgroundAssetId);
      if (a) urls.add(a.url);
    }
    for (const layer of scene.layers) {
      const a = getAssetByIdWithRuntime(layer.assetId);
      if (a) urls.add(a.url);
    }
    for (const track of scene.audioTracks) {
      const a = getAssetByIdWithRuntime(track.assetId);
      if (a) urls.add(a.url);
    }
  }
  return [...urls];
}

export async function exportToMp4(
  project: MasterProject,
  format: OutputFormat,
  onProgress: (progress: number, message: string) => void,
): Promise<Blob> {
  const urls = collectAssetUrls(project);
  onProgress(2, 'Loading assets...');
  await preloadAssets(urls);

  const totalDuration = getTotalDuration(project);
  const sceneStarts = getSceneStartTimes(project);
  const fps = format.fps;
  const totalFrames = Math.ceil(totalDuration * fps);

  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  onProgress(5, 'Rendering frames...');

  const ffmpeg = await getFFmpeg(onProgress);

  for (let frame = 0; frame < totalFrames; frame++) {
    const globalTime = frame / fps;

    // Find active scene
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

    renderFrame(ctx, {
      scene,
      outputFormat: format,
      localTime: Math.min(localTime, scene.duration),
      canvasWidth: format.width,
      canvasHeight: format.height,
      sceneOpacity: opacity,
      prevScene,
      transitionProgress,
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Frame export failed'))), 'image/png');
    });

    const data = new Uint8Array(await blob.arrayBuffer());
    const name = `frame${String(frame).padStart(5, '0')}.png`;
    await ffmpeg.writeFile(name, data);

    const renderProgress = 5 + Math.round((frame / totalFrames) * 60);
    onProgress(renderProgress, `Rendering frame ${frame + 1}/${totalFrames}`);
  }

  onProgress(70, 'Encoding MP4...');
  await ffmpeg.exec([
    '-framerate', String(fps),
    '-i', 'frame%05d.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-y', 'output.mp4',
  ]);

  onProgress(95, 'Finalizing...');
  const data = await ffmpeg.readFile('output.mp4');
  const mp4Blob = new Blob([data as BlobPart], { type: 'video/mp4' });

  // Cleanup frames
  for (let frame = 0; frame < totalFrames; frame++) {
    try {
      await ffmpeg.deleteFile(`frame${String(frame).padStart(5, '0')}.png`);
    } catch { /* ignore */ }
  }
  try {
    await ffmpeg.deleteFile('output.mp4');
  } catch { /* ignore */ }

  onProgress(100, 'Export complete');
  return mp4Blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
