import { useRef, useState } from 'react';
import {
  OUTPUT_PRESETS,
  createCustomFormat,
  findOutputPreset,
} from '../../constants/outputPresets';
import { serializeProjectFile, loadProjectFromFile } from '../../core/projectIO';
import { ExportDialog } from '../export/ExportDialog';
import { useProjectStore } from '../../store/ProjectContext';

export function TopBar() {
  const { state, dispatch, canUndo, canRedo, isDirty } = useProjectStore();
  const { project, outputFormat, editor } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [customFps, setCustomFps] = useState(30);

  const confirmDiscard = () => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Discard them?');
  };

  const handleSave = () => {
    const file = serializeProjectFile(project, outputFormat.id);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'MARK_PROJECT_SAVED' });
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirmDiscard()) {
      e.target.value = '';
      return;
    }
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

  const applyCustomFormat = () => {
    dispatch({
      type: 'SET_OUTPUT_FORMAT',
      format: createCustomFormat(customW, customH, customFps),
    });
    setShowAdvanced(false);
  };

  const handleReset = () => {
    if (!confirmDiscard()) return;
    if (!window.confirm('Reset project to the default template?')) return;
    dispatch({ type: 'RESET_PROJECT' });
  };

  const progressLabel =
    editor.exportProgress !== null
      ? `${editor.exportMessage} (${editor.exportProgress}%)`
      : editor.exportMessage;

  return (
    <header className="top-bar">
      <ExportDialog open={showExportDialog} onClose={() => setShowExportDialog(false)} />

      <div className="top-bar-left">
        <input
          className="project-name-input"
          value={project.name}
          onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', name: e.target.value })}
        />
        {isDirty && <span className="unsaved-badge">Unsaved changes</span>}
      </div>

      <div className="top-bar-center">
        <label className="format-label">
          <input
            type="checkbox"
            checked={editor.showSafeAreaGuides}
            onChange={() => dispatch({ type: 'TOGGLE_SAFE_AREA_GUIDES' })}
          />
          Safe area
        </label>

        <label className="format-label">
          Preview format
          <select
            className="format-select"
            value={outputFormat.custom ? 'custom' : outputFormat.id}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowAdvanced(true);
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
          </select>
        </label>

        <button
          type="button"
          className="btn btn-ghost btn-sm advanced-toggle"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          Advanced
        </button>

        {showAdvanced && (
          <div className="custom-format-popover">
            <span className="advanced-label">Custom preview size</span>
            <input type="number" value={customW} onChange={(e) => setCustomW(+e.target.value)} placeholder="W" />
            <span>×</span>
            <input type="number" value={customH} onChange={(e) => setCustomH(+e.target.value)} placeholder="H" />
            <input type="number" value={customFps} onChange={(e) => setCustomFps(+e.target.value)} placeholder="FPS" />
            <button className="btn btn-secondary btn-sm" onClick={applyCustomFormat}>Apply</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdvanced(false)}>✕</button>
          </div>
        )}

        {editor.exportMessage && (
          <span className="export-status">{progressLabel}</span>
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
        <button className="btn btn-primary" onClick={() => setShowExportDialog(true)}>
          Export MP4
        </button>
        <button className="btn btn-danger" onClick={handleReset}>
          Reset
        </button>
      </div>
    </header>
  );
}
