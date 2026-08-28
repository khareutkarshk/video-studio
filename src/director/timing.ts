import type { Layer } from '../types/project';

const REFERENCE_HEIGHT = 1080;
const WALK_SPEED = 380;
const MIN_WALK_DURATION = 2;
const MAX_WALK_DURATION = 4;
const REACTION_MIN = 1;
const REACTION_MAX = 2;
const TRANSITION_MIN = 0.5;
const TRANSITION_MAX = 1;
const SCENE_PADDING = 0.3;

export function estimateWalkDuration(opts: {
  startX: number;
  endX: number;
  speed?: number;
}): number {
  const distance = Math.abs(opts.endX - opts.startX);
  const speed = opts.speed ?? WALK_SPEED;
  const raw = distance / speed;
  return clamp(raw, MIN_WALK_DURATION, MAX_WALK_DURATION);
}

export function estimateReactionDuration(opts?: { beats?: number }): number {
  const beats = opts?.beats ?? 1;
  const perBeat = (REACTION_MIN + REACTION_MAX) / 2;
  return clamp(beats * perBeat, REACTION_MIN, REACTION_MAX * 2);
}

export function estimateHoldDuration(): number {
  return 2;
}

const DIALOGUE_CHARS_PER_SECOND = 13;
const DIALOGUE_MIN = 1.2;
const DIALOGUE_PAUSE = 0.4;

export function estimateDialogueDuration(text: string, audioDuration?: number): number {
  if (audioDuration !== undefined && audioDuration > 0) {
    return roundTime(audioDuration + DIALOGUE_PAUSE);
  }
  const chars = text.replace(/\s+/g, ' ').trim().length;
  const spoken = Math.max(DIALOGUE_MIN, chars / DIALOGUE_CHARS_PER_SECOND);
  return roundTime(spoken + DIALOGUE_PAUSE);
}

export function estimateTransitionDuration(): number {
  return (TRANSITION_MIN + TRANSITION_MAX) / 2;
}

export function sceneDurationFromLayers(layers: Layer[], padding = SCENE_PADDING): number {
  let maxEnd = 0;
  for (const layer of layers) {
    maxEnd = Math.max(maxEnd, layer.endTime);
    for (const kf of layer.keyframes) {
      maxEnd = Math.max(maxEnd, kf.time);
    }
    for (const seg of layer.poseSegments ?? []) {
      maxEnd = Math.max(maxEnd, seg.endTime);
    }
  }
  return roundTime(maxEnd + padding);
}

export function roundTime(seconds: number): number {
  return Math.round(seconds * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return roundTime(Math.max(min, Math.min(max, value)));
}

export const TIMING_GUIDELINES = {
  walk: { min: MIN_WALK_DURATION, max: MAX_WALK_DURATION },
  reaction: { min: REACTION_MIN, max: REACTION_MAX },
  transition: { min: TRANSITION_MIN, max: TRANSITION_MAX },
  referenceHeight: REFERENCE_HEIGHT,
} as const;
