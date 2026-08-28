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
