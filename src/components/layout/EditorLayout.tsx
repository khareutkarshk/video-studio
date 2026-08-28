import { TopBar } from './TopBar';
import { AssetsPanel } from '../panels/AssetsPanel';
import { PreviewPanel } from '../panels/PreviewPanel';
import { InspectorPanel } from '../panels/InspectorPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { usePlaybackLoop } from '../../hooks/usePlayback';

export function EditorLayout() {
  usePlaybackLoop();

  return (
    <div className="editor-layout">
      <TopBar />
      <div className="editor-main">
        <AssetsPanel />
        <PreviewPanel />
        <InspectorPanel />
      </div>
      <TimelinePanel />
    </div>
  );
}
