import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/ProjectContext';
import { getActiveSceneFromState } from '../store/projectReducer';
import { clampTime } from '../core/playback';
import { AudioPreviewEngine } from '../core/audioPreviewEngine';
import { getAssetByIdWithRuntime } from '../assets/registry';

export function usePlaybackLoop() {
  const { state, dispatch } = useProjectStore();
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const currentTimeRef = useRef(state.editor.currentTime);
  const isPlayingRef = useRef(state.editor.playbackState === 'playing');
  const audioEngineRef = useRef<AudioPreviewEngine | null>(null);
  const prevSceneIdRef = useRef(state.editor.activeSceneId);

  const scene = getActiveSceneFromState(state);
  const duration = scene.duration;
  const { scenes } = state.project;
  const activeIndex = scenes.findIndex((s) => s.id === state.editor.activeSceneId);

  currentTimeRef.current = state.editor.currentTime;
  isPlayingRef.current = state.editor.playbackState === 'playing';

  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioPreviewEngine();
  }

  const syncAudio = (sceneTime: number) => {
    const engine = audioEngineRef.current;
    if (!engine) return;

    engine.sync({
      sceneId: state.editor.activeSceneId,
      tracks: scene.audioTracks,
      sceneTime,
      playbackState: state.editor.playbackState,
      resolveAsset: (assetId) => {
        const asset = getAssetByIdWithRuntime(assetId);
        if (!asset || asset.type !== 'audio') return undefined;
        return {
          url: asset.url,
          durationSeconds: asset.durationSeconds,
        };
      },
    });
  };

  useEffect(() => {
    if (prevSceneIdRef.current !== state.editor.activeSceneId) {
      audioEngineRef.current?.resetScene(state.editor.activeSceneId);
      prevSceneIdRef.current = state.editor.activeSceneId;
    }
    syncAudio(state.editor.currentTime);
  }, [
    scene.audioTracks,
    state.editor.playbackState,
    state.editor.currentTime,
    state.editor.activeSceneId,
    scene,
  ]);

  useEffect(() => {
    return () => {
      audioEngineRef.current?.dispose();
      audioEngineRef.current = null;
    };
  }, []);

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

      let next = currentTimeRef.current + delta;
      let sceneDuration = duration;
      let sceneIndex = activeIndex;

      if (next >= sceneDuration) {
        if (sceneIndex < scenes.length - 1) {
          const nextScene = scenes[sceneIndex + 1];
          audioEngineRef.current?.resetScene(nextScene.id);
          dispatch({ type: 'ADVANCE_TO_SCENE', sceneId: nextScene.id });
          currentTimeRef.current = 0;
          syncAudio(0);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        dispatch({ type: 'SET_CURRENT_TIME', time: sceneDuration });
        dispatch({ type: 'SET_PLAYBACK_STATE', state: 'paused' });
        syncAudio(sceneDuration);
        return;
      }

      next = clampTime(next, sceneDuration);
      dispatch({ type: 'SET_CURRENT_TIME', time: next });
      currentTimeRef.current = next;
      syncAudio(next);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
    };
  }, [state.editor.playbackState, duration, dispatch, activeIndex, scenes]);
}
