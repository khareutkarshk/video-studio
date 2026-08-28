import { spawnSync } from 'node:child_process';
import type { AudioTrack, MasterProject, Scene } from '../../src/types/project.ts';
import { getSceneStartTimes } from '../../src/store/projectReducer.ts';
import { getAssetByIdWithRuntime } from '../../src/assets/registry.ts';
import {
  computePreviewVolume,
  getTrackEndTime,
  isDialogueActiveAt,
} from '../../src/core/audioUtils.ts';
import { resolveFfprobePath } from './ffmpegCheck.ts';
import { collectProjectAudioPaths } from './projectAssets.ts';

export type AudioMixInput = {
  path: string;
};

export type AudioMixPlan = {
  inputs: AudioMixInput[];
  filterComplex: string;
  hasAudio: boolean;
};

type Segment = {
  path: string;
  globalStart: number;
  sourceOffset: number;
  duration: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
};

function probeAudioDuration(path: string): number | undefined {
  const ffprobePath = resolveFfprobePath();
  if (!ffprobePath) return undefined;

  const result = spawnSync(
    ffprobePath,
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      path,
    ],
    { encoding: 'utf-8' },
  );
  if (result.status !== 0) return undefined;
  const value = parseFloat(result.stdout.trim());
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function getDialogueIntervals(
  scene: Scene,
  assetDurations: Map<string, number>,
): Array<[number, number]> {
  const intervals: Array<[number, number]> = [];
  for (const track of scene.audioTracks) {
    if (track.type !== 'dialogue') continue;
    const assetDuration = track.assetId ? assetDurations.get(track.assetId) : undefined;
    intervals.push([track.startTime, getTrackEndTime(track, assetDuration)]);
  }
  return intervals;
}

function splitTrackSegments(
  track: AudioTrack,
  scene: Scene,
  sceneGlobalStart: number,
  path: string,
  assetDuration: number | undefined,
  dialogueIntervals: Array<[number, number]>,
): Segment[] {
  const trackStart = track.startTime;
  const trackEnd = getTrackEndTime(track, assetDuration);
  if (trackEnd <= trackStart) return [];

  const boundaries = new Set<number>([trackStart, trackEnd]);
  for (const [start, end] of dialogueIntervals) {
    if (end <= trackStart || start >= trackEnd) continue;
    boundaries.add(Math.max(trackStart, start));
    boundaries.add(Math.min(trackEnd, end));
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const segments: Segment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const sceneLocalStart = points[i];
    const sceneLocalEnd = points[i + 1];
    if (sceneLocalEnd <= sceneLocalStart) continue;

    const mid = (sceneLocalStart + sceneLocalEnd) / 2;
    const dialogueActive = isDialogueActiveAt(scene.audioTracks, mid);
    const localMid = mid - trackStart;
    const volume = computePreviewVolume(track, localMid, assetDuration, dialogueActive);
    if (volume <= 0) continue;

    segments.push({
      path,
      globalStart: sceneGlobalStart + sceneLocalStart,
      sourceOffset: sceneLocalStart - trackStart,
      duration: sceneLocalEnd - sceneLocalStart,
      volume,
      fadeIn: sceneLocalStart === trackStart ? (track.fadeIn ?? 0) : 0,
      fadeOut: sceneLocalEnd === trackEnd ? (track.fadeOut ?? 0) : 0,
    });
  }

  return segments;
}

export function buildAudioMixPlan(project: MasterProject): AudioMixPlan {
  const sceneStarts = getSceneStartTimes(project);
  const audioPaths = collectProjectAudioPaths(project);
  const pathByTrackId = new Map(audioPaths.map((item) => [item.trackId, item.path]));

  const assetDurations = new Map<string, number>();
  for (const scene of project.scenes) {
    for (const track of scene.audioTracks) {
      if (!track.assetId || assetDurations.has(track.assetId)) continue;
      const asset = getAssetByIdWithRuntime(track.assetId);
      const path = pathByTrackId.get(track.id);
      const probed = path ? probeAudioDuration(path) : undefined;
      const duration =
        probed ??
        asset?.durationSeconds ??
        (track.duration && track.duration > 0 ? track.duration : undefined);
      if (duration !== undefined) assetDurations.set(track.assetId, duration);
    }
  }

  const allSegments: Segment[] = [];

  for (const scene of project.scenes) {
    const sceneGlobalStart = sceneStarts.get(scene.id) ?? 0;
    const dialogueIntervals = getDialogueIntervals(scene, assetDurations);

    for (const track of scene.audioTracks) {
      if (!track.assetId || track.muted) continue;
      const path = pathByTrackId.get(track.id);
      if (!path) continue;

      const assetDuration = assetDurations.get(track.assetId);
      allSegments.push(
        ...splitTrackSegments(
          track,
          scene,
          sceneGlobalStart,
          path,
          assetDuration,
          dialogueIntervals,
        ),
      );
    }
  }

  if (allSegments.length === 0) {
    return { inputs: [], filterComplex: '', hasAudio: false };
  }

  const uniquePaths = [...new Set(allSegments.map((s) => s.path))];
  const pathToInputIndex = new Map(uniquePaths.map((path, index) => [path, index + 1]));
  const inputs = uniquePaths.map((path) => ({ path }));

  const segmentLabels: string[] = [];
  const filterParts: string[] = [];

  allSegments.forEach((segment, index) => {
    const inputIndex = pathToInputIndex.get(segment.path)!;
    const inputRef = `[${inputIndex}:a]`;
    const label = `seg${index}`;
    const delayMs = Math.round(segment.globalStart * 1000);
    const filters: string[] = [
      `atrim=start=${segment.sourceOffset.toFixed(3)}:duration=${segment.duration.toFixed(3)}`,
      'asetpts=PTS-STARTPTS',
    ];
    if (segment.fadeIn > 0) {
      filters.push(`afade=t=in:st=0:d=${segment.fadeIn.toFixed(3)}`);
    }
    if (segment.fadeOut > 0) {
      const fadeStart = Math.max(0, segment.duration - segment.fadeOut);
      filters.push(`afade=t=out:st=${fadeStart.toFixed(3)}:d=${segment.fadeOut.toFixed(3)}`);
    }
    filters.push(`volume=${segment.volume.toFixed(4)}`);
    if (delayMs > 0) filters.push(`adelay=${delayMs}|${delayMs}`);
    filterParts.push(`${inputRef}${filters.join(',')}[${label}]`);
    segmentLabels.push(`[${label}]`);
  });

  const mixInputs = segmentLabels.join('');
  filterParts.push(`${mixInputs}amix=inputs=${segmentLabels.length}:duration=longest:dropout_transition=0[aout]`);

  return {
    inputs,
    filterComplex: filterParts.join(';'),
    hasAudio: true,
  };
}
