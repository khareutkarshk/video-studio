import { useProjectStore } from '../store/ProjectContext';
import { getSelectedLayer } from '../store/projectReducer';

export function useSelectedLayer() {
  const { state } = useProjectStore();
  return getSelectedLayer(state);
}
