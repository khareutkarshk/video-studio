import { useRef, useState } from 'react';
import {
  OUTPUT_PRESETS,
  createCustomFormat,
  findOutputPreset,
} from '../../constants/outputPresets';
import { serializeProjectFile, loadProjectFromFile } from '../../core/projectIO';
import { exportToMp4, downloadBlob } from '../../export/exportPipeline';
import { useProjectStore } from '../../store/ProjectContext';

export function TopBar() {
  const { state, dispatch, canUndo, canRedo } = useProjectStore();
  const { project, outputFormat, editor } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCustomFormat, setShowCustomFormat] = useState(false);
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [customFps, setCustomFps] = useState(30);
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    const file = serializeProjectFile(project, outputFormat.id);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await loadProjectFromFile(file);
      dispatch({ type: 'LOAD_PROJECT', project: data.project, outputFormatId: data.outputFormatId });
      if (data.outputFormatId) {
        const preset = findOutputPreset(data.outputFormatId);
        if (preset) dispatch({ type: 'SET_OUTPUT_FORMAT', format: preset });
      }
    } catch (err) {
      alert(`Failed to load project: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    e.target.value = '';
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    dispatch({ type: 'SET_EXPORT_STATUS', progress: 0, message: 'Starting export...' });
    try {
      const blob = await exportToMp4(project, outputFormat, (progress, message) => {
        dispatch({ type: 'SET_EXPORT_STATUS', progress, message });
      });
      const filename = `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}_${outputFormat.width}x${outputFormat.height}.mp4`;
      downloadBlob(blob, filename);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
      dispatch({ type: 'SET_EXPORT_STATUS', progress: null, message: null });
    }
  };

  const applyCustomFormat = () => {
    dispatch({
      type: 'SET_OUTPUT_FORMAT',
      format: createCustomFormat(customW, customH, customFps),
    });
    setShowCustomFormat(false);
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <input
          className="project-name-input"
          value={project.name}
          onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', name: e.target.value })}
        />
      </div>

      <div className="top-bar-center">
        <label className="format-label">
          Output
          <select
            className="format-select"
            value={outputFormat.custom ? 'custom' : outputFormat.id}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowCustomFormat(true);
                return;
              }
              const preset = OUTPUT_PRESETS.find((p) => p.id === e.target.value);
              if (preset) dispatch({ type: 'SET_OUTPUT_FORMAT', format: preset });
            }}
          >
            {OUTPUT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label} ({preset.width}×{preset.height})
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
        </label>

        {showCustomFormat && (
          <div className="custom-format-popover">
            <input type="number" value={customW} onChange={(e) => setCustomW(+e.target.value)} placeholder="W" />
            <span>×</span>
            <input type="number" value={customH} onChange={(e) => setCustomH(+e.target.value)} placeholder="H" />
            <input type="number" value={customFps} onChange={(e) => setCustomFps(+e.target.value)} placeholder="FPS" />
            <button className="btn btn-secondary btn-sm" onClick={applyCustomFormat}>Apply</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCustomFormat(false)}>✕</button>
          </div>
        )}

        {editor.exportProgress !== null && (
          <span className="export-status">
            {editor.exportMessage} ({editor.exportProgress}%)
          </span>
        )}
      </div>

      <div className="top-bar-right">
        <button className="btn btn-ghost" disabled={!canUndo} onClick={() => dispatch({ type: 'UNDO' })} title="Undo">
          ↩ Undo
        </button>
        <button className="btn btn-ghost" disabled={!canRedo} onClick={() => dispatch({ type: 'REDO' })} title="Redo">
          ↪ Redo
        </button>
        <button className="btn btn-secondary" onClick={handleSave}>Save</button>
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>Load</button>
        <input ref={fileInputRef} type="file" accept=".json" hidden onChange={handleLoad} />
        <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export MP4'}
        </button>
        <button className="btn btn-danger" onClick={() => dispatch({ type: 'RESET_PROJECT' })}>
          Reset
        </button>
      </div>
    </header>
  );
}
