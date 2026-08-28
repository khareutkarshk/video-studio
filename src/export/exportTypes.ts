import type { MasterProject, OutputFormat } from '../types/project';
import type { ValidationIssue } from '../core/validateProject';

export type ExportPhase =
  | 'preparing'
  | 'rendering'
  | 'mixing'
  | 'encoding'
  | 'finalizing'
  | 'complete'
  | 'error'
  | 'cancelled';

export type OutputVerification = {
  ok: boolean;
  fileSize: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasVideo: boolean;
  hasAudio: boolean;
  message?: string;
};

export type ExportJobStatus = {
  jobId: string;
  phase: ExportPhase;
  progress: number | null;
  message: string;
  error?: string;
  filename?: string;
  outputPath?: string;
  verification?: OutputVerification;
};

export type ExportStartRequest = {
  project: MasterProject;
  outputFormat: OutputFormat;
  filename: string;
  exportsDir?: string;
  qualityPresetId?: string;
};

export type ExportStartResponse = {
  jobId: string;
};

export type FfmpegStatusResponse = {
  available: boolean;
  version?: string;
  error?: string;
};

export type ExportValidationResponse = {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  canExport: boolean;
};
