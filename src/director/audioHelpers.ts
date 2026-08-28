import type { AudioTrack, AudioTrackType, Scene } from '../types/project';

let audioIdCounter = 0;

export function resetAudioCounter(): void {
  audioIdCounter = 0;
}

function newAudioId(prefix: string): string {
  audioIdCounter += 1;
  return `${prefix}-${audioIdCounter}`;
}

export type AudioCueOptions = {
  id?: string;
  name?: string;
  assetId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  volume?: number;
  muted?: boolean;
  fadeIn?: number;
  fadeOut?: number;
};

function buildTrack(type: AudioTrackType, opts: AudioCueOptions, defaultVolume: number): AudioTrack {
  const duration =
    opts.duration ??
    (opts.endTime !== undefined ? Math.max(0.01, opts.endTime - opts.startTime) : undefined);

  return {
    id: opts.id ?? newAudioId(type),
    name: opts.name ?? opts.assetId,
    type,
    assetId: opts.assetId,
    startTime: opts.startTime,
    duration,
    volume: opts.volume ?? defaultVolume,
    muted: opts.muted ?? false,
    fadeIn: opts.fadeIn,
    fadeOut: opts.fadeOut,
  };
}

export function addMusic(scene: Scene, opts: AudioCueOptions): Scene {
  const track = buildTrack('music', opts, 0.35);
  return { ...scene, audioTracks: [...scene.audioTracks, track] };
}

export function addAmbience(scene: Scene, opts: AudioCueOptions): Scene {
  const track = buildTrack('ambience', opts, 0.25);
  return { ...scene, audioTracks: [...scene.audioTracks, track] };
}

export function addSfx(scene: Scene, opts: AudioCueOptions): Scene {
  const track = buildTrack('sfx', opts, 0.7);
  return { ...scene, audioTracks: [...scene.audioTracks, track] };
}

export function addDialogueCue(scene: Scene, opts: AudioCueOptions): Scene {
  const track = buildTrack('dialogue', opts, 0.9);
  return { ...scene, audioTracks: [...scene.audioTracks, track] };
}

export function setAudioVolume(track: AudioTrack, volume: number): AudioTrack {
  return { ...track, volume: Math.max(0, Math.min(1, volume)) };
}

export function fadeAudio(
  track: AudioTrack,
  fades: { fadeIn?: number; fadeOut?: number },
): AudioTrack {
  return { ...track, ...fades };
}

export function addAudioTracks(scene: Scene, tracks: AudioTrack[]): Scene {
  return { ...scene, audioTracks: [...scene.audioTracks, ...tracks] };
}

export function createMusicTrack(opts: AudioCueOptions): AudioTrack {
  return buildTrack('music', opts, 0.35);
}

export function createAmbienceTrack(opts: AudioCueOptions): AudioTrack {
  return buildTrack('ambience', opts, 0.25);
}

export function createSfxTrack(opts: AudioCueOptions): AudioTrack {
  return buildTrack('sfx', opts, 0.7);
}

export function createDialogueTrack(opts: AudioCueOptions): AudioTrack {
  return buildTrack('dialogue', opts, 0.9);
}
