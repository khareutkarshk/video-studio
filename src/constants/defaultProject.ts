import type { MasterProject } from '../types/project';

export const DEFAULT_PROJECT: MasterProject = {
  name: 'Untitled Animation',
  fps: 30,
  scenes: [
    {
      id: 'scene-1',
      duration: 5,
      backgroundAssetId: 'placeholder-bg',
      layers: [
        {
          id: 'pogo',
          assetId: 'placeholder-character',
          startTime: 0,
          endTime: 5,
          zIndex: 1,
          keyframes: [
            {
              time: 0,
              x: -700,
              y: 142,
              scale: 0.7,
              rotation: 0,
              opacity: 1,
            },
            {
              time: 4,
              x: -200,
              y: 142,
              scale: 0.7,
              rotation: 0,
              opacity: 1,
            },
          ],
        },
      ],
    },
  ],
};
