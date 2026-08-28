const PRESET_SUFFIX: Record<string, string> = {
  'youtube-landscape': 'youtube',
  'youtube-shorts': 'shorts',
  'instagram-reels': 'reels',
};

export function projectSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'animation';
}

export function presetFilenameSuffix(formatId: string): string {
  return PRESET_SUFFIX[formatId] ?? formatId.replace(/[^\w-]+/g, '-');
}

export function defaultExportFilename(projectName: string, formatId: string): string {
  return `${projectSlug(projectName)}-${presetFilenameSuffix(formatId)}.mp4`;
}
