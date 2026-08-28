import type { AssetMeta } from '../types/assets';
import { getAllAssets, getAssetsByType } from './registry';

export const THUMBNAIL_SIZE = 96;

/** Preferred display order for character folders */
const CHARACTER_ORDER = ['BOGO', 'POGO', 'PIP'];

export type AssetBrowserGroup = {
  id: string;
  title: string;
  kind: 'background' | 'character' | 'prop' | 'audio';
  assets: AssetMeta[];
};

/** Derive a human-readable label from the filename (no hardcoded pose lists). */
export function formatAssetDisplayName(asset: AssetMeta): string {
  let name = asset.filename.replace(/\.[^.]+$/, '');

  if (asset.type === 'character' && asset.category) {
    const prefix = `${asset.category}_`;
    if (name.toUpperCase().startsWith(prefix.toUpperCase())) {
      name = name.slice(prefix.length);
    }
  }

  if (asset.type === 'background' && name.toUpperCase().startsWith('BG_')) {
    name = name.slice(3);
  }

  if (asset.type === 'prop' && name.toUpperCase().startsWith('GIANT_')) {
    // keep GIANT_ prefix readable as "Giant ..."
  }

  if (!name) {
    name = asset.filename.replace(/\.[^.]+$/, '');
  }

  return name
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCategoryTitle(category: string): string {
  if (category === 'BACKGROUND') return 'Backgrounds';
  if (category === 'PROPS') return 'Props';
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export function matchesAssetSearch(asset: AssetMeta, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    asset.filename.toLowerCase().includes(q) ||
    (asset.category?.toLowerCase().includes(q) ?? false) ||
    formatAssetDisplayName(asset).toLowerCase().includes(q) ||
    asset.id.toLowerCase().includes(q)
  );
}

export function layerIdForAsset(assetId: string): string {
  return `layer-${assetId}`;
}

export function getVisibleProductionAssets(): AssetMeta[] {
  return getAllAssets().filter((a) => !a.hidden);
}

export function buildAssetBrowserGroups(searchQuery: string): AssetBrowserGroup[] {
  const visible = getVisibleProductionAssets().filter((a) => matchesAssetSearch(a, searchQuery));
  const groups: AssetBrowserGroup[] = [];

  const backgrounds = visible
    .filter((a) => a.type === 'background')
    .sort((a, b) => a.filename.localeCompare(b.filename));

  if (backgrounds.length > 0) {
    groups.push({
      id: 'backgrounds',
      title: 'Backgrounds',
      kind: 'background',
      assets: backgrounds,
    });
  }

  const extraCharacterCategories = [...new Set(
    visible
      .filter((a) => a.type === 'character')
      .map((a) => a.category ?? 'misc')
      .filter((c) => !CHARACTER_ORDER.includes(c)),
  )].sort();

  const characterCategories = [...CHARACTER_ORDER, ...extraCharacterCategories];

  for (const category of characterCategories) {
    const chars = visible
      .filter((a) => a.type === 'character' && a.category === category)
      .sort((a, b) => a.filename.localeCompare(b.filename));

    if (chars.length > 0) {
      groups.push({
        id: `character-${category}`,
        title: formatCategoryTitle(category),
        kind: 'character',
        assets: chars,
      });
    }
  }

  const props = visible
    .filter((a) => a.type === 'prop')
    .sort((a, b) => a.filename.localeCompare(b.filename));

  if (props.length > 0) {
    groups.push({
      id: 'props',
      title: 'Props',
      kind: 'prop',
      assets: props,
    });
  }

  const audio = visible
    .filter((a) => a.type === 'audio')
    .sort((a, b) => a.filename.localeCompare(b.filename));

  if (audio.length > 0) {
    groups.push({
      id: 'audio',
      title: 'Audio',
      kind: 'audio',
      assets: audio,
    });
  }

  return groups;
}

/** Count visible assets for empty-state messaging */
export function countVisibleAssets(): number {
  return getVisibleProductionAssets().length;
}

/** Background assets only (for quick checks) */
export function getBackgroundAssets(searchQuery = ''): AssetMeta[] {
  return getAssetsByType('background').filter((a) => matchesAssetSearch(a, searchQuery));
}
