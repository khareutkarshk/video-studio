import type { Layer, PoseSegment } from '../types/project';

export function getActivePose(layer: Layer, time: number): string {
  const segments = layer.poseSegments;
  if (!segments || segments.length === 0) {
    return layer.assetId;
  }

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  for (const segment of sorted) {
    if (time >= segment.startTime && time < segment.endTime) {
      return segment.assetId;
    }
  }

  const last = sorted[sorted.length - 1];
  if (time >= last.endTime) {
    return last.assetId;
  }

  return layer.assetId;
}

export function getActivePoseSegment(layer: Layer, time: number): PoseSegment | undefined {
  const segments = layer.poseSegments;
  if (!segments || segments.length === 0) return undefined;

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  for (const segment of sorted) {
    if (time >= segment.startTime && time < segment.endTime) {
      return segment;
    }
  }
  return undefined;
}
