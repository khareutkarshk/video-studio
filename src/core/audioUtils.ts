import type { AudioTrack } from '../types/project';

const DEFAULT_CLIP_DURATION = 1;

export function getTrackDuration(track: AudioTrack, assetDuration?: number): number {
  if (track.duration !== undefined && track.duration > 0) return track.duration;
  if (assetDuration !== undefined && assetDuration > 0) return assetDuration;
  return DEFAULT_CLIP_DURATION;
}

export function getTrackEndTime(track: AudioTrack, assetDuration?: number): number {
  return track.startTime + getTrackDuration(track, assetDuration);
}

export function isTrackActiveAt(track: AudioTrack, sceneTime: number, assetDuration?: number): boolean {
  const end = getTrackEndTime(track, assetDuration);
  return sceneTime >= track.startTime && sceneTime < end;
}

export function getTrackLocalTime(track: AudioTrack, sceneTime: number): number {
  return Math.max(0, sceneTime - track.startTime);
}

export function computeEffectiveVolume(
  track: AudioTrack,
  localTime: number,
  assetDuration?: number,
): number {
  if (track.muted) return 0;

  const clipDuration = getTrackDuration(track, assetDuration);
  let gain = track.volume;

  if (track.fadeIn !== undefined && track.fadeIn > 0 && localTime < track.fadeIn) {
    gain *= localTime / track.fadeIn;
  }

  if (track.fadeOut !== undefined && track.fadeOut > 0) {
    const timeUntilEnd = clipDuration - localTime;
    if (timeUntilEnd < track.fadeOut) {
      gain *= Math.max(0, timeUntilEnd / track.fadeOut);
    }
  }

  return Math.max(0, Math.min(1, gain));
}

export const DIALOGUE_DUCK_FACTOR = 0.35;

export function computePreviewVolume(
  track: AudioTrack,
  localTime: number,
  assetDuration: number | undefined,
  dialogueActive: boolean,
): number {
  const base = computeEffectiveVolume(track, localTime, assetDuration);
  if (track.type === 'dialogue') return base;
  if (dialogueActive && (track.type === 'music' || track.type === 'ambience')) {
    return Math.max(0, Math.min(1, base * DIALOGUE_DUCK_FACTOR));
  }
  return base;
}

export function isDialogueActiveAt(tracks: AudioTrack[], sceneTime: number): boolean {
  return tracks.some((t) => t.type === 'dialogue' && isTrackActiveAt(t, sceneTime));
}

export function shouldPreloadTrack(
  track: AudioTrack,
  sceneTime: number,
  assetDuration?: number,
  lookaheadSeconds = 2,
): boolean {
  const end = getTrackEndTime(track, assetDuration);
  return sceneTime + lookaheadSeconds >= track.startTime && sceneTime <= end;
}
