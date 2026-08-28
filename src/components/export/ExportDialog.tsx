import { useCallback, useEffect, useState } from 'react';
import type { OutputFormat } from '../../types/project';
import type { ValidationIssue } from '../../core/validateProject';
import { OUTPUT_PRESETS } from '../../constants/outputPresets';
import {
  DEFAULT_EXPORT_QUALITY_ID,
  EXPORT_QUALITY_PRESETS,
} from '../../constants/exportQuality';
import { defaultExportFilename } from '../../export/exportNaming';
import type { ExportJobStatus, OutputVerification } from '../../export/exportTypes';
import {
  checkFfmpegStatus,
  startExport,
  triggerExportDownload,
  validateExportProject,
  waitForExport,
} from '../../export/exportClient';
import { useProjectStore } from '../../store/ProjectContext';

type ExportDialogProps = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_EXPORTS_DIR = 'exports';

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { state, dispatch } = useProjectStore();
  const { project, outputFormat: editorFormat } = state;

  const [format, setFormat] = useState<OutputFormat>(editorFormat);
  const [filename, setFilename] = useState('');
  const [exportsDir, setExportsDir] = useState(DEFAULT_EXPORTS_DIR);
  const [qualityId, setQualityId] = useState(DEFAULT_EXPORT_QUALITY_ID);
  const [errors, setErrors] = useState<ValidationIssue[]>([]);
  const [warnings, setWarnings] = useState<ValidationIssue[]>([]);
  const [ffmpegError, setFfmpegError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<ExportJobStatus | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number | null>(null);

  const refreshValidation = useCallback(async () => {
    try {
      const [ffmpeg, validation] = await Promise.all([
        checkFfmpegStatus(),
        validateExportProject(project, format.id, { exportsDir, qualityPresetId: qualityId }),
      ]);
      setFfmpegError(ffmpeg.available ? null : (ffmpeg.error ?? 'FFmpeg not available'));
      setErrors(validation.errors);
      setWarnings(validation.warnings);
    } catch (err) {
      setFfmpegError(err instanceof Error ? err.message : 'Could not reach export server');
      setErrors([]);
      setWarnings([]);
    }
  }, [project, format.id, exportsDir, qualityId]);

  useEffect(() => {
    if (!open) return;
    setFormat(editorFormat);
    setFilename(defaultExportFilename(project.name, editorFormat.id));
    setExportsDir(DEFAULT_EXPORTS_DIR);
    setQualityId(DEFAULT_EXPORT_QUALITY_ID);
    setExportError(null);
    setSuccessStatus(null);
    setProgressMessage(null);
    setProgressValue(null);
    void refreshValidation();
  }, [open, editorFormat, project.name, refreshValidation]);

  useEffect(() => {
    if (!open) return;
    void refreshValidation();
  }, [format.id, exportsDir, qualityId, open, refreshValidation]);

  useEffect(() => {
    if (!open) return;
    setFilename(defaultExportFilename(project.name, format.id));
  }, [format.id, project.name, open]);

  const handleExport = async () => {
    if (exporting || errors.length > 0 || ffmpegError) return;

    const controller = new AbortController();
    setAbortController(controller);
    setExporting(true);
    setExportError(null);
    setSuccessStatus(null);
    dispatch({ type: 'SET_EXPORT_STATUS', progress: 0, message: 'Starting export...' });

    try {
      const { jobId } = await startExport({
        project,
        outputFormat: format,
        filename,
        exportsDir,
        qualityPresetId: qualityId,
      });

      const finalStatus = await waitForExport(
        jobId,
        (status) => {
          setProgressMessage(status.message);
          setProgressValue(status.progress);
          dispatch({
            type: 'SET_EXPORT_STATUS',
            progress: status.progress,
            message: status.message,
          });
        },
        controller.signal,
      );

      setSuccessStatus(finalStatus);
      triggerExportDownload(jobId, finalStatus.filename ?? filename);
    } catch (err) {
      if (err instanceof Error && err.message !== 'Export cancelled') {
        setExportError(err.message);
      }
    } finally {
      setExporting(false);
      setAbortController(null);
      dispatch({ type: 'SET_EXPORT_STATUS', progress: null, message: null });
    }
  };

  const handleCancel = () => {
    if (exporting) {
      abortController?.abort();
      return;
    }
    onClose();
  };

  const handleDone = () => {
    setSuccessStatus(null);
    onClose();
  };

  if (!open) return null;

  const canExport = !exporting && !successStatus && errors.length === 0 && !ffmpegError;

  return (
    <div className="export-dialog-backdrop" onClick={exporting ? undefined : onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="export-dialog-title">Export MP4</h2>

        {!successStatus && (
          <>
            <label className="export-field">
              Output preset
              <select
                value={format.id}
                onChange={(e) => {
                  const preset = OUTPUT_PRESETS.find((p) => p.id === e.target.value);
                  if (preset) setFormat(preset);
                }}
                disabled={exporting}
              >
                {OUTPUT_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.width}×{preset.height})
                  </option>
                ))}
              </select>
            </label>

            <label className="export-field">
              Filename
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={exporting}
              />
            </label>

            <label className="export-field">
              Output folder
              <input
                type="text"
                value={exportsDir}
                onChange={(e) => setExportsDir(e.target.value)}
                disabled={exporting}
                placeholder="exports"
              />
            </label>

            <label className="export-field">
              Quality
              <select
                value={qualityId}
                onChange={(e) => setQualityId(e.target.value)}
                disabled={exporting}
              >
                {EXPORT_QUALITY_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {exporting && (
          <div className="export-panel export-panel-progress">
            <strong>{progressMessage ?? 'Exporting...'}</strong>
            {progressValue !== null ? (
              <div className="export-progress-bar">
                <div className="export-progress-fill" style={{ width: `${progressValue}%` }} />
              </div>
            ) : (
              <div className="export-progress-indeterminate" />
            )}
          </div>
        )}

        {successStatus?.verification && (
          <div className="export-panel export-panel-success">
            <strong>Export complete</strong>
            <VerificationSummary verification={successStatus.verification} />
            {successStatus.outputPath && (
              <p className="export-hint">Saved to {successStatus.outputPath}</p>
            )}
          </div>
        )}

        {ffmpegError && (
          <div className="export-panel export-panel-error">
            <strong>FFmpeg</strong>
            <p>{ffmpegError}</p>
          </div>
        )}

        {exportError && (
          <div className="export-panel export-panel-error">
            <strong>Export failed</strong>
            <p>{exportError}</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="export-panel export-panel-error">
            <strong>Validation errors</strong>
            <ul>
              {errors.map((issue, i) => (
                <li key={`${issue.path}-${i}`}>{issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && !successStatus && (
          <div className="export-panel export-panel-warning">
            <strong>Warnings</strong>
            <ul>
              {warnings.map((issue, i) => (
                <li key={`${issue.path}-${i}`}>{issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="export-dialog-actions">
          <button className="btn btn-ghost" onClick={handleCancel}>
            {exporting ? 'Cancel export' : successStatus ? 'Close' : 'Cancel'}
          </button>
          {successStatus ? (
            <button className="btn btn-primary" onClick={handleDone}>Done</button>
          ) : (
            <button className="btn btn-primary" onClick={handleExport} disabled={!canExport}>
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationSummary({ verification }: { verification: OutputVerification }) {
  const sizeMb = (verification.fileSize / 1024 / 1024).toFixed(2);
  return (
    <ul className="export-verify-list">
      <li>{verification.width}×{verification.height} @ {verification.fps.toFixed(1)} fps</li>
      <li>Duration: {verification.duration.toFixed(2)}s</li>
      <li>Size: {sizeMb} MB</li>
      <li>Video: {verification.hasVideo ? 'yes' : 'no'}</li>
      <li>Audio: {verification.hasAudio ? 'yes' : 'no'}</li>
      {verification.message && <li>{verification.message}</li>}
    </ul>
  );
}
