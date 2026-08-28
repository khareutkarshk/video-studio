import { useMemo } from 'react';
import { useProjectStore } from '../store/ProjectContext';
import { getSelectedLayer } from '../store/projectReducer';
import { getTransformAtTime } from '../core/interpolation';
import type { TransformProps } from '../types/project';

export function useTransformAtTime(time?: number): TransformProps | null {
  const { state } = useProjectStore();
  const layer = getSelectedLayer(state);
  const t = time ?? state.editor.currentTime;

  return useMemo(() => {
    if (!layer) return null;
    return getTransformAtTime(layer, t);
  }, [layer, t]);
}
