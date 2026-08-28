import type { OutputFormat } from '../types/project';

export const OUTPUT_PRESETS: OutputFormat[] = [
  {
    id: 'youtube-landscape',
    label: 'YouTube Landscape',
    width: 1920,
    height: 1080,
    fps: 30,
    aspectRatio: '16:9',
  },
  {
    id: 'youtube-shorts',
    label: 'YouTube Shorts',
    width: 1080,
    height: 1920,
    fps: 30,
    aspectRatio: '9:16',
  },
  {
    id: 'instagram-reels',
    label: 'Instagram Reels',
    width: 1080,
    height: 1920,
    fps: 30,
    aspectRatio: '9:16',
  },
];

export const DEFAULT_OUTPUT_FORMAT = OUTPUT_PRESETS[0];

export function createCustomFormat(width: number, height: number, fps: number): OutputFormat {
  const ratio = width / height;
  const aspectRatio: '16:9' | '9:16' = ratio >= 1 ? '16:9' : '9:16';
  return {
    id: `custom-${width}x${height}`,
    label: `Custom ${width}×${height}`,
    width,
    height,
    fps,
    aspectRatio,
    custom: true,
  };
}

export function findOutputPreset(id: string): OutputFormat | undefined {
  return OUTPUT_PRESETS.find((p) => p.id === id);
}
