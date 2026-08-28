import { readFileSync, existsSync } from 'node:fs';
import { readdir, writeFile, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const assetsRoot = join(root, 'public/assets');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.m4a']);
const ALPHA_THRESHOLD = 8;

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

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilterScanline(filterType, row, prevRow, bytesPerPixel) {
  const out = Buffer.from(row);
  const len = out.length;
  if (filterType === 0) return out;
  for (let i = 0; i < len; i++) {
    const raw = out[i];
    const a = i >= bytesPerPixel ? out[i - bytesPerPixel] : 0;
    const b = prevRow ? prevRow[i] : 0;
    const c = prevRow && i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0;
    if (filterType === 1) out[i] = (raw + a) & 0xff;
    else if (filterType === 2) out[i] = (raw + b) & 0xff;
    else if (filterType === 3) out[i] = (raw + Math.floor((a + b) / 2)) & 0xff;
    else if (filterType === 4) out[i] = (raw + paethPredictor(a, b, c)) & 0xff;
  }
  return out;
}

function readPngAlphaBoundsSync(filePath) {
  const { width, height } = readPngDimensionsSync(filePath);
  if (width <= 0 || height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  try {
    const buf = readFileSync(filePath);
    if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
      return { x: 0, y: 0, width, height };
    }

    let offset = 8;
    let colorType = 0;
    const idatChunks = [];

    while (offset + 8 <= buf.length) {
      const length = buf.readUInt32BE(offset);
      const type = buf.toString('ascii', offset + 4, offset + 8);
      const dataStart = offset + 8;
      const dataEnd = dataStart + length;

      if (type === 'IHDR' && length >= 13) {
        colorType = buf[dataStart + 9];
      } else if (type === 'IDAT') {
        idatChunks.push(buf.subarray(dataStart, dataEnd));
      } else if (type === 'IEND') {
        break;
      }

      offset = dataEnd + 4;
    }

    const hasAlpha = colorType === 4 || colorType === 6;
    if (!hasAlpha) {
      return { x: 0, y: 0, width, height };
    }

    const bytesPerPixel = colorType === 6 ? 4 : 2;
    const alphaIndex = colorType === 6 ? 3 : 1;
    const stride = width * bytesPerPixel;
    const compressed = Buffer.concat(idatChunks);
    const raw = inflateSync(compressed);

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let pos = 0;
    let prevRow = null;

    for (let y = 0; y < height; y++) {
      if (pos >= raw.length) break;
      const filterType = raw[pos++];
      const rowData = raw.subarray(pos, pos + stride);
      pos += stride;
      const row = unfilterScanline(filterType, rowData, prevRow, bytesPerPixel);
      prevRow = row;

      for (let x = 0; x < width; x++) {
        const alpha = row[x * bytesPerPixel + alphaIndex];
        if (alpha > ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0 || maxY < 0) {
      return { x: 0, y: 0, width, height };
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  } catch {
    return { x: 0, y: 0, width, height };
  }
}

const AUDIO_CATEGORIES = new Set(['music', 'ambience', 'sfx', 'dialogue']);

function readWavDurationSeconds(filePath) {
  try {
    const buf = readFileSync(filePath);
    if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') return undefined;
    const sampleRate = buf.readUInt32LE(24);
    const byteRate = buf.readUInt32LE(28);
    const dataSize = buf.readUInt32LE(40);
    if (byteRate > 0) return Math.round((dataSize / byteRate) * 1000) / 1000;
    if (sampleRate > 0) {
      const channels = buf.readUInt16LE(22);
      const bitsPerSample = buf.readUInt16LE(34);
      const bytesPerSample = (bitsPerSample / 8) * channels;
      if (bytesPerSample > 0) {
        return Math.round((dataSize / (sampleRate * bytesPerSample)) * 1000) / 1000;
      }
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function inferVoiceSpeaker(relPath, filename) {
  const parts = relPath.replace(/\\/g, '/').split('/');
  const dialogueIdx = parts.findIndex((p) => p.toLowerCase() === 'dialogue');
  if (dialogueIdx >= 0 && parts[dialogueIdx + 1] && !parts[dialogueIdx + 1].includes('.')) {
    return parts[dialogueIdx + 1].toUpperCase();
  }
  const base = filename.replace(/\.[^.]+$/, '');
  const prefix = base.split(/[_-]/)[0];
  if (prefix && prefix.length >= 2 && /[a-zA-Z]/.test(prefix)) return prefix.toUpperCase();
  return undefined;
}

function inferAudioCategory(relPath, filename) {
  const lower = relPath.toLowerCase();
  for (const cat of AUDIO_CATEGORIES) {
    if (lower.includes(`/audio/${cat}/`) || lower.startsWith(`audio/${cat}/`)) return cat;
  }
  const base = filename.replace(/\.[^.]+$/, '').toLowerCase();
  if (base.includes('music') || base.includes('bgm')) return 'music';
  if (base.includes('ambience') || base.includes('ambient')) return 'ambience';
  if (base.includes('dialogue') || base.includes('voice')) return 'dialogue';
  return 'sfx';
}

async function loadAudioManifest() {
  const manifestPath = join(assetsRoot, 'audio/manifest.json');
  if (!existsSync(manifestPath)) return {};
  try {
    const raw = JSON.parse(await readFile(manifestPath, 'utf-8'));
    return raw?.assets ?? raw ?? {};
  } catch {
    console.warn('Could not parse public/assets/audio/manifest.json');
    return {};
  }
}

function mergeManifestEntry(asset, manifest, rel) {
  const byPath = manifest[rel] ?? manifest[asset.path];
  const byId = manifest[asset.id];
  const entry = byPath ?? byId;
  if (!entry || typeof entry !== 'object') return asset;

  if (entry.audioCategory) asset.audioCategory = entry.audioCategory;
  if (entry.source) asset.source = entry.source;
  if (entry.license) asset.license = entry.license;
  if (entry.attributionRequired !== undefined) asset.attributionRequired = entry.attributionRequired;
  if (entry.sourceUrl) asset.sourceUrl = entry.sourceUrl;
  if (entry.durationSeconds) asset.durationSeconds = entry.durationSeconds;
  if (entry.speaker) asset.speaker = entry.speaker;
  return asset;
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
  if (['walk', 'run', 'jump', 'point', 'wave', 'idle', 'surprised', 'curious', 'fly', 'face', 'talk'].includes(t)) {
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

function findCharacterReferenceHeights(assets) {
  const map = new Map();
  for (const asset of assets) {
    if (asset.type !== 'character' || !asset.character || !asset.productionReady) continue;
    if (!asset.alphaBounds || asset.alphaBounds.height <= 0) continue;
    const isNeutral =
      asset.action === 'idle' &&
      (asset.direction === 'unknown' || asset.direction === 'right' || asset.direction === 'front');
    if (!isNeutral) continue;
    const existing = map.get(asset.character);
    if (existing === undefined || asset.alphaBounds.height > existing) {
      map.set(asset.character, asset.alphaBounds.height);
    }
  }
  return map;
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
      const isAudio = type === 'audio';
      const isSheet = !isAudio && (entry.name.includes('REFERENCE_SHEET') || entry.name.includes('EMOTIONS_SHEET'));
      const semantics = parseFilenameSemantics(entry.name, type, category);
      const isPng = ext === '.png';
      const { width, height } = isPng
        ? readPngDimensionsSync(full)
        : { width: 0, height: 0 };
      const aspectRatio = height > 0 ? Math.round((width / height) * 1000) / 1000 : 0;
      const alphaBounds =
        isPng && type === 'character' && !isSheet && !semantics.isReferenceSheet
          ? readPngAlphaBoundsSync(full)
          : isPng && (type === 'background' || type === 'prop')
            ? { x: 0, y: 0, width, height }
            : undefined;

      const durationSeconds = isAudio && ext === '.wav' ? readWavDurationSeconds(full) : undefined;

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
        nativeWidth: width,
        nativeHeight: height,
        width,
        height,
        aspectRatio,
        alphaBounds,
        isReferenceSheet: semantics.isReferenceSheet || isSheet,
        productionReady: !isSheet && !semantics.isReferenceSheet,
        hidden: isSheet || semantics.isReferenceSheet,
        ...(isAudio
          ? {
              audioCategory: inferAudioCategory(rel, entry.name),
              ...(durationSeconds !== undefined ? { durationSeconds } : {}),
              ...(inferAudioCategory(rel, entry.name) === 'dialogue' && inferVoiceSpeaker(rel, entry.name)
                ? { speaker: inferVoiceSpeaker(rel, entry.name) }
                : {}),
            }
          : {}),
      });
    }
  }
  return assets.sort((a, b) => a.url.localeCompare(b.url));
}

const assets = await walk(assetsRoot);
const audioManifest = await loadAudioManifest();

for (const asset of assets) {
  if (asset.type === 'audio') {
    mergeManifestEntry(asset, audioManifest, asset.path);
  }
}

const charRefHeights = findCharacterReferenceHeights(assets);
const bogoRefHeight = charRefHeights.get('BOGO') ?? 1;

for (const asset of assets) {
  if (asset.type === 'character' && asset.character && asset.alphaBounds?.height > 0) {
    const charRef = charRefHeights.get(asset.character) ?? asset.alphaBounds.height;
    const charRatio = bogoRefHeight / charRef;
    asset.characterSizeRatio = Math.round(charRatio * 1000) / 1000;
  }
}

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

export function getAssetsByAudioCategory(category: AssetMeta['audioCategory']): AssetMeta[] {
  return ASSET_REGISTRY.filter((a) => a.type === 'audio' && a.audioCategory === category && !a.hidden);
}

export function getCategories(): string[] {
  const cats = new Set(ASSET_REGISTRY.filter((a) => !a.hidden).map((a) => a.category ?? 'misc'));
  return [...cats].sort();
}

export function getCharacterReferenceHeights(): Map<string, number> {
  const map = new Map<string, number>();
  for (const asset of ASSET_REGISTRY) {
    if (asset.type !== 'character' || !asset.character || !asset.productionReady) continue;
    if (!asset.alphaBounds || asset.alphaBounds.height <= 0) continue;
    const isNeutral =
      asset.action === 'idle' &&
      (asset.direction === 'unknown' || asset.direction === 'right' || asset.direction === 'front');
    if (!isNeutral) continue;
    const existing = map.get(asset.character);
    if (existing === undefined || asset.alphaBounds.height > existing) {
      map.set(asset.character, asset.alphaBounds.height);
    }
  }
  return map;
}
`;

await writeFile(join(root, 'src/assets/registry.generated.ts'), out);
console.log(`Generated registry with ${assets.length} assets`);
console.log(`Character reference heights:`, Object.fromEntries(charRefHeights));
