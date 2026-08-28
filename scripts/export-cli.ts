/**
 * CLI export — same pipeline as the dev-server API.
 * Usage: npm run export -- projects/episode-01.json --format youtube-landscape
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deserializeProjectFile } from '../src/core/projectIO.ts';
import { findOutputPreset, OUTPUT_PRESETS } from '../src/constants/outputPresets.ts';
import { runExport } from './export/runExport.ts';

function parseArgs(argv: string[]): { projectPath: string; formatId: string; filename?: string } {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const projectPath = positional[0];
  if (!projectPath) {
    throw new Error('Usage: npm run export -- <project.json> [--format <preset-id>] [--filename <name.mp4>]');
  }

  let formatId = 'youtube-landscape';
  let filename: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--format' && argv[i + 1]) formatId = argv[i + 1];
    if (argv[i] === '--filename' && argv[i + 1]) filename = argv[i + 1];
  }

  return { projectPath, formatId, filename };
}

async function main() {
  const { projectPath, formatId, filename: filenameArg } = parseArgs(process.argv.slice(2));
  const absPath = join(process.cwd(), projectPath);
  const raw = JSON.parse(readFileSync(absPath, 'utf-8'));
  const { project } = deserializeProjectFile(raw);
  const format = findOutputPreset(formatId) ?? OUTPUT_PRESETS[0];
  const filename =
    filenameArg ??
    `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}_${format.width}x${format.height}.mp4`;

  console.log(`Exporting ${projectPath} as ${format.label} (${format.width}×${format.height})...`);

  const result = await runExport({
    project,
    format,
    filename,
    onProgress: ({ phase, progress, message }) => {
      console.log(`[${phase}] ${progress}% — ${message}`);
    },
  });

  console.log(`Wrote ${result.outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
