export {
  ASSET_REGISTRY,
  getAssetById,
  getAssetsByType,
  getAssetsByCategory,
  getAssetsByAudioCategory,
  getCategories,
  getCharacterReferenceHeights,
} from './registry.generated';

import type { AssetMeta } from '../types/assets';
import { ASSET_REGISTRY as REGISTRY, getCharacterReferenceHeights } from './registry.generated';

/** Mutable runtime registry for imported assets */
let runtimeAssets: AssetMeta[] = [];

export function getAllAssets(): AssetMeta[] {
  return [...REGISTRY, ...runtimeAssets];
}

export function getAssetByIdWithRuntime(id: string): AssetMeta | undefined {
  return runtimeAssets.find((a) => a.id === id) ?? REGISTRY.find((a) => a.id === id);
}

export function registerImportedAsset(asset: AssetMeta): void {
  runtimeAssets = [...runtimeAssets.filter((a) => a.id !== asset.id), asset];
}

export function clearRuntimeAssets(): void {
  runtimeAssets = [];
}

export function getCharacterReferenceHeightsFromRegistry(): Map<string, number> {
  return getCharacterReferenceHeights();
}
