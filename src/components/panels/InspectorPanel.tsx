import type { AudioTrack, AudioTrackType, EasingType } from '../../types/project';
import type { Selection } from '../../types/editor';
import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState, getSelectedLayer, getSelectedAudioTrack } from '../../store/projectReducer';
import { getTransformAtTime, findKeyframeAtTime, getCameraAtTime } from '../../core/interpolation';
import { getActivePose } from '../../core/pose';
import { getAssetByIdWithRuntime } from '../../assets/registry';
import { formatTime, formatDuration } from '../../core/playback';

const EASINGS: EasingType[] = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

function poseLabel(assetId: string): string {
  const asset = getAssetByIdWithRuntime(assetId);
  if (!asset) return assetId;
  const action = asset.action !== 'unknown' ? asset.action : 'unknown';
  const dir = asset.direction !== 'unknown' ? ` ${asset.direction}` : '';
  return `${action}${dir} (${asset.filename})`;
}

export function InspectorPanel() {
  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const layer = getSelectedLayer(state);
  const audioTrack = getSelectedAudioTrack(state);
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

        {selection.type === 'audioTrack' && audioTrack ? (
          <AudioTrackInspector track={audioTrack} scene={scene} dispatch={dispatch} />
        ) : !layer ? (
          <div className="inspector-empty">Select a layer or audio clip to inspect</div>
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

const AUDIO_TYPES: AudioTrackType[] = ['music', 'ambience', 'sfx', 'dialogue'];

function AudioTrackInspector({
  track,
  scene,
  dispatch,
}: {
  track: AudioTrack;
  scene: ReturnType<typeof getActiveSceneFromState>;
  dispatch: ReturnType<typeof useProjectStore>['dispatch'];
}) {
  const asset = track.assetId ? getAssetByIdWithRuntime(track.assetId) : undefined;

  const update = (updates: Partial<AudioTrack>) => {
    dispatch({ type: 'UPDATE_AUDIO_TRACK', trackId: track.id, updates });
  };

  return (
    <>
      <div className="inspector-section-title">Audio: {track.name}</div>

      {track.type === 'dialogue' && (
        <>
          <div className="inspector-field">
            <label className="inspector-label">Speaker</label>
            <input
              type="text"
              className="inspector-input"
              value={track.speaker ?? ''}
              onChange={(e) => update({ speaker: e.target.value || undefined })}
            />
          </div>
          <div className="inspector-field">
            <label className="inspector-label">Transcript</label>
            <textarea
              className="inspector-input"
              rows={3}
              value={track.text ?? ''}
              onChange={(e) => update({ text: e.target.value || undefined })}
            />
          </div>
        </>
      )}

      <div className="inspector-meta">
        <span>Asset: {asset?.filename ?? track.assetId ?? '(text-only, no file)'}</span>
        {asset?.durationSeconds !== undefined && (
          <span>Audio duration: {asset.durationSeconds.toFixed(2)}s</span>
        )}
      </div>

      <div className="inspector-field">
        <label className="inspector-label">Type</label>
        <select
          className="inspector-input"
          value={track.type}
          onChange={(e) => update({ type: e.target.value as AudioTrackType })}
        >
          {AUDIO_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <NumberField
        label="Start Time"
        value={track.startTime}
        step={0.1}
        onChange={(v) => update({ startTime: v })}
      />
      <NumberField
        label="Duration"
        value={track.duration ?? asset?.durationSeconds ?? 0}
        step={0.1}
        onChange={(v) => update({ duration: v > 0 ? v : undefined })}
      />

      <div className="inspector-field">
        <label className="inspector-label">Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={track.volume}
          onChange={(e) => update({ volume: parseFloat(e.target.value) })}
        />
        <span className="inspector-range-value">{track.volume.toFixed(2)}</span>
      </div>

      <div className="inspector-field">
        <label className="inspector-label">
          <input
            type="checkbox"
            checked={track.muted ?? false}
            onChange={(e) => update({ muted: e.target.checked })}
          />
          {' '}Muted
        </label>
      </div>

      <NumberField
        label="Fade In"
        value={track.fadeIn ?? 0}
        step={0.1}
        onChange={(v) => update({ fadeIn: v > 0 ? v : undefined })}
      />
      <NumberField
        label="Fade Out"
        value={track.fadeOut ?? 0}
        step={0.1}
        onChange={(v) => update({ fadeOut: v > 0 ? v : undefined })}
      />

      {(asset?.source || asset?.license || asset?.sourceUrl) && (
        <>
          <div className="inspector-section-title">Provenance</div>
          <div className="inspector-meta inspector-provenance">
            {asset.source && <span>Source: {asset.source}</span>}
            {asset.license && <span>License: {asset.license}</span>}
            {asset.attributionRequired !== undefined && (
              <span>Attribution: {asset.attributionRequired ? 'required' : 'not required'}</span>
            )}
            {asset.sourceUrl && (
              <span>
                URL:{' '}
                <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
                  {asset.sourceUrl}
                </a>
              </span>
            )}
          </div>
        </>
      )}

      <div className="inspector-meta">
        <span>Scene duration: {formatDuration(scene.duration)}</span>
      </div>
    </>
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
  const isPoseSelected = selection.type === 'poseSegment';
  const selectedPoseIndex = selection.type === 'poseSegment' ? selection.segmentIndex : null;

  const transform = isKeyframeSelected && selectedKfTime !== null
    ? layer.keyframes.find((k) => Math.abs(k.time - selectedKfTime) < 0.05) ??
      getTransformAtTime(layer, currentTime)
    : getTransformAtTime(layer, currentTime);

  const currentEasing = isKeyframeSelected && selectedKfTime !== null
    ? layer.keyframes.find((k) => Math.abs(k.time - selectedKfTime) < 0.05)?.easing ?? 'linear'
    : findKeyframeAtTime(layer, currentTime)?.easing ?? 'linear';

  const hasKeyframeAtPlayhead = !!findKeyframeAtTime(layer, currentTime);
  const activePoseId = getActivePose(layer, currentTime);
  const poseSegments = layer.poseSegments ?? [];

  const update = (field: keyof typeof transform, value: number) => {
    if (isKeyframeSelected && selectedKfTime !== null) {
      dispatch({ type: 'UPDATE_KEYFRAME', layerId: layer.id, keyframeTime: selectedKfTime, updates: { [field]: value } });
    } else {
      dispatch({ type: 'UPDATE_LAYER_TRANSFORM', layerId: layer.id, transform: { [field]: value } });
    }
  };

  const selectedSegment =
    isPoseSelected && selectedPoseIndex !== null
      ? poseSegments[selectedPoseIndex]
      : undefined;

  return (
    <>
      <div className="inspector-section-title">Layer: {layer.name}</div>
      {layer.locked && <div className="inspector-warning">Layer is locked</div>}

      <div className="inspector-meta">
        <span>Active pose: {poseLabel(activePoseId)}</span>
      </div>

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

      <div className="inspector-section-title">Pose Segments</div>
      {poseSegments.length === 0 ? (
        <div className="inspector-empty">No pose segments — uses layer assetId</div>
      ) : (
        <ul className="inspector-pose-list">
          {poseSegments.map((seg, index) => (
            <li
              key={`${seg.assetId}-${seg.startTime}`}
              className={`inspector-pose-item ${selectedPoseIndex === index ? 'selected' : ''}`}
              onClick={() =>
                dispatch({ type: 'SELECT_POSE_SEGMENT', layerId: layer.id, segmentIndex: index })
              }
            >
              <span className="inspector-pose-name">{poseLabel(seg.assetId)}</span>
              <span className="inspector-pose-time">
                {formatTime(seg.startTime)} – {formatTime(seg.endTime)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {selectedSegment && isPoseSelected && selectedPoseIndex !== null && (
        <div className="inspector-pose-editor">
          <div className="inspector-field">
            <label className="inspector-label">Start</label>
            <input
              type="number"
              className="inspector-input"
              step="0.1"
              min={layer.startTime}
              max={scene.duration}
              value={selectedSegment.startTime}
              disabled={layer.locked}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (isNaN(v)) return;
                dispatch({
                  type: 'UPDATE_POSE_SEGMENT',
                  layerId: layer.id,
                  segmentIndex: selectedPoseIndex,
                  updates: { startTime: v },
                });
              }}
            />
          </div>
          <div className="inspector-field">
            <label className="inspector-label">End</label>
            <input
              type="number"
              className="inspector-input"
              step="0.1"
              min={layer.startTime}
              max={scene.duration}
              value={selectedSegment.endTime}
              disabled={layer.locked}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (isNaN(v)) return;
                dispatch({
                  type: 'UPDATE_POSE_SEGMENT',
                  layerId: layer.id,
                  segmentIndex: selectedPoseIndex,
                  updates: { endTime: v },
                });
              }}
            />
          </div>
          <button
            className="btn btn-secondary btn-danger"
            disabled={layer.locked}
            onClick={() =>
              dispatch({
                type: 'DELETE_POSE_SEGMENT',
                layerId: layer.id,
                segmentIndex: selectedPoseIndex,
              })
            }
          >
            Delete Segment
          </button>
        </div>
      )}

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
