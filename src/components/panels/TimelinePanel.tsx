import type { AudioTrackType } from '../../types/project';
import { useProjectStore } from '../../store/ProjectContext';
import { getActiveSceneFromState } from '../../store/projectReducer';
import { formatTime, formatDuration } from '../../core/playback';
import { getAssetByIdWithRuntime } from '../../assets/registry';
import { getTrackDuration } from '../../core/audioUtils';

const AUDIO_TRACK_TYPES: AudioTrackType[] = ['music', 'ambience', 'sfx', 'dialogue'];

const AUDIO_TYPE_LABELS: Record<AudioTrackType, string> = {
  music: 'MUSIC',
  ambience: 'AMBIENCE',
  sfx: 'SFX',
  dialogue: 'DIALOGUE',
};

const AUDIO_TYPE_CLASS: Record<AudioTrackType, string> = {
  music: 'timeline-audio-music',
  ambience: 'timeline-audio-ambience',
  sfx: 'timeline-audio-sfx',
  dialogue: 'timeline-audio-dialogue',
};

function poseLabel(assetId: string): string {
  const asset = getAssetByIdWithRuntime(assetId);
  if (!asset) return assetId.slice(-12);
  const action = asset.action !== 'unknown' ? asset.action.toUpperCase() : '';
  const dir =
    asset.direction !== 'unknown' ? asset.direction.toUpperCase() : '';
  return [action, dir].filter(Boolean).join(' ') || asset.filename.replace(/\.[^.]+$/, '');
}

export function TimelinePanel() {
  const { state, dispatch } = useProjectStore();
  const scene = getActiveSceneFromState(state);
  const { currentTime, playbackState, selection, activeSceneId } = state.editor;
  const sceneIndex = state.project.scenes.findIndex((s) => s.id === activeSceneId);
  const totalScenes = state.project.scenes.length;

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
          Scene {sceneIndex + 1}/{totalScenes} · {formatTime(currentTime)} / {formatDuration(duration)}
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
                {(layer.poseSegments ?? []).map((seg, index) => {
                  const isSelected =
                    selection.type === 'poseSegment' &&
                    selection.layerId === layer.id &&
                    selection.segmentIndex === index;
                  const left = (seg.startTime / duration) * 100;
                  const width = ((seg.endTime - seg.startTime) / duration) * 100;
                  return (
                    <button
                      key={`${layer.id}-pose-${index}`}
                      className={`timeline-pose-segment ${isSelected ? 'selected' : ''}`}
                      style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                      title={`${poseLabel(seg.assetId)} (${formatTime(seg.startTime)}–${formatTime(seg.endTime)})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({
                          type: 'SELECT_POSE_SEGMENT',
                          layerId: layer.id,
                          segmentIndex: index,
                        });
                      }}
                    >
                      <span className="timeline-pose-label">{poseLabel(seg.assetId)}</span>
                    </button>
                  );
                })}
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
          {AUDIO_TRACK_TYPES.map((trackType) => (
            <div key={`audio-${trackType}`} className="timeline-track timeline-audio-track">
              <div className="timeline-track-label timeline-audio-label">
                {AUDIO_TYPE_LABELS[trackType]}
              </div>
              <div className="timeline-track-area" onClick={handleRulerClick}>
                {scene.audioTracks
                  .filter((track) => track.type === trackType)
                  .map((track) => {
                    const asset = getAssetByIdWithRuntime(track.assetId);
                    const clipDuration = getTrackDuration(track, asset?.durationSeconds);
                    const left = (track.startTime / duration) * 100;
                    const width = (clipDuration / duration) * 100;
                    const isSelected =
                      selection.type === 'audioTrack' && selection.trackId === track.id;
                    return (
                      <button
                        key={track.id}
                        className={`timeline-audio-clip ${AUDIO_TYPE_CLASS[trackType]} ${isSelected ? 'selected' : ''}`}
                        style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
                        title={`${track.name} (${formatTime(track.startTime)}–${formatTime(track.startTime + clipDuration)})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'SELECT_AUDIO_TRACK', trackId: track.id });
                        }}
                      >
                        <span className="timeline-audio-clip-label">{track.name}</span>
                      </button>
                    );
                  })}
                <div className="timeline-playhead" style={{ left: `${playheadPercent}%` }} />
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
