import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import {
  historyReducer,
  initialHistoryState,
  type AppAction,
  type AppState,
  type HistoryState,
} from './projectReducer';

type ProjectContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  canUndo: boolean;
  canRedo: boolean;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

function getPresent(history: HistoryState): AppState {
  return history.present;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, initialHistoryState);

  const value: ProjectContextValue = {
    state: getPresent(history),
    dispatch,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectStore(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectStore must be used within ProjectProvider');
  return ctx;
}
