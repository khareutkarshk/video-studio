import { useProjectStore } from '../../store/ProjectContext';

export function ScenesPanel() {
  const { state, dispatch } = useProjectStore();
  const { project, editor } = state;

  return (
    <div className="panel scenes-panel">
      <div className="panel-header">
        <span>Scenes</span>
        <button
          className="btn-icon"
          title="Add scene"
          onClick={() => dispatch({ type: 'ADD_SCENE' })}
        >
          +
        </button>
      </div>
      <div className="panel-body scenes-body">
        {project.scenes.map((scene) => (
          <div
            key={scene.id}
            className={`scene-item ${editor.activeSceneId === scene.id ? 'active' : ''}`}
          >
            <button
              className="scene-item-main"
              onClick={() => dispatch({ type: 'SET_ACTIVE_SCENE', sceneId: scene.id })}
            >
              <span className="scene-name">{scene.name}</span>
              <span className="scene-duration">{scene.duration}s</span>
            </button>
            <div className="scene-item-actions">
              <button
                className="btn-icon"
                title="Duplicate"
                onClick={() => dispatch({ type: 'DUPLICATE_SCENE', sceneId: scene.id })}
              >
                ⧉
              </button>
              {project.scenes.length > 1 && (
                <button
                  className="btn-icon btn-icon-danger"
                  title="Delete"
                  onClick={() => dispatch({ type: 'DELETE_SCENE', sceneId: scene.id })}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LayersPanel() {
  const { state, dispatch } = useProjectStore();
  const scene = state.project.scenes.find((s) => s.id === state.editor.activeSceneId)!;
  const sorted = [...scene.layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="panel layers-panel">
      <div className="panel-header">Layers</div>
      <div className="panel-body layers-body">
        {sorted.length === 0 && (
          <div className="layers-empty">No layers — add a character from Assets</div>
        )}
        {sorted.map((layer) => {
          const selected =
            state.editor.selection.type !== 'none' &&
            state.editor.selection.layerId === layer.id;
          return (
            <div key={layer.id} className={`layer-item ${selected ? 'active' : ''}`}>
              <button
                className="layer-visibility"
                title={layer.visible ? 'Hide' : 'Show'}
                onClick={() => dispatch({ type: 'TOGGLE_LAYER_VISIBLE', layerId: layer.id })}
              >
                {layer.visible ? '👁' : '○'}
              </button>
              <button
                className="layer-lock"
                title={layer.locked ? 'Unlock' : 'Lock'}
                onClick={() => dispatch({ type: 'TOGGLE_LAYER_LOCK', layerId: layer.id })}
              >
                {layer.locked ? '🔒' : '🔓'}
              </button>
              <button
                className="layer-name"
                onClick={() =>
                  dispatch({ type: 'SELECT', selection: { type: 'layer', layerId: layer.id } })
                }
              >
                {layer.name}
              </button>
              <div className="layer-actions">
                <button
                  className="btn-icon"
                  title="Move up"
                  onClick={() => dispatch({ type: 'REORDER_LAYER', layerId: layer.id, direction: 'up' })}
                >
                  ▲
                </button>
                <button
                  className="btn-icon"
                  title="Move down"
                  onClick={() => dispatch({ type: 'REORDER_LAYER', layerId: layer.id, direction: 'down' })}
                >
                  ▼
                </button>
                <button
                  className="btn-icon btn-icon-danger"
                  title="Delete"
                  onClick={() => dispatch({ type: 'DELETE_LAYER', layerId: layer.id })}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SceneSettingsPanel() {
  const { state, dispatch } = useProjectStore();
  const scene = state.project.scenes.find((s) => s.id === state.editor.activeSceneId)!;

  return (
    <div className="panel scene-settings-panel">
      <div className="panel-header">Scene Settings</div>
      <div className="panel-body scene-settings-body">
        <div className="inspector-field">
          <label className="inspector-label">Name</label>
          <input
            className="inspector-input"
            value={scene.name}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_SCENE',
                sceneId: scene.id,
                updates: { name: e.target.value },
              })
            }
          />
        </div>
        <div className="inspector-field">
          <label className="inspector-label">Duration</label>
          <input
            type="number"
            className="inspector-input"
            min={1}
            step={0.5}
            value={scene.duration}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_SCENE',
                sceneId: scene.id,
                updates: { duration: Math.max(1, +e.target.value) },
              })
            }
          />
        </div>
        <div className="inspector-field">
          <label className="inspector-label">Transition</label>
          <select
            className="inspector-input"
            value={scene.transition.type}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_SCENE',
                sceneId: scene.id,
                updates: {
                  transition: {
                    ...scene.transition,
                    type: e.target.value as 'none' | 'fade' | 'crossfade',
                  },
                },
              })
            }
          >
            <option value="none">None</option>
            <option value="fade">Fade</option>
            <option value="crossfade">Crossfade</option>
          </select>
        </div>
        {scene.transition.type !== 'none' && (
          <div className="inspector-field">
            <label className="inspector-label">Trans. Duration</label>
            <input
              type="number"
              className="inspector-input"
              min={0.1}
              step={0.1}
              value={scene.transition.duration}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_SCENE',
                  sceneId: scene.id,
                  updates: {
                    transition: { ...scene.transition, duration: +e.target.value },
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
