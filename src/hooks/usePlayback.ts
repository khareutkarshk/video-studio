import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/ProjectContext';
import { getActiveSceneFromState } from '../store/projectReducer';
import { clampTime } from '../core/playback';

export function usePlaybackLoop() {
  const { state, dispatch } = useProjectStore();
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const currentTimeRef = useRef(state.editor.currentTime);
  const isPlayingRef = useRef(state.editor.playbackState === 'playing');

  const scene = getActiveSceneFromState(state);
  const duration = scene.duration;

  currentTimeRef.current = state.editor.currentTime;
  isPlayingRef.current = state.editor.playbackState === 'playing';

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
  }, [state.editor.playbackState, duration, dispatch]);
}
