import { useCallback, useEffect, useState } from 'react';
import type { OutputFormat } from '../../types/project';
import type { ValidationIssue } from '../../core/validateProject';
import { OUTPUT_PRESETS } from '../../constants/outputPresets';
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

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { state, dispatch } = useProjectStore();
  const { project, outputFormat: editorFormat } = state;

  const [format, setFormat] = useState<OutputFormat>(editorFormat);
  const [filename, setFilename] = useState('');
  const [errors, setErrors] = useState<ValidationIssue[]>([]);
  const [warnings, setWarnings] = useState<ValidationIssue[]>([]);
  const [ffmpegError, setFfmpegError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const defaultFilename = `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}_${format.width}x${format.height}.mp4`;

  const refreshValidation = useCallback(async () => {
    try {
      const [ffmpeg, validation] = await Promise.all([
        checkFfmpegStatus(),
        validateExportProject(project, format.id),
      ]);
      setFfmpegError(ffmpeg.available ? null : (ffmpeg.error ?? 'FFmpeg not available'));
      setErrors(validation.errors);
      setWarnings(validation.warnings);
    } catch (err) {
      setFfmpegError(err instanceof Error ? err.message : 'Could not reach export server');
      setErrors([]);
      setWarnings([]);
    }
  }, [project, format.id]);

  useEffect(() => {
    if (!open) return;
    setFormat(editorFormat);
    setFilename(
      `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}_${editorFormat.width}x${editorFormat.height}.mp4`,
    );
    void refreshValidation();
  }, [open, editorFormat, project.name, refreshValidation]);

  useEffect(() => {
    if (!open) return;
    void refreshValidation();
  }, [format.id, open, refreshValidation]);

  const handleExport = async () => {
    if (exporting || errors.length > 0 || ffmpegError) return;

    const controller = new AbortController();
    setAbortController(controller);
    setExporting(true);
    dispatch({ type: 'SET_EXPORT_STATUS', progress: 0, message: 'Starting export...' });

    try {
      const { jobId } = await startExport({
        project,
        outputFormat: format,
        filename: filename || defaultFilename,
      });

      const finalStatus = await waitForExport(
        jobId,
        (status) => {
          dispatch({
            type: 'SET_EXPORT_STATUS',
            progress: status.progress,
            message: status.message,
          });
        },
        controller.signal,
      );

      triggerExportDownload(jobId, finalStatus.filename ?? (filename || defaultFilename));
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message !== 'Export cancelled') {
        alert(`Export failed: ${err.message}`);
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

  if (!open) return null;

  const canExport = !exporting && errors.length === 0 && !ffmpegError;

  return (
    <div className="export-dialog-backdrop" onClick={exporting ? undefined : onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="export-dialog-title">Export MP4</h2>

        <label className="export-field">
          Output format
          <select
            value={format.id}
            onChange={(e) => {
              const preset = OUTPUT_PRESETS.find((p) => p.id === e.target.value);
              if (preset) {
                setFormat(preset);
                setFilename(
                  `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}_${preset.width}x${preset.height}.mp4`,
                );
              }
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

        <p className="export-hint">Quality: H.264 medium preset, CRF 20, AAC 192k</p>

        {ffmpegError && (
          <div className="export-panel export-panel-error">
            <strong>FFmpeg</strong>
            <p>{ffmpegError}</p>
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

        {warnings.length > 0 && (
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
            {exporting ? 'Cancel export' : 'Close'}
          </button>
          <button className="btn btn-primary" onClick={handleExport} disabled={!canExport}>
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
