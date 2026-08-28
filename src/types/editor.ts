export type PlaybackState = 'stopped' | 'playing' | 'paused';

export type Selection =
  | { type: 'none' }
  | { type: 'layer'; layerId: string }
  | { type: 'keyframe'; layerId: string; keyframeTime: number };

export type EditorState = {
  activeSceneId: string;
  currentTime: number;
  playbackState: PlaybackState;
  selection: Selection;
  exportProgress: number | null;
  exportMessage: string | null;
};
