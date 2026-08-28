const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url);
  if (cached && cached.complete) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export function getCachedImage(url: string): HTMLImageElement | undefined {
  const img = imageCache.get(url);
  return img?.complete ? img : undefined;
}

export function preloadAssets(urls: string[]): Promise<void> {
  return Promise.all(urls.map((url) => loadImage(url).catch(() => undefined))).then(
    () => undefined,
  );
}
