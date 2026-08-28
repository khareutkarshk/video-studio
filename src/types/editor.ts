export type PlaybackState = 'stopped' | 'playing' | 'paused';

export type Selection =
  | { type: 'none' }
  | { type: 'layer'; layerId: string }
  | { type: 'keyframe'; layerId: string; keyframeTime: number }
  | { type: 'poseSegment'; layerId: string; segmentIndex: number }
  | { type: 'audioTrack'; trackId: string };

export type EditorState = {
  activeSceneId: string;
  currentTime: number;
  playbackState: PlaybackState;
  selection: Selection;
  exportProgress: number | null;
  exportMessage: string | null;
  showSafeAreaGuides: boolean;
};
