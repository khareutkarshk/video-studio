import { PreviewCanvas } from '../preview/PreviewCanvas';

export function PreviewPanel() {
  return (
    <div className="panel preview-panel">
      <div className="panel-header">Preview</div>
      <div className="panel-body preview-body">
        <PreviewCanvas />
      </div>
    </div>
  );
}
