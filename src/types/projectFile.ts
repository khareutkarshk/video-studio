import type { Scene } from './project';

export type ProjectSettings = {
  name: string;
  fps: number;
  version: number;
};

/** Canonical on-disk project envelope (fileVersion 3) */
export type ProjectFile = {
  fileVersion: number;
  settings: ProjectSettings;
  outputFormatId?: string;
  scenes: Scene[];
};

/** Legacy envelope still accepted on load */
export type LegacyProjectFile = {
  version?: number;
  project?: {
    name: string;
    fps: number;
    version: number;
    scenes: Scene[];
  };
  outputFormatId?: string;
};

export const PROJECT_FILE_VERSION = 3;
export const PROJECT_DATA_VERSION = 2;
