import { useEffect } from 'react';
import { useProjectStore } from '../store/ProjectContext';
import { deserializeProjectFile } from '../core/projectIO';
import { findOutputPreset } from '../constants/outputPresets';
import { validateProjectFile } from '../core/validateProject';

function getProjectSlug(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('project') ?? 'episode-01';
}

export function ProjectLoader() {
  const { dispatch } = useProjectStore();

  useEffect(() => {
    const slug = getProjectSlug();
    const url = `/projects/${slug}.json`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const { file, project } = deserializeProjectFile(data);
        const validation = validateProjectFile(file);
        if (!validation.valid) {
          console.warn('Project validation issues:', validation.issues);
        }
        dispatch({ type: 'LOAD_PROJECT', project, outputFormatId: file.outputFormatId });
        if (file.outputFormatId) {
          const preset = findOutputPreset(file.outputFormatId);
          if (preset) dispatch({ type: 'SET_OUTPUT_FORMAT', format: preset });
        }
        console.info(`Loaded project: ${url}`);
      })
      .catch((err) => {
        console.info(`No project at ${url}, using default (${err.message})`);
      });
  }, [dispatch]);

  return null;
}
