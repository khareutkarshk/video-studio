/**
 * Validate a project JSON file using the shared validator.
 * Usage: tsx scripts/validate-project.ts [path]
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deserializeProjectFile } from '../src/core/projectIO.ts';
import { validateExportProject } from './export/runExport.ts';
import { findOutputPreset } from '../src/constants/outputPresets.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectPath = process.argv[2] ?? join(root, 'projects/episode-01.json');
const absPath = join(root, projectPath.replace(/^\//, ''));

const raw = JSON.parse(readFileSync(absPath, 'utf-8'));
const { file, project } = deserializeProjectFile(raw);
const outputFormat = file.outputFormatId ? findOutputPreset(file.outputFormatId) : undefined;

const { errors, warnings } = validateExportProject(project, file.outputFormatId, {
  exportsDir: 'exports',
  outputFormat,
});

console.log(`Validating: ${projectPath}`);

for (const issue of errors) {
  console.log(`[ERROR] ${issue.path}: ${issue.message}`);
}
for (const issue of warnings) {
  console.log(`[WARNING] ${issue.path}: ${issue.message}`);
}

if (errors.length === 0) {
  console.log('Project is valid.');
  process.exit(0);
} else {
  console.log(`Validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
