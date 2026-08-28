import { OUTPUT_PRESETS } from '../../constants/outputPresets';
import { useProjectStore } from '../../store/ProjectContext';

export function TopBar() {
  const { state, dispatch } = useProjectStore();
  const { project, outputFormat } = state;

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span className="project-name">{project.name}</span>
      </div>

      <div className="top-bar-center">
        <label className="format-label">
          Output Format
          <select
            className="format-select"
            value={outputFormat.id}
            onChange={(e) => {
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
      </div>

      <div className="top-bar-right">
        <button className="btn btn-ghost" disabled title="Undo (coming soon)">
          ↩ Undo
        </button>
        <button className="btn btn-ghost" disabled title="Redo (coming soon)">
          ↪ Redo
        </button>
        <button
          className="btn btn-danger"
          onClick={() => dispatch({ type: 'RESET_PROJECT' })}
        >
          Reset Project
        </button>
      </div>
    </header>
  );
}
