import type { MasterProject } from '../types/project';
import type { ProjectFile, LegacyProjectFile } from '../types/projectFile';
import { PROJECT_DATA_VERSION, PROJECT_FILE_VERSION } from '../types/projectFile';
import { OUTPUT_PRESETS } from '../constants/outputPresets';

export type ProjectFileLegacy = {
  version: number;
  project: MasterProject;
  outputFormatId?: string;
};

export function serializeProjectFile(
  project: MasterProject,
  outputFormatId?: string,
): ProjectFile {
  return {
    fileVersion: PROJECT_FILE_VERSION,
    settings: {
      name: project.name,
      fps: project.fps,
      version: project.version ?? PROJECT_DATA_VERSION,
    },
    outputFormatId,
    scenes: structuredClone(project.scenes),
  };
}

export function masterProjectFromFile(file: ProjectFile | LegacyProjectFile | ProjectFileLegacy): MasterProject {
  if ('settings' in file && file.settings && Array.isArray(file.scenes)) {
    return migrateProject({
      name: file.settings.name,
      fps: file.settings.fps,
      version: file.settings.version,
      scenes: file.scenes,
    });
  }
  if ('project' in file && file.project) {
    return migrateProject(file.project);
  }
  throw new Error('Unrecognized project format');
}

export function deserializeProjectFile(data: unknown): {
  file: ProjectFile;
  project: MasterProject;
} {
  if (!data || typeof data !== 'object') throw new Error('Invalid project file');

  const raw = data as ProjectFile | LegacyProjectFile | ProjectFileLegacy;

  if ('settings' in raw && raw.settings && Array.isArray(raw.scenes)) {
    const file = raw as ProjectFile;
    return {
      file: {
        fileVersion: file.fileVersion ?? PROJECT_FILE_VERSION,
        settings: file.settings,
        outputFormatId: file.outputFormatId,
        scenes: file.scenes,
      },
      project: masterProjectFromFile(file),
    };
  }

  if ('project' in raw && raw.project) {
    const project = masterProjectFromFile(raw);
    return {
      file: serializeProjectFile(project, raw.outputFormatId),
      project,
    };
  }

  throw new Error('Unrecognized project format');
}

/** @deprecated use deserializeProjectFile */
export function deserializeProject(data: unknown): MasterProject {
  return deserializeProjectFile(data).project;
}

function migrateProject(project: MasterProject): MasterProject {
  return {
    name: project.name ?? 'Untitled Animation',
    fps: project.fps ?? 30,
    version: PROJECT_DATA_VERSION,
    scenes: project.scenes.map((scene, i) => ({
      id: scene.id,
      name: scene.name ?? `Scene ${i + 1}`,
      duration: scene.duration ?? 5,
      backgroundAssetId: scene.backgroundAssetId ?? null,
      transition: scene.transition ?? { type: 'none', duration: 0 },
      camera: scene.camera ?? {
        keyframes: [{ time: 0, x: 0, y: 0, zoom: 1 }],
      },
      audioTracks: scene.audioTracks ?? [],
      layers: scene.layers.map((layer, j) => ({
        id: layer.id,
        name: layer.name ?? `Layer ${j + 1}`,
        assetId: layer.assetId,
        startTime: layer.startTime ?? 0,
        endTime: layer.endTime ?? scene.duration ?? 5,
        zIndex: layer.zIndex ?? j + 1,
        visible: layer.visible ?? true,
        locked: layer.locked ?? false,
        keyframes: layer.keyframes.map((kf) => ({
          ...kf,
          easing: kf.easing ?? 'linear',
        })),
      })),
    })),
  };
}

export function downloadProjectJson(project: MasterProject, outputFormatId?: string): void {
  const file = serializeProjectFile(project, outputFormatId);
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadProjectFromFile(file: File): Promise<{
  file: ProjectFile;
  project: MasterProject;
  outputFormatId?: string;
}> {
  const text = await file.text();
  const data = JSON.parse(text) as ProjectFile;
  const result = deserializeProjectFile(data);
  return {
    ...result,
    outputFormatId: result.file.outputFormatId,
  };
}

export function isValidOutputFormatId(id: string | undefined): boolean {
  if (!id) return true;
  return OUTPUT_PRESETS.some((p) => p.id === id);
}
