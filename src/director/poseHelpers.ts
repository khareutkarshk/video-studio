import type { PoseSegment } from '../types/project';

export type PoseSegmentInput = {
  assetId: string;
  startTime: number;
  endTime: number;
};

export type SequencePosesOptions = {
  segments: PoseSegmentInput[];
};

/** Build sorted, non-overlapping pose segments from a list of timed poses. */
export function sequencePoses(options: SequencePosesOptions): PoseSegment[] {
  return [...options.segments]
    .map((s) => ({ assetId: s.assetId, startTime: s.startTime, endTime: s.endTime }))
    .sort((a, b) => a.startTime - b.startTime);
}

export function addPoseSegment(
  existing: PoseSegment[] | undefined,
  segment: PoseSegmentInput,
): PoseSegment[] {
  const segments = existing ? [...existing] : [];
  segments.push({ assetId: segment.assetId, startTime: segment.startTime, endTime: segment.endTime });
  return segments.sort((a, b) => a.startTime - b.startTime);
}

export { getActivePose, getActivePoseSegment } from '../core/pose';
