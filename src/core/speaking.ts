import type { AudioTrack, Scene } from '../types/project';
import { getTrackEndTime } from './audioUtils';

export type SpeakingWindow = {
  speaker: string;
  startTime: number;
  endTime: number;
  trackId: string;
  layerId?: string;
};

export function getDialogueTracks(scene: Scene): AudioTrack[] {
  return (scene.audioTracks ?? []).filter((t) => t.type === 'dialogue');
}

export function getSpeakingWindows(scene: Scene): SpeakingWindow[] {
  return getDialogueTracks(scene)
    .filter((t) => Boolean(t.speaker))
    .map((t) => ({
      speaker: t.speaker!.toUpperCase(),
      startTime: t.startTime,
      endTime: getTrackEndTime(t),
      trackId: t.id,
      layerId: t.layerId,
    }));
}

export function getActiveSpeakingCues(scene: Scene, time: number): SpeakingWindow[] {
  return getSpeakingWindows(scene).filter((w) => time >= w.startTime && time < w.endTime);
}

export function isLayerSpeaking(
  scene: Scene,
  layerId: string,
  character: string | undefined,
  time: number,
): boolean {
  const cues = getActiveSpeakingCues(scene, time);
  if (cues.length === 0) return false;
  const char = character?.toUpperCase();
  return cues.some(
    (c) => c.layerId === layerId || (char !== undefined && c.speaker === char),
  );
}

const SPEAKING_MOTION_ACTIONS = new Set(['idle', 'talk', 'face', 'unknown']);

export function allowsSpeakingMotion(action: string | undefined): boolean {
  if (!action) return true;
  return SPEAKING_MOTION_ACTIONS.has(action);
}

/** Tiny vertical bob in screen pixels for idle/talk poses only. */
export function speakingBobOffset(sceneTime: number): number {
  return Math.sin(sceneTime * 14) * 2;
}
