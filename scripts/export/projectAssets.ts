import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { MasterProject } from '../../src/types/project.ts';
import { getAssetByIdWithRuntime } from '../../src/assets/registry.ts';

export function resolvePublicAssetPath(url: string, publicDir = join(process.cwd(), 'public')): string {
  return join(publicDir, url.replace(/^\//, ''));
}

export function collectProjectImageUrls(project: MasterProject): string[] {
  const urls = new Set<string>();
  for (const scene of project.scenes) {
    if (scene.backgroundAssetId) {
      const asset = getAssetByIdWithRuntime(scene.backgroundAssetId);
      if (asset) urls.add(asset.url);
    }
    for (const layer of scene.layers) {
      const asset = getAssetByIdWithRuntime(layer.assetId);
      if (asset) urls.add(asset.url);
      for (const seg of layer.poseSegments ?? []) {
        const poseAsset = getAssetByIdWithRuntime(seg.assetId);
        if (poseAsset) urls.add(poseAsset.url);
      }
    }
  }
  return [...urls];
}

export function collectProjectAudioPaths(project: MasterProject): Array<{
  trackId: string;
  sceneId: string;
  path: string;
  url: string;
}> {
  const items: Array<{ trackId: string; sceneId: string; path: string; url: string }> = [];
  for (const scene of project.scenes) {
    for (const track of scene.audioTracks) {
      if (!track.assetId) continue;
      const asset = getAssetByIdWithRuntime(track.assetId);
      if (!asset) continue;
      items.push({
        trackId: track.id,
        sceneId: scene.id,
        url: asset.url,
        path: resolvePublicAssetPath(asset.url),
      });
    }
  }
  return items;
}

export function findMissingImageAssets(project: MasterProject): string[] {
  const missing: string[] = [];
  for (const url of collectProjectImageUrls(project)) {
    const path = resolvePublicAssetPath(url);
    if (!existsSync(path)) missing.push(url);
  }
  return missing;
}

export function findMissingAudioAssets(project: MasterProject): string[] {
  const missing: string[] = [];
  for (const item of collectProjectAudioPaths(project)) {
    if (!existsSync(item.path)) missing.push(item.url);
  }
  return missing;
}
