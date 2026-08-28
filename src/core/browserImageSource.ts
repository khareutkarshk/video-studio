import { getCachedImage } from '../assets/loadImage';
import type { FrameImageSource } from './frameRenderer';

export const browserImageSource: FrameImageSource = {
  getImage(url: string) {
    return getCachedImage(url);
  },
};
