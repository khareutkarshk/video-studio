import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState, getSelectedLayer } from '../../store/projectReducer';
import { getTransformAtTime, findKeyframeAtTime } from '../../core/interpolation';
import { formatTime, formatDuration } from '../../core/playback';

export function InspectorPanel() {
  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const layer = getSelectedLayer(state);
  const { currentTime, selection } = state.editor;

  if (!layer) {
    return (
      <div className="panel inspector-panel">
        <div className="panel-header">Inspector</div>
        <div className="panel-body inspector-empty">
          Select a layer to edit properties
        </div>
      </div>
    );
  }

  const isKeyframeSelected = selection.type === 'keyframe';
  const selectedKfTime =
    selection.type === 'keyframe' ? selection.keyframeTime : null;

  const transform = isKeyframeSelected && selectedKfTime !== null
    ? layer.keyframes.find((k) => Math.abs(k.time - selectedKfTime) < 0.05) ??
      getTransformAtTime(layer, currentTime)
    : getTransformAtTime(layer, currentTime);

  const hasKeyframeAtPlayhead = !!findKeyframeAtTime(layer, currentTime);

  const update = (field: keyof typeof transform, value: number) => {
    if (isKeyframeSelected && selectedKfTime !== null) {
      dispatch({
        type: 'UPDATE_KEYFRAME',
        layerId: layer.id,
        keyframeTime: selectedKfTime,
        updates: { [field]: value },
      });
    } else {
      dispatch({
        type: 'UPDATE_LAYER_TRANSFORM',
        layerId: layer.id,
        transform: { [field]: value },
      });
    }
  };

  return (
    <div className="panel inspector-panel">
      <div className="panel-header">Inspector</div>
      <div className="panel-body inspector-body">
        <div className="inspector-section">
          <div className="inspector-label">Layer</div>
          <div className="inspector-value">{layer.id}</div>
        </div>

        {isKeyframeSelected && selectedKfTime !== null && (
          <div className="inspector-section">
            <div className="inspector-label">Keyframe Time</div>
            <input
              type="number"
              className="inspector-input"
              step="0.1"
              min="0"
              max={scene.duration}
              value={selectedKfTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                if (isNaN(newTime)) return;
                const kf = layer.keyframes.find(
                  (k) => Math.abs(k.time - selectedKfTime) < 0.05,
                );
                if (!kf) return;
                dispatch({
                  type: 'UPDATE_KEYFRAME',
                  layerId: layer.id,
                  keyframeTime: selectedKfTime,
                  updates: { time: newTime },
                });
                dispatch({
                  type: 'SELECT_KEYFRAME',
                  layerId: layer.id,
                  keyframeTime: newTime,
                });
              }}
            />
          </div>
        )}

        <NumberField label="X" value={transform.x} onChange={(v) => update('x', v)} />
        <NumberField label="Y" value={transform.y} onChange={(v) => update('y', v)} />
        <NumberField
          label="Scale"
          value={transform.scale}
          step={0.01}
          onChange={(v) => update('scale', v)}
        />
        <NumberField
          label="Rotation"
          value={transform.rotation}
          step={1}
          onChange={(v) => update('rotation', v)}
        />

        <div className="inspector-field">
          <label className="inspector-label">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={transform.opacity}
            onChange={(e) => update('opacity', parseFloat(e.target.value))}
          />
          <span className="inspector-range-value">{transform.opacity.toFixed(2)}</span>
        </div>

        <div className="inspector-actions">
          <button
            className="btn btn-secondary"
            onClick={() =>
              dispatch({ type: 'ADD_KEYFRAME', layerId: layer.id, time: currentTime })
            }
          >
            {hasKeyframeAtPlayhead ? 'Update Keyframe' : 'Add Keyframe'}
          </button>
        </div>

        <div className="inspector-meta">
          <span>Time: {formatTime(currentTime)}</span>
          <span>Duration: {formatDuration(scene.duration)}</span>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inspector-field">
      <label className="inspector-label">{label}</label>
      <input
        type="number"
        className="inspector-input"
        step={step}
        value={Math.round(value * 1000) / 1000}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
      />
    </div>
  );
}
