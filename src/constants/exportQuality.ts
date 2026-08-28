export type ExportQualityPreset = {
  id: string;
  label: string;
  videoPreset: string;
  crf: number;
  audioBitrate: string;
};

export const EXPORT_QUALITY_PRESETS: ExportQualityPreset[] = [
  {
    id: 'high',
    label: 'High',
    videoPreset: 'slow',
    crf: 18,
    audioBitrate: '192k',
  },
  {
    id: 'recommended',
    label: 'Recommended',
    videoPreset: 'medium',
    crf: 20,
    audioBitrate: '192k',
  },
  {
    id: 'smaller',
    label: 'Smaller File',
    videoPreset: 'faster',
    crf: 24,
    audioBitrate: '192k',
  },
];

export const DEFAULT_EXPORT_QUALITY_ID = 'recommended';

export function findExportQuality(id: string): ExportQualityPreset | undefined {
  return EXPORT_QUALITY_PRESETS.find((p) => p.id === id);
}

export function isValidExportQualityId(id: string): boolean {
  return EXPORT_QUALITY_PRESETS.some((p) => p.id === id);
}
