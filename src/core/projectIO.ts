import type { MasterProject, OutputFormat } from '../types/project';
import { PROJECT_FILE_VERSION } from '../constants/defaultProject';

export type ProjectFile = {
  version: number;
  project: MasterProject;
  outputFormatId?: string;
};

export function serializeProject(
  project: MasterProject,
  outputFormatId?: string,
): ProjectFile {
  return {
    version: PROJECT_FILE_VERSION,
    project: structuredClone(project),
    outputFormatId,
  };
}

export function deserializeProject(data: unknown): MasterProject {
  if (!data || typeof data !== 'object') throw new Error('Invalid project file');
  const file = data as ProjectFile;
  if (file.project && Array.isArray(file.project.scenes)) {
    return migrateProject(file.project);
  }
  throw new Error('Unrecognized project format');
}

function migrateProject(project: MasterProject): MasterProject {
  return {
    name: project.name ?? 'Untitled Animation',
    fps: project.fps ?? 30,
    version: PROJECT_FILE_VERSION,
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

export function downloadProjectJson(project: MasterProject, outputFormat?: OutputFormat): void {
  const file = serializeProject(project, outputFormat?.id);
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_').toLowerCase() || 'animation'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadProjectFromFile(file: File): Promise<ProjectFile> {
  const text = await file.text();
  const data = JSON.parse(text) as ProjectFile;
  return {
    ...data,
    project: deserializeProject(data),
  };
}
