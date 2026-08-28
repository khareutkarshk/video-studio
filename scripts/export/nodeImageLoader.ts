import { join } from 'node:path';
import { loadImage, type Image } from '@napi-rs/canvas';
import type { FrameImageSource } from '../../src/core/frameRenderer.ts';

const cache = new Map<string, Image>();

export async function preloadNodeImages(
  urls: string[],
  publicDir = join(process.cwd(), 'public'),
): Promise<FrameImageSource> {
  for (const url of urls) {
    if (cache.has(url)) continue;
    const absPath = join(publicDir, url.replace(/^\//, ''));
    cache.set(url, await loadImage(absPath));
  }
  return createNodeImageSource();
}

export function createNodeImageSource(): FrameImageSource {
  return {
    getImage(url: string): CanvasImageSource | undefined {
      return cache.get(url) as CanvasImageSource | undefined;
    },
  };
}

export function clearNodeImageCache(): void {
  cache.clear();
}
