import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState } from '../../store/projectReducer';
import { formatTime, formatDuration } from '../../core/playback';

export function TimelinePanel() {
  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const { currentTime, playbackState, selection } = state.editor;

  const duration = scene.duration;
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    dispatch({ type: 'SET_CURRENT_TIME', time: Math.max(0, Math.min(time, duration)) });
  };

  const handlePlay = () => {
    if (playbackState === 'playing') return;
    if (currentTime >= duration) {
      dispatch({ type: 'SET_CURRENT_TIME', time: 0 });
    }
    dispatch({ type: 'SET_PLAYBACK_STATE', state: 'playing' });
  };

  const handlePause = () => {
    dispatch({ type: 'SET_PLAYBACK_STATE', state: 'paused' });
  };

  const handleStop = () => {
    dispatch({ type: 'SET_PLAYBACK_STATE', state: 'stopped' });
    dispatch({ type: 'SET_CURRENT_TIME', time: 0 });
  };

  return (
    <div className="panel timeline-panel">
      <div className="timeline-toolbar">
        <TransportControls
          playbackState={playbackState}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
        />
        <span className="timeline-time">
          {formatTime(currentTime)} / {formatDuration(duration)}
        </span>
      </div>

      <div className="timeline-content">
        <div className="timeline-tracks">
          {scene.layers.map((layer) => (
            <div key={layer.id} className="timeline-track">
              <div className="timeline-track-label">{layer.id}</div>
              <div className="timeline-track-area" onClick={handleRulerClick}>
                <div
                  className="timeline-layer-bar"
                  style={{
                    left: `${(layer.startTime / duration) * 100}%`,
                    width: `${((layer.endTime - layer.startTime) / duration) * 100}%`,
                  }}
                />
                {layer.keyframes.map((kf) => {
                  const isSelected =
                    selection.type === 'keyframe' &&
                    selection.layerId === layer.id &&
                    Math.abs(selection.keyframeTime - kf.time) < 0.05;
                  return (
                    <button
                      key={`${layer.id}-${kf.time}`}
                      className={`timeline-keyframe ${isSelected ? 'selected' : ''}`}
                      style={{ left: `${(kf.time / duration) * 100}%` }}
                      title={`Keyframe at ${formatTime(kf.time)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({
                          type: 'SELECT_KEYFRAME',
                          layerId: layer.id,
                          keyframeTime: kf.time,
                        });
                      }}
                    />
                  );
                })}
                <div
                  className="timeline-playhead"
                  style={{ left: `${playheadPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransportControls({
  playbackState,
  onPlay,
  onPause,
  onStop,
}: {
  playbackState: string;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}) {
  return (
    <div className="transport-controls">
      <button
        className="btn btn-transport"
        onClick={onPlay}
        disabled={playbackState === 'playing'}
        title="Play"
      >
        ▶
      </button>
      <button
        className="btn btn-transport"
        onClick={onPause}
        disabled={playbackState !== 'playing'}
        title="Pause"
      >
        ⏸
      </button>
      <button className="btn btn-transport" onClick={onStop} title="Stop">
        ⏹
      </button>
    </div>
  );
}
