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

export type ExportJobStatus = {
  jobId: string;
  phase: ExportPhase;
  progress: number;
  message: string;
  error?: string;
  filename?: string;
};

export type ExportStartRequest = {
  project: MasterProject;
  outputFormat: OutputFormat;
  filename: string;
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
