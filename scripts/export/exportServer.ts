import { createReadStream, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ExportJobStatus, ExportStartRequest } from '../../src/export/exportTypes.ts';
import { checkFfmpeg } from './ffmpegCheck.ts';
import { runExport, validateExportProject } from './runExport.ts';
import { toUserExportError } from './exportErrors.ts';
import { findOutputPreset } from '../../src/constants/outputPresets.ts';

type ExportJob = {
  status: ExportJobStatus;
  abortController: AbortController;
  outputPath?: string;
};

const jobs = new Map<string, ExportJob>();

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')) as T);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function getExportJob(jobId: string): ExportJob | undefined {
  return jobs.get(jobId);
}

export async function startExportJob(request: ExportStartRequest): Promise<string> {
  const jobId = randomUUID();
  const abortController = new AbortController();

  const job: ExportJob = {
    abortController,
    outputPath: undefined,
    status: {
      jobId,
      phase: 'preparing',
      progress: 0,
      message: 'Preparing...',
      filename: request.filename,
    },
  };
  jobs.set(jobId, job);

  void runExport({
    project: request.project,
    format: request.outputFormat,
    filename: request.filename,
    exportsDir: request.exportsDir,
    qualityPresetId: request.qualityPresetId,
    signal: abortController.signal,
    onProgress: (update) => {
      job.status = {
        ...job.status,
        phase: update.phase,
        progress: update.progress,
        message: update.message,
      };
    },
  })
    .then((result) => {
      job.outputPath = result.outputPath;
      job.status = {
        ...job.status,
        phase: 'complete',
        progress: 100,
        message: 'Export complete',
        filename: result.filename,
        outputPath: result.outputPath,
        verification: result.verification,
      };
    })
    .catch((error: Error) => {
      const message = toUserExportError(error);
      if (message.includes('cancelled')) {
        job.status = {
          ...job.status,
          phase: 'cancelled',
          progress: null,
          message: 'Export cancelled',
        };
        return;
      }
      job.status = {
        ...job.status,
        phase: 'error',
        progress: null,
        message: 'Export failed',
        error: message,
      };
    });

  return jobId;
}

export function cancelExportJob(jobId: string): boolean {
  const job = jobs.get(jobId);
  if (!job) return false;
  job.abortController.abort();
  return true;
}

export function attachExportApi(
  middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void },
): void {
  middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/export')) {
          next();
          return;
        }

        try {
          if (url === '/api/export/ffmpeg-status' && req.method === 'GET') {
            sendJson(res, 200, checkFfmpeg());
            return;
          }

          if (url === '/api/export/validate' && req.method === 'POST') {
            const body = await readJsonBody<{
              project: ExportStartRequest['project'];
              outputFormatId?: string;
              exportsDir?: string;
              qualityPresetId?: string;
            }>(req);
            const outputFormat = body.outputFormatId
              ? findOutputPreset(body.outputFormatId)
              : undefined;
            const { errors, warnings } = validateExportProject(body.project, body.outputFormatId, {
              exportsDir: body.exportsDir,
              qualityPresetId: body.qualityPresetId,
              outputFormat,
            });
            sendJson(res, 200, {
              errors,
              warnings,
              canExport: errors.length === 0,
            });
            return;
          }

          if (url === '/api/export/start' && req.method === 'POST') {
            const body = await readJsonBody<ExportStartRequest>(req);
            const ffmpeg = checkFfmpeg();
            if (!ffmpeg.available) {
              sendJson(res, 503, { error: ffmpeg.error });
              return;
            }
            const jobId = await startExportJob(body);
            sendJson(res, 200, { jobId });
            return;
          }

          const statusMatch = url.match(/^\/api\/export\/status\/([^/?]+)$/);
          if (statusMatch && req.method === 'GET') {
            const job = jobs.get(statusMatch[1]);
            if (!job) {
              sendJson(res, 404, { error: 'Job not found' });
              return;
            }
            sendJson(res, 200, job.status);
            return;
          }

          const cancelMatch = url.match(/^\/api\/export\/cancel\/([^/?]+)$/);
          if (cancelMatch && req.method === 'POST') {
            const ok = cancelExportJob(cancelMatch[1]);
            sendJson(res, ok ? 200 : 404, { ok });
            return;
          }

          const downloadMatch = url.match(/^\/api\/export\/download\/([^/?]+)$/);
          if (downloadMatch && req.method === 'GET') {
            const job = jobs.get(downloadMatch[1]);
            if (!job?.outputPath || !existsSync(job.outputPath)) {
              sendJson(res, 404, { error: 'Export not ready' });
              return;
            }
            const filename = job.status.filename ?? 'export.mp4';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            createReadStream(job.outputPath).pipe(res);
            return;
          }

          sendJson(res, 404, { error: 'Not found' });
        } catch (error) {
          sendJson(res, 500, {
            error: toUserExportError(error),
          });
        }
      });
}
