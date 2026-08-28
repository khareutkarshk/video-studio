import type { AssetMeta } from '../types/assets';

export const ASSET_REGISTRY: AssetMeta[] = [
  {
    id: 'placeholder-bg',
    filename: 'placeholder-bg.png',
    type: 'background',
    url: '/assets/backgrounds/placeholder-bg.png',
    category: 'backgrounds',
  },
  {
    id: 'placeholder-character',
    filename: 'placeholder-character.png',
    type: 'character',
    url: '/assets/characters/placeholder-character.png',
    category: 'characters',
  },
];

export function getAssetById(id: string): AssetMeta | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id);
}

export function getAssetsByType(type: AssetMeta['type']): AssetMeta[] {
  return ASSET_REGISTRY.filter((a) => a.type === type);
}
