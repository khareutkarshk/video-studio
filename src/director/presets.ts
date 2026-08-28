import type { Keyframe, PoseSegment } from '../types/project';

export type MovementPresetOptions = {
  startTime: number;
  endTime: number;
  startX: number;
  endX: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  easing?: Keyframe['easing'];
};

export type WalkPresetOptions = MovementPresetOptions & {
  /** When set, creates a walking pose segment spanning the movement. */
  walkAssetId?: string;
};

export type MovementPresetResult = {
  keyframes: Keyframe[];
  poseSegments?: PoseSegment[];
};

import { getGroundY } from '../core/characterFraming';

const DEFAULT_Y = getGroundY(1080);
const DEFAULT_SCALE = 1.0;

export function walkAcrossScene(opts: WalkPresetOptions): MovementPresetResult {
  const keyframes = moveToPosition(opts);
  const poseSegments = opts.walkAssetId
    ? [{ assetId: opts.walkAssetId, startTime: opts.startTime, endTime: opts.endTime }]
    : undefined;
  return { keyframes, poseSegments };
}

export function runAcrossScene(opts: WalkPresetOptions): MovementPresetResult {
  const walkAssetId = opts.walkAssetId;
  return walkAcrossScene({ ...opts, easing: opts.easing ?? 'ease-in-out', walkAssetId });
}

export function flyAcrossScene(opts: MovementPresetOptions): MovementPresetResult {
  return {
    keyframes: moveToPosition({ ...opts, y: opts.y ?? 0, easing: opts.easing ?? 'linear' }),
  };
}

export function moveToPosition(opts: MovementPresetOptions): Keyframe[] {
  const y = opts.y ?? DEFAULT_Y;
  const scale = opts.scale ?? DEFAULT_SCALE;
  const easing = opts.easing ?? 'linear';
  return [
    {
      time: opts.startTime,
      x: opts.startX,
      y,
      scale,
      rotation: opts.rotation ?? 0,
      opacity: opts.opacity ?? 1,
      easing,
    },
    {
      time: opts.endTime,
      x: opts.endX,
      y,
      scale,
      rotation: opts.rotation ?? 0,
      opacity: opts.opacity ?? 1,
      easing,
    },
  ];
}

export function enterFromLeft(opts: {
  time: number;
  targetX: number;
  y?: number;
  scale?: number;
  offscreenX?: number;
  poseAssetId?: string;
  poseEndTime?: number;
}): MovementPresetResult {
  const y = opts.y ?? DEFAULT_Y;
  const scale = opts.scale ?? DEFAULT_SCALE;
  const keyframes: Keyframe[] = [
    {
      time: opts.time,
      x: opts.offscreenX ?? -900,
      y,
      scale,
      rotation: 0,
      opacity: 1,
      easing: 'ease-out',
    },
    {
      time: opts.time + 0.01,
      x: opts.targetX,
      y,
      scale,
      rotation: 0,
      opacity: 1,
      easing: 'ease-out',
    },
  ];
  const poseSegments = opts.poseAssetId
    ? [{ assetId: opts.poseAssetId, startTime: opts.time, endTime: opts.poseEndTime ?? opts.time + 0.01 }]
    : undefined;
  return { keyframes, poseSegments };
}

export function enterFromRight(opts: {
  startTime: number;
  endTime: number;
  targetX: number;
  y?: number;
  scale?: number;
  offscreenX?: number;
  walkAssetId?: string;
}): MovementPresetResult {
  const keyframes = moveToPosition({
    startTime: opts.startTime,
    endTime: opts.endTime,
    startX: opts.offscreenX ?? 900,
    endX: opts.targetX,
    y: opts.y,
    scale: opts.scale,
    easing: 'ease-out',
  });
  const poseSegments = opts.walkAssetId
    ? [{ assetId: opts.walkAssetId, startTime: opts.startTime, endTime: opts.endTime }]
    : undefined;
  return { keyframes, poseSegments };
}

export function exitLeft(opts: MovementPresetOptions): Keyframe[] {
  return moveToPosition({
    ...opts,
    endX: opts.endX ?? -900,
    easing: opts.easing ?? 'ease-in',
  });
}

export function exitRight(opts: MovementPresetOptions): Keyframe[] {
  return moveToPosition({
    ...opts,
    endX: opts.endX ?? 900,
    easing: opts.easing ?? 'ease-in',
  });
}

export function idle(opts: {
  time?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
  poseAssetId?: string;
}): MovementPresetResult {
  const time = opts.time ?? 0;
  const kf: Keyframe = {
    time,
    x: opts.x ?? 0,
    y: opts.y ?? DEFAULT_Y,
    scale: opts.scale ?? DEFAULT_SCALE,
    rotation: 0,
    opacity: 1,
    easing: 'linear',
  };
  const keyframes =
    opts.duration && opts.duration > 0 ? [kf, { ...kf, time: time + opts.duration }] : [kf];
  const poseSegments = opts.poseAssetId
    ? [{ assetId: opts.poseAssetId, startTime: time, endTime: time + (opts.duration ?? 999) }]
    : undefined;
  return { keyframes, poseSegments };
}

export function jump(opts: {
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  scale?: number;
  jumpHeight?: number;
}): Keyframe[] {
  const mid = (opts.startTime + opts.endTime) / 2;
  const scale = opts.scale ?? DEFAULT_SCALE;
  const h = opts.jumpHeight ?? 80;
  return [
    { time: opts.startTime, x: opts.x, y: opts.y, scale, rotation: 0, opacity: 1, easing: 'ease-out' },
    { time: mid, x: opts.x, y: opts.y - h, scale, rotation: 0, opacity: 1, easing: 'ease-out' },
    { time: opts.endTime, x: opts.x, y: opts.y, scale, rotation: 0, opacity: 1, easing: 'ease-in' },
  ];
}

export function stop(opts: {
  time?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
  poseAssetId?: string;
}): MovementPresetResult {
  return idle(opts);
}

export function flyAtHeight(opts: MovementPresetOptions & { flyY?: number }): MovementPresetResult {
  const { flyY, ...rest } = opts;
  return flyAcrossScene({ ...rest, y: flyY ?? getGroundY(1080) - 200 });
}

export function point(opts: {
  time?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
  poseAssetId?: string;
}): MovementPresetResult {
  return idle({ ...opts, time: opts.time ?? 0, duration: opts.duration ?? 2 });
}

export function wave(opts: {
  time?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
  poseAssetId?: string;
}): MovementPresetResult {
  return idle({ ...opts, time: opts.time ?? 0, duration: opts.duration ?? 2 });
}
