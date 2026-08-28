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

export type AudioTrack = {
  id: string;
  assetId: string;
  name: string;
  startTime: number;
  volume: number;
};

export type Scene = {
  id: string;
  name: string;
  duration: number;
  backgroundAssetId: string | null;
  transition: SceneTransition;
  camera: Camera;
  audioTracks: AudioTrack[];
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
