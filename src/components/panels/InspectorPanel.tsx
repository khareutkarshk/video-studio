import type { EasingType } from '../../types/project';
import type { Selection } from '../../types/editor';
import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState, getSelectedLayer } from '../../store/projectReducer';
import { getTransformAtTime, findKeyframeAtTime, getCameraAtTime } from '../../core/interpolation';
import { formatTime, formatDuration } from '../../core/playback';

const EASINGS: EasingType[] = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

export function InspectorPanel() {
  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const layer = getSelectedLayer(state);
  const { currentTime, selection } = state.editor;

  const camera = getCameraAtTime(scene.camera, currentTime);

  return (
    <div className="panel inspector-panel">
      <div className="panel-header">Inspector</div>
      <div className="panel-body inspector-body">
        <div className="inspector-section-title">Camera</div>
        <NumberField label="Cam X" value={camera.x} onChange={(v) =>
          dispatch({ type: 'UPDATE_CAMERA', keyframe: { ...camera, time: currentTime, x: v } })
        } />
        <NumberField label="Cam Y" value={camera.y} onChange={(v) =>
          dispatch({ type: 'UPDATE_CAMERA', keyframe: { ...camera, time: currentTime, y: v } })
        } />
        <NumberField label="Zoom" value={camera.zoom} step={0.01} onChange={(v) =>
          dispatch({ type: 'UPDATE_CAMERA', keyframe: { ...camera, time: currentTime, zoom: v } })
        } />

        {!layer ? (
          <div className="inspector-empty">Select a layer to edit transform</div>
        ) : (
          <LayerInspector
            layer={layer}
            scene={scene}
            currentTime={currentTime}
            selection={selection}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  );
}

function LayerInspector({
  layer,
  scene,
  currentTime,
  selection,
  dispatch,
}: {
  layer: NonNullable<ReturnType<typeof getSelectedLayer>>;
  scene: ReturnType<typeof getActiveSceneFromState>;
  currentTime: number;
  selection: Selection;
  dispatch: ReturnType<typeof useProjectStore>['dispatch'];
}) {
  const isKeyframeSelected = selection.type === 'keyframe';
  const selectedKfTime = selection.type === 'keyframe' ? selection.keyframeTime : null;

  const transform = isKeyframeSelected && selectedKfTime !== null
    ? layer.keyframes.find((k) => Math.abs(k.time - selectedKfTime) < 0.05) ??
      getTransformAtTime(layer, currentTime)
    : getTransformAtTime(layer, currentTime);

  const currentEasing = isKeyframeSelected && selectedKfTime !== null
    ? layer.keyframes.find((k) => Math.abs(k.time - selectedKfTime) < 0.05)?.easing ?? 'linear'
    : findKeyframeAtTime(layer, currentTime)?.easing ?? 'linear';

  const hasKeyframeAtPlayhead = !!findKeyframeAtTime(layer, currentTime);

  const update = (field: keyof typeof transform, value: number) => {
    if (isKeyframeSelected && selectedKfTime !== null) {
      dispatch({ type: 'UPDATE_KEYFRAME', layerId: layer.id, keyframeTime: selectedKfTime, updates: { [field]: value } });
    } else {
      dispatch({ type: 'UPDATE_LAYER_TRANSFORM', layerId: layer.id, transform: { [field]: value } });
    }
  };

  return (
    <>
      <div className="inspector-section-title">Layer: {layer.name}</div>
      {layer.locked && <div className="inspector-warning">Layer is locked</div>}

      {isKeyframeSelected && selectedKfTime !== null && (
        <div className="inspector-field">
          <label className="inspector-label">KF Time</label>
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
              dispatch({ type: 'UPDATE_KEYFRAME', layerId: layer.id, keyframeTime: selectedKfTime, updates: { time: newTime } });
              dispatch({ type: 'SELECT_KEYFRAME', layerId: layer.id, keyframeTime: newTime });
            }}
          />
        </div>
      )}

      <NumberField label="X" value={transform.x} onChange={(v) => update('x', v)} disabled={layer.locked} />
      <NumberField label="Y" value={transform.y} onChange={(v) => update('y', v)} disabled={layer.locked} />
      <NumberField label="Scale" value={transform.scale} step={0.01} onChange={(v) => update('scale', v)} disabled={layer.locked} />
      <NumberField label="Rotation" value={transform.rotation} step={1} onChange={(v) => update('rotation', v)} disabled={layer.locked} />

      <div className="inspector-field">
        <label className="inspector-label">Opacity</label>
        <input type="range" min="0" max="1" step="0.01" value={transform.opacity} disabled={layer.locked}
          onChange={(e) => update('opacity', parseFloat(e.target.value))} />
        <span className="inspector-range-value">{transform.opacity.toFixed(2)}</span>
      </div>

      <div className="inspector-field">
        <label className="inspector-label">Easing</label>
        <select
          className="inspector-input"
          value={currentEasing}
          disabled={layer.locked}
          onChange={(e) => {
            const easing = e.target.value as EasingType;
            const kfTime = selectedKfTime ?? currentTime;
            dispatch({ type: 'UPDATE_KEYFRAME', layerId: layer.id, keyframeTime: kfTime, updates: { easing } });
          }}
        >
          {EASINGS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="inspector-actions">
        <button className="btn btn-secondary" disabled={layer.locked}
          onClick={() => dispatch({ type: 'ADD_KEYFRAME', layerId: layer.id, time: currentTime })}>
          {hasKeyframeAtPlayhead ? 'Update Keyframe' : 'Add Keyframe'}
        </button>
      </div>

      <div className="inspector-meta">
        <span>Time: {formatTime(currentTime)}</span>
        <span>Duration: {formatDuration(scene.duration)}</span>
      </div>
    </>
  );
}

function NumberField({
  label, value, step = 1, onChange, disabled = false,
}: {
  label: string; value: number; step?: number; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className="inspector-field">
      <label className="inspector-label">{label}</label>
      <input type="number" className="inspector-input" step={step} disabled={disabled}
        value={Math.round(value * 1000) / 1000}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }} />
    </div>
  );
}
