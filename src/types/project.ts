export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export type TransformProps = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

export type Keyframe = TransformProps & {
  time: number;
  easing?: EasingType;
};

export type PoseSegment = {
  assetId: string;
  startTime: number;
  endTime: number;
};

export type Layer = {
  id: string;
  name: string;
  assetId: string;
  startTime: number;
  endTime: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  keyframes: Keyframe[];
  /** Pose segments switch PNG asset without resetting transform keyframes. */
  poseSegments?: PoseSegment[];
};

export type CameraKeyframe = {
  time: number;
  x: number;
  y: number;
  zoom: number;
  easing?: EasingType;
};

export type Camera = {
  keyframes: CameraKeyframe[];
};

export type SceneTransition = {
  type: 'none' | 'fade' | 'crossfade';
  duration: number;
};

export type AudioTrackType = 'music' | 'ambience' | 'sfx' | 'dialogue';

export type AudioTrack = {
  id: string;
  name: string;
  type: AudioTrackType;
  /** Optional so text-only dialogue planning cues are valid. */
  assetId?: string;
  startTime: number;
  /** Clip length in seconds; defaults to asset duration at playback when omitted. */
  duration?: number;
  volume: number;
  muted?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  speaker?: string;
  text?: string;
  layerId?: string;
};

export type ReactionCueKind = 'listen' | 'react';

export type ReactionCue = {
  id: string;
  speaker: string;
  startTime: number;
  endTime?: number;
  afterTrackId?: string;
  kind: ReactionCueKind;
};

export type Scene = {
  id: string;
  name: string;
  duration: number;
  backgroundAssetId: string | null;
  transition: SceneTransition;
  camera: Camera;
  audioTracks: AudioTrack[];
  reactionCues?: ReactionCue[];
  layers: Layer[];
};

export type MasterProject = {
  name: string;
  fps: number;
  scenes: Scene[];
  version: number;
};

export type OutputFormat = {
  id: string;
  label: string;
  width: number;
  height: number;
  fps: number;
  aspectRatio: '16:9' | '9:16';
  custom?: boolean;
};
