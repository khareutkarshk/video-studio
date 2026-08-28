import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/ProjectContext';
import { getActiveSceneFromState, getTotalDuration } from '../store/projectReducer';
import { clampTime } from '../core/playback';
import { getAssetByIdWithRuntime } from '../assets/registry';

export function usePlaybackLoop() {
  const { state, dispatch } = useProjectStore();
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const currentTimeRef = useRef(state.editor.currentTime);
  const isPlayingRef = useRef(state.editor.playbackState === 'playing');
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const scene = getActiveSceneFromState(state);
  const duration = scene.duration;
  const totalDuration = getTotalDuration(state.project);

  currentTimeRef.current = state.editor.currentTime;
  isPlayingRef.current = state.editor.playbackState === 'playing';

  // Sync audio tracks for active scene
  useEffect(() => {
    const tracks = scene.audioTracks;
    const playing = state.editor.playbackState === 'playing';
    const t = state.editor.currentTime;

    for (const track of tracks) {
      let audio = audioRefs.current.get(track.id);
      const asset = getAssetByIdWithRuntime(track.assetId);
      if (!asset) continue;

      if (!audio) {
        audio = new Audio(asset.url);
        audioRefs.current.set(track.id, audio);
      }

      audio.volume = track.volume;

      if (playing) {
        const targetTime = Math.max(0, t - track.startTime);
        if (Math.abs(audio.currentTime - targetTime) > 0.3) {
          audio.currentTime = targetTime;
        }
        if (targetTime >= 0 && targetTime < audio.duration) {
          audio.play().catch(() => undefined);
        }
      } else {
        audio.pause();
        if (state.editor.playbackState === 'stopped') {
          audio.currentTime = Math.max(0, t - track.startTime);
        }
      }
    }

    return () => {
      for (const audio of audioRefs.current.values()) {
        audio.pause();
      }
    };
  }, [scene.audioTracks, state.editor.playbackState, state.editor.currentTime, scene]);

  useEffect(() => {
    if (state.editor.playbackState !== 'playing') {
      lastFrameRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (!isPlayingRef.current) return;

      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }
      const delta = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      const next = clampTime(currentTimeRef.current + delta, duration);
      dispatch({ type: 'SET_CURRENT_TIME', time: next });
      currentTimeRef.current = next;

      if (next >= duration) {
        dispatch({ type: 'SET_PLAYBACK_STATE', state: 'paused' });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
    };
  }, [state.editor.playbackState, duration, dispatch, totalDuration]);
}
