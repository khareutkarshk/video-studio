export function toUserExportError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message === 'Export cancelled') {
    return 'Export cancelled.';
  }

  if (message.includes('FFmpeg was not found')) {
    return message;
  }

  if (message.startsWith('Validation failed:')) {
    return message.replace('Validation failed: ', 'Fix these issues before exporting: ');
  }

  if (message.startsWith('Missing assets:') || message.includes('Missing image asset') || message.includes('Missing audio asset')) {
    return `${message}. Run npm run generate-assets if files are missing from public/assets/.`;
  }

  if (message.includes('Could not load') || message.includes('Could not create export canvas')) {
    return `Could not load asset for export. ${message}`;
  }

  if (message.includes('Cannot write to output folder') || message.includes('Output directory')) {
    return message;
  }

  if (message.includes('Insufficient disk space')) {
    return message;
  }

  if (message.startsWith('Output verification failed')) {
    return message;
  }

  if (message.includes('FFmpeg exited') || message.includes('encoding failed')) {
    return 'Video encoding failed. Check that FFmpeg is installed and you have enough disk space.';
  }

  if (message.includes('FFmpeg did not produce')) {
    return 'Export did not produce a valid video file. Try again or check FFmpeg logs.';
  }

  if (message.includes('Invalid quality preset')) {
    return message;
  }

  return message.length > 200 ? `${message.slice(0, 200)}…` : message;
}
