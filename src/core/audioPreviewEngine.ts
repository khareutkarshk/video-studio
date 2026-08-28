import type { AudioTrack } from '../types/project';
import type { PlaybackState } from '../types/editor';
import {
  computeEffectiveVolume,
  getTrackDuration,
  getTrackLocalTime,
  isTrackActiveAt,
  shouldPreloadTrack,
} from './audioUtils';

export type ResolvedAudioAsset = {
  url: string;
  durationSeconds?: number;
};

export type AudioSyncParams = {
  sceneId: string;
  tracks: AudioTrack[];
  sceneTime: number;
  playbackState: PlaybackState;
  resolveAsset: (assetId: string) => ResolvedAudioAsset | undefined;
};

const DRIFT_THRESHOLD = 0.15;
const LOOKAHEAD_SECONDS = 2;

export class AudioPreviewEngine {
  private elements = new Map<string, HTMLAudioElement>();
  private assetDurations = new Map<string, number>();
  private currentSceneId: string | null = null;
  private trackSceneMap = new Map<string, string>();

  resetScene(sceneId: string): void {
    if (this.currentSceneId === sceneId) return;
    this.pauseAll();
    for (const [trackId, scene] of this.trackSceneMap) {
      if (scene !== sceneId) {
        this.releaseTrack(trackId);
      }
    }
    this.currentSceneId = sceneId;
  }

  sync(params: AudioSyncParams): void {
    const { sceneId, tracks, sceneTime, playbackState, resolveAsset } = params;

    if (this.currentSceneId !== sceneId) {
      this.resetScene(sceneId);
    }

    const activeTrackIds = new Set(tracks.map((t) => t.id));

    for (const trackId of [...this.trackSceneMap.keys()]) {
      if (!activeTrackIds.has(trackId) || this.trackSceneMap.get(trackId) !== sceneId) {
        this.releaseTrack(trackId);
      }
    }

    for (const track of tracks) {
      const asset = resolveAsset(track.assetId);
      if (!asset) continue;

      const assetDuration =
        this.assetDurations.get(track.assetId) ?? asset.durationSeconds;
      const clipDuration = getTrackDuration(track, assetDuration);
      const active = isTrackActiveAt(track, sceneTime, assetDuration);
      const preload = shouldPreloadTrack(track, sceneTime, assetDuration, LOOKAHEAD_SECONDS);

      if (!active && !preload) {
        this.pauseTrack(track.id);
        continue;
      }

      const audio = this.ensureElement(track.id, asset.url, track.assetId);
      this.trackSceneMap.set(track.id, sceneId);

      if (!Number.isFinite(audio.duration) && assetDuration) {
        // duration may be set after loadedmetadata
      }

      const localTime = getTrackLocalTime(track, sceneTime);
      const volume = computeEffectiveVolume(track, localTime, assetDuration);

      audio.volume = volume;

      if (playbackState === 'playing' && active) {
        if (Math.abs(audio.currentTime - localTime) > DRIFT_THRESHOLD) {
          audio.currentTime = localTime;
        }
        if (localTime >= 0 && localTime < clipDuration) {
          void audio.play().catch(() => undefined);
        } else {
          audio.pause();
        }
      } else {
        audio.pause();
        if (playbackState === 'stopped' || playbackState === 'paused') {
          if (active || preload) {
            audio.currentTime = Math.min(localTime, clipDuration);
          }
        }
      }
    }
  }

  dispose(): void {
    for (const trackId of [...this.elements.keys()]) {
      this.releaseTrack(trackId);
    }
    this.currentSceneId = null;
    this.trackSceneMap.clear();
    this.assetDurations.clear();
  }

  private ensureElement(trackId: string, url: string, assetId: string): HTMLAudioElement {
    let audio = this.elements.get(trackId);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = 'auto';
      audio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(audio!.duration) && audio!.duration > 0) {
          this.assetDurations.set(assetId, audio!.duration);
        }
      });
      this.elements.set(trackId, audio);
    } else if (audio.src !== new URL(url, window.location.href).href) {
      audio.src = url;
    }
    return audio;
  }

  private pauseTrack(trackId: string): void {
    const audio = this.elements.get(trackId);
    if (audio) audio.pause();
  }

  private pauseAll(): void {
    for (const audio of this.elements.values()) {
      audio.pause();
    }
  }

  private releaseTrack(trackId: string): void {
    const audio = this.elements.get(trackId);
    if (audio) {
      audio.pause();
      audio.src = '';
      this.elements.delete(trackId);
    }
    this.trackSceneMap.delete(trackId);
  }
}
