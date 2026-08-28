import { ProjectProvider } from './store/ProjectContext';
import { EditorLayout } from './components/layout/EditorLayout';
import { ASSET_REGISTRY } from './assets/registry';
import { preloadAssets } from './assets/loadImage';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    preloadAssets(ASSET_REGISTRY.map((a) => a.url));
  }, []);

  return (
    <ProjectProvider>
      <EditorLayout />
    </ProjectProvider>
  );
}

export default App;
