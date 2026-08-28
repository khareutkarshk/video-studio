export type TransformProps = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

export type Keyframe = TransformProps & {
  time: number;
};

export type Layer = {
  id: string;
  assetId: string;
  startTime: number;
  endTime: number;
  zIndex: number;
  keyframes: Keyframe[];
};

export type Scene = {
  id: string;
  duration: number;
  backgroundAssetId: string | null;
  layers: Layer[];
};

export type MasterProject = {
  name: string;
  fps: number;
  scenes: Scene[];
};

export type OutputFormat = {
  id: string;
  label: string;
  width: number;
  height: number;
  fps: number;
  aspectRatio: '16:9' | '9:16';
};
