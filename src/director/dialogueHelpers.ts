import type { Scene, ReactionCue, ReactionCueKind } from '../types/project';
import { addDialogueCue, type AudioCueOptions } from './audioHelpers';
import { getTrackEndTime } from '../core/audioUtils';
import { estimateDialogueDuration } from './timing';

let reactionIdCounter = 0;

export function resetReactionCounter(): void {
  reactionIdCounter = 0;
}

function newReactionId(): string {
  reactionIdCounter += 1;
  return `reaction-${reactionIdCounter}`;
}

export type DialogueCueOptions = AudioCueOptions & {
  speaker: string;
  text: string;
};

export function addSpokenLine(scene: Scene, opts: DialogueCueOptions): Scene {
  const duration =
    opts.duration ??
    estimateDialogueDuration(opts.text, undefined);
  return addDialogueCue(scene, {
    ...opts,
    duration,
    volume: opts.volume ?? 0.9,
    name: opts.name ?? `${opts.speaker}: ${opts.text}`,
  });
}

export type ReactionAfterOptions = {
  id?: string;
  afterTrackId: string;
  speaker: string;
  delay?: number;
  kind?: ReactionCueKind;
  duration?: number;
};

export function scheduleReactionAfterDialogue(
  scene: Scene,
  opts: ReactionAfterOptions,
): Scene {
  const after = scene.audioTracks.find((t) => t.id === opts.afterTrackId);
  const startTime = after
    ? getTrackEndTime(after) + (opts.delay ?? 0.35)
    : (opts.delay ?? 0.35);
  const cue: ReactionCue = {
    id: opts.id ?? newReactionId(),
    speaker: opts.speaker.toUpperCase(),
    startTime,
    endTime: startTime + (opts.duration ?? 0.8),
    afterTrackId: opts.afterTrackId,
    kind: opts.kind ?? 'react',
  };
  return {
    ...scene,
    reactionCues: [...(scene.reactionCues ?? []), cue],
  };
}

export function getReactionCues(scene: Scene): ReactionCue[] {
  return scene.reactionCues ?? [];
}
