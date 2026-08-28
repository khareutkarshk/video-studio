import { TopBar } from './TopBar';
import { AssetsPanel } from '../panels/AssetsPanel';
import { PreviewPanel } from '../panels/PreviewPanel';
import { InspectorPanel } from '../panels/InspectorPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { ScenesPanel, LayersPanel, SceneSettingsPanel } from '../panels/ScenesPanel';
import { usePlaybackLoop } from '../../hooks/usePlayback';

export function EditorLayout() {
  usePlaybackLoop();

  return (
    <div className="editor-layout">
      <TopBar />
      <div className="editor-main">
        <div className="editor-left-column">
          <ScenesPanel />
          <AssetsPanel />
        </div>
        <PreviewPanel />
        <div className="editor-right-column">
          <LayersPanel />
          <InspectorPanel />
          <SceneSettingsPanel />
        </div>
      </div>
      <TimelinePanel />
    </div>
  );
}
