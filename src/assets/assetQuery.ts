import type { AssetMeta, AssetType, CharacterAction, CharacterDirection, AudioCategory } from '../types/assets';
import { ASSET_REGISTRY } from './registry.generated';

export type AssetQuery = {
  character?: string;
  action?: CharacterAction;
  direction?: CharacterDirection;
  type?: AssetType;
  category?: string;
  audioCategory?: AudioCategory;
  speaker?: string;
  productionReady?: boolean;
  nameContains?: string;
};

function matchesQuery(asset: AssetMeta, query: AssetQuery): boolean {
  if (query.productionReady === true && !asset.productionReady) return false;
  if (query.type && asset.type !== query.type) return false;
  if (query.category && asset.category !== query.category) return false;
  if (query.audioCategory && asset.audioCategory !== query.audioCategory) return false;
  if (query.speaker && asset.speaker?.toUpperCase() !== query.speaker.toUpperCase()) return false;
  if (query.character && asset.character?.toUpperCase() !== query.character.toUpperCase()) return false;
  if (query.action && asset.action !== query.action) return false;
  if (query.direction && asset.direction !== query.direction) return false;
  if (query.nameContains) {
    const q = query.nameContains.toLowerCase();
    if (
      !asset.filename.toLowerCase().includes(q) &&
      !asset.path.toLowerCase().includes(q) &&
      !asset.id.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
}

export function findAssets(query: AssetQuery = {}): AssetMeta[] {
  return ASSET_REGISTRY.filter((a) => matchesQuery(a, query));
}

export function findAsset(query: AssetQuery): AssetMeta | undefined {
  return findAssets({ ...query, productionReady: query.productionReady ?? true })[0];
}

export function findBackground(query: Pick<AssetQuery, 'nameContains'> = {}): AssetMeta | undefined {
  return findAssets({ type: 'background', productionReady: true, ...query })[0];
}

export function findProp(query: Pick<AssetQuery, 'nameContains'> = {}): AssetMeta | undefined {
  return findAssets({ type: 'prop', productionReady: true, ...query })[0];
}

export function findAudio(
  query: Pick<AssetQuery, 'nameContains' | 'audioCategory'> = {},
): AssetMeta | undefined {
  return findAssets({ type: 'audio', productionReady: true, ...query })[0];
}

export function findCharacterPose(
  character: string,
  action: CharacterAction,
  direction: CharacterDirection = 'unknown',
): AssetMeta | undefined {
  const exact = findAsset({ character, action, direction, type: 'character' });
  if (exact) return exact;
  return findAsset({ character, action, type: 'character' });
}

export type AssetCatalogSummary = {
  total: number;
  byCharacter: Record<string, number>;
  byAction: Record<string, number>;
  backgrounds: number;
  props: number;
};

export function getAssetCatalogSummary(): AssetCatalogSummary {
  const production = ASSET_REGISTRY.filter((a) => a.productionReady);
  const byCharacter: Record<string, number> = {};
  const byAction: Record<string, number> = {};

  for (const asset of production) {
    if (asset.character) {
      byCharacter[asset.character] = (byCharacter[asset.character] ?? 0) + 1;
    }
    if (asset.action !== 'unknown') {
      byAction[asset.action] = (byAction[asset.action] ?? 0) + 1;
    }
  }

  return {
    total: production.length,
    byCharacter,
    byAction,
    backgrounds: production.filter((a) => a.type === 'background').length,
    props: production.filter((a) => a.type === 'prop').length,
  };
}

export function getAssetByIdFromRegistry(id: string): AssetMeta | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id);
}
