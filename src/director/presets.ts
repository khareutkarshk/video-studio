import type { Keyframe } from '../types/project';

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

const DEFAULT_Y = 142;
const DEFAULT_SCALE = 0.7;

export function walkAcrossScene(opts: MovementPresetOptions): Keyframe[] {
  return moveToPosition(opts);
}

export function runAcrossScene(opts: MovementPresetOptions): Keyframe[] {
  return moveToPosition({ ...opts, easing: opts.easing ?? 'ease-in-out' });
}

export function flyAcrossScene(opts: MovementPresetOptions): Keyframe[] {
  return moveToPosition({ ...opts, y: opts.y ?? 0, easing: opts.easing ?? 'linear' });
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
}): Keyframe[] {
  return [
    {
      time: opts.time,
      x: opts.offscreenX ?? -900,
      y: opts.y ?? DEFAULT_Y,
      scale: opts.scale ?? DEFAULT_SCALE,
      rotation: 0,
      opacity: 1,
      easing: 'ease-out',
    },
    {
      time: opts.time + 0.01,
      x: opts.targetX,
      y: opts.y ?? DEFAULT_Y,
      scale: opts.scale ?? DEFAULT_SCALE,
      rotation: 0,
      opacity: 1,
      easing: 'ease-out',
    },
  ];
}

export function enterFromRight(opts: {
  startTime: number;
  endTime: number;
  targetX: number;
  y?: number;
  scale?: number;
  offscreenX?: number;
}): Keyframe[] {
  return moveToPosition({
    startTime: opts.startTime,
    endTime: opts.endTime,
    startX: opts.offscreenX ?? 900,
    endX: opts.targetX,
    y: opts.y,
    scale: opts.scale,
    easing: 'ease-out',
  });
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
}): Keyframe[] {
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
  if (opts.duration && opts.duration > 0) {
    return [kf, { ...kf, time: time + opts.duration }];
  }
  return [kf];
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

export function point(opts: {
  time?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
}): Keyframe[] {
  return idle({ ...opts, time: opts.time ?? 0, duration: opts.duration ?? 2 });
}

export function wave(opts: {
  time?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
}): Keyframe[] {
  return idle({ ...opts, time: opts.time ?? 0, duration: opts.duration ?? 2 });
}
