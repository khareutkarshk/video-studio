import { readFileSync } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const assetsRoot = join(root, 'public/assets');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.m4a']);

const DIRECTIONS = new Set(['left', 'right', 'front', 'back']);

function readPngDimensionsSync(filePath) {
  try {
    const buf = readFileSync(filePath);
    if (buf.length < 24 || buf[0] !== 0x89) return { width: 0, height: 0 };
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch {
    return { width: 0, height: 0 };
  }
}

function inferType(relPath, filename) {
  const upper = relPath.toUpperCase();
  if (upper.includes('/BACKGROUND/') || upper.startsWith('BACKGROUNDS/')) return 'background';
  if (upper.includes('/PROPS/')) return 'prop';
  if (AUDIO_EXT.has(filename.slice(filename.lastIndexOf('.')).toLowerCase())) return 'audio';
  return 'character';
}

function inferCategory(relPath) {
  const parts = relPath.split('/');
  if (parts.length >= 2 && parts[0] === 'Characters') return parts[1];
  if (parts[0] === 'backgrounds') return 'backgrounds';
  return parts[0] ?? 'misc';
}

function toId(relPath) {
  return relPath
    .replace(/\.[^.]+$/, '')
    .replace(/[/\\]/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
}

function normalizeAction(raw) {
  const t = raw.toLowerCase().replace(/-/g, '_');
  if (t === 'neutral' || t === 'neutral.png') return 'idle';
  if (t === 'pointing') return 'point';
  if (t === 'waving') return 'wave';
  if (t === 'jumping') return 'jump';
  if (['walk', 'run', 'jump', 'point', 'wave', 'idle', 'surprised', 'curious', 'fly', 'face'].includes(t)) {
    return t;
  }
  return 'unknown';
}

function parseFilenameSemantics(filename, type, category) {
  const base = filename.replace(/\.[^.]+$/, '');
  const isReferenceSheet = base.includes('REFERENCE_SHEET') || base.includes('EMOTIONS_SHEET');

  if (type !== 'character') {
    return { character: undefined, action: 'unknown', direction: 'unknown', isReferenceSheet: false };
  }

  const character = category && ['BOGO', 'POGO', 'PIP'].includes(category) ? category : undefined;
  let remainder = base;

  if (character) {
    const prefix = `${character}_`;
    if (remainder.toUpperCase().startsWith(prefix)) {
      remainder = remainder.slice(prefix.length);
    } else if (remainder.toUpperCase() === character) {
      return { character, action: 'idle', direction: 'unknown', isReferenceSheet };
    }
  }

  if (isReferenceSheet) {
    return { character, action: 'unknown', direction: 'unknown', isReferenceSheet: true };
  }

  const parts = remainder.split('_').filter(Boolean);
  let action = 'unknown';
  let direction = 'unknown';

  if (parts.length === 0) {
    action = 'idle';
  } else if (parts.length === 1) {
    action = normalizeAction(parts[0]);
  } else {
    const last = parts[parts.length - 1].toLowerCase();
    if (DIRECTIONS.has(last)) {
      direction = last;
      action = normalizeAction(parts.slice(0, -1).join('_'));
      if (action === 'unknown') action = normalizeAction(parts[0]);
    } else if (parts.join('_').toUpperCase().includes('SURPRISED')) {
      action = 'surprised';
      if (parts.some((p) => p.toUpperCase() === 'LEFT')) direction = 'left';
      else if (parts.some((p) => p.toUpperCase() === 'RIGHT')) direction = 'right';
    } else if (parts[0]?.toUpperCase() === 'FACE' && DIRECTIONS.has(parts[1]?.toLowerCase())) {
      action = 'face';
      direction = parts[1].toLowerCase();
    } else if (parts[0]?.toUpperCase() === 'CURIOUS') {
      action = 'curious';
    } else {
      action = normalizeAction(parts.join('_'));
      if (action === 'unknown') action = normalizeAction(parts[0]);
    }
  }

  return { character, action, direction, isReferenceSheet: false };
}

async function walk(dir, base = assetsRoot) {
  const entries = await readdir(dir, { withFileTypes: true });
  const assets = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      assets.push(...(await walk(full, base)));
    } else {
      const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
      if (!IMAGE_EXT.has(ext) && !AUDIO_EXT.has(ext)) continue;
      const rel = relative(base, full).replace(/\\/g, '/');
      const type = inferType(rel, entry.name);
      const category = inferCategory(rel);
      const isSheet = entry.name.includes('REFERENCE_SHEET') || entry.name.includes('EMOTIONS_SHEET');
      const semantics = parseFilenameSemantics(entry.name, type, category);
      const { width, height } = IMAGE_EXT.has(ext)
        ? readPngDimensionsSync(full)
        : { width: 0, height: 0 };
      const aspectRatio = height > 0 ? Math.round((width / height) * 1000) / 1000 : 0;

      assets.push({
        id: toId(rel),
        filename: entry.name,
        path: rel,
        type,
        url: `/assets/${rel}`,
        category,
        character: semantics.character,
        action: semantics.action,
        direction: semantics.direction,
        width,
        height,
        aspectRatio,
        isReferenceSheet: semantics.isReferenceSheet || isSheet,
        productionReady: !isSheet && !semantics.isReferenceSheet,
        hidden: isSheet || semantics.isReferenceSheet,
      });
    }
  }
  return assets.sort((a, b) => a.url.localeCompare(b.url));
}

const assets = await walk(assetsRoot);

const out = `// AUTO-GENERATED by scripts/generate-asset-registry.mjs — do not edit manually
import type { AssetMeta } from '../types/assets';

export const ASSET_REGISTRY: AssetMeta[] = ${JSON.stringify(assets, null, 2)};

export function getAssetById(id: string): AssetMeta | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id);
}

export function getAssetsByType(type: AssetMeta['type']): AssetMeta[] {
  return ASSET_REGISTRY.filter((a) => a.type === type && !a.hidden);
}

export function getAssetsByCategory(category: string): AssetMeta[] {
  return ASSET_REGISTRY.filter((a) => a.category === category && !a.hidden);
}

export function getCategories(): string[] {
  const cats = new Set(ASSET_REGISTRY.filter((a) => !a.hidden).map((a) => a.category ?? 'misc'));
  return [...cats].sort();
}
`;

await writeFile(join(root, 'src/assets/registry.generated.ts'), out);
console.log(`Generated registry with ${assets.length} assets`);
