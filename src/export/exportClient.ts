import type {
  ExportJobStatus,
  ExportStartRequest,
  ExportStartResponse,
  ExportValidationResponse,
  FfmpegStatusResponse,
} from './exportTypes';

const POLL_INTERVAL_MS = 500;

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function checkFfmpegStatus(): Promise<FfmpegStatusResponse> {
  const response = await fetch('/api/export/ffmpeg-status');
  return parseJson(response);
}

export async function validateExportProject(
  project: ExportStartRequest['project'],
  outputFormatId?: string,
  options?: { exportsDir?: string; qualityPresetId?: string },
): Promise<ExportValidationResponse> {
  const response = await fetch('/api/export/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project,
      outputFormatId,
      exportsDir: options?.exportsDir,
      qualityPresetId: options?.qualityPresetId,
    }),
  });
  return parseJson(response);
}

export async function startExport(request: ExportStartRequest): Promise<ExportStartResponse> {
  const response = await fetch('/api/export/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return parseJson(response);
}

export async function getExportStatus(jobId: string): Promise<ExportJobStatus> {
  const response = await fetch(`/api/export/status/${jobId}`);
  return parseJson(response);
}

export async function cancelExport(jobId: string): Promise<void> {
  const response = await fetch(`/api/export/cancel/${jobId}`, { method: 'POST' });
  await parseJson(response);
}

export function triggerExportDownload(jobId: string, filename: string): void {
  const a = document.createElement('a');
  a.href = `/api/export/download/${jobId}`;
  a.download = filename;
  a.click();
}

export async function waitForExport(
  jobId: string,
  onProgress: (status: ExportJobStatus) => void,
  signal?: AbortSignal,
): Promise<ExportJobStatus> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (signal?.aborted) {
        try {
          await cancelExport(jobId);
        } catch {
          /* ignore */
        }
        reject(new Error('Export cancelled'));
        return;
      }

      try {
        const status = await getExportStatus(jobId);
        onProgress(status);

        if (status.phase === 'complete') {
          resolve(status);
          return;
        }
        if (status.phase === 'error') {
          reject(new Error(status.error ?? 'Export failed'));
          return;
        }
        if (status.phase === 'cancelled') {
          reject(new Error('Export cancelled'));
          return;
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        reject(error);
      }
    };

    void poll();

    signal?.addEventListener(
      'abort',
      () => {
        if (timer) clearTimeout(timer);
        void cancelExport(jobId).finally(() => reject(new Error('Export cancelled')));
      },
      { once: true },
    );
  });
}
