/**
 * CLI export — same pipeline as the dev-server API.
 * Usage: npm run export -- projects/episode-01.json --format youtube-landscape
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deserializeProjectFile } from '../src/core/projectIO.ts';
import { findOutputPreset, OUTPUT_PRESETS } from '../src/constants/outputPresets.ts';
import { DEFAULT_EXPORT_QUALITY_ID } from '../src/constants/exportQuality.ts';
import { defaultExportFilename } from '../src/export/exportNaming.ts';
import { runExport } from './export/runExport.ts';

function parseArgs(argv: string[]): {
  projectPath: string;
  formatId: string;
  filename?: string;
  exportsDir?: string;
  qualityId: string;
} {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const projectPath = positional[0];
  if (!projectPath) {
    throw new Error(
      'Usage: npm run export -- <project.json> [--format <preset-id>] [--filename <name.mp4>] [--output-dir exports] [--quality high|recommended|smaller]',
    );
  }

  let formatId = 'youtube-landscape';
  let filename: string | undefined;
  let exportsDir: string | undefined;
  let qualityId = DEFAULT_EXPORT_QUALITY_ID;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--format' && argv[i + 1]) formatId = argv[i + 1];
    if (argv[i] === '--filename' && argv[i + 1]) filename = argv[i + 1];
    if (argv[i] === '--output-dir' && argv[i + 1]) exportsDir = argv[i + 1];
    if (argv[i] === '--quality' && argv[i + 1]) qualityId = argv[i + 1];
  }

  return { projectPath, formatId, filename, exportsDir, qualityId };
}

async function main() {
  const { projectPath, formatId, filename: filenameArg, exportsDir, qualityId } = parseArgs(
    process.argv.slice(2),
  );
  const absPath = join(process.cwd(), projectPath);
  const raw = JSON.parse(readFileSync(absPath, 'utf-8'));
  const { project } = deserializeProjectFile(raw);
  const format = findOutputPreset(formatId) ?? OUTPUT_PRESETS[0];
  const filename = filenameArg ?? defaultExportFilename(project.name, format.id);

  console.log(`Exporting ${projectPath} as ${format.label} (${format.width}×${format.height})...`);

  const result = await runExport({
    project,
    format,
    filename,
    exportsDir,
    qualityPresetId: qualityId,
    onProgress: ({ phase, progress, message }) => {
      const pct = progress === null ? '…' : `${progress}%`;
      console.log(`[${phase}] ${pct} — ${message}`);
    },
  });

  console.log(`Wrote ${result.outputPath}`);
  console.log(
    `Verified: ${result.verification.width}×${result.verification.height}, ${result.verification.duration.toFixed(2)}s, ${(result.verification.fileSize / 1024 / 1024).toFixed(2)} MB`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
