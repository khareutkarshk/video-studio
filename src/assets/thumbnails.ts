import { loadImage } from './loadImage';
import { THUMBNAIL_SIZE } from './assetBrowser';

const thumbnailCache = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

function createThumbnailDataUrl(img: HTMLImageElement, size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const scale = Math.min(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export function getCachedThumbnail(url: string): string | undefined {
  return thumbnailCache.get(url);
}

export async function loadThumbnail(url: string, size = THUMBNAIL_SIZE): Promise<string | null> {
  const cached = thumbnailCache.get(url);
  if (cached) return cached;

  const inflight = pending.get(url);
  if (inflight) return inflight;

  const promise = loadImage(url)
    .then((img) => {
      const dataUrl = createThumbnailDataUrl(img, size);
      if (dataUrl) thumbnailCache.set(url, dataUrl);
      pending.delete(url);
      return dataUrl || null;
    })
    .catch(() => {
      pending.delete(url);
      return null;
    });

  pending.set(url, promise);
  return promise;
}

/** Load thumbnails in small concurrent batches to avoid blocking the UI. */
export async function loadThumbnailsBatch(
  urls: string[],
  size = THUMBNAIL_SIZE,
  concurrency = 6,
  onEach?: (url: string, dataUrl: string | null) => void,
): Promise<void> {
  const queue = [...urls];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const dataUrl = await loadThumbnail(url, size);
      onEach?.(url, dataUrl);
    }
  });
  await Promise.all(workers);
}

export function clearThumbnailCache(): void {
  thumbnailCache.clear();
  pending.clear();
}
