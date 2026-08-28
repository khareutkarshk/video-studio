import type { AssetMeta, CharacterAction, CharacterDirection, AudioCategory } from '../types/assets';
import {
  findAsset,
  findAssets,
  findBackground,
  findCharacterPose,
  getAssetCatalogSummary,
} from '../assets/assetQuery';

export type AssetDecisionKind = 'exact' | 'fallback' | 'missing';

export type AssetDecision = {
  asset: AssetMeta | undefined;
  decision: AssetDecisionKind;
  reason?: string;
  query?: Record<string, string | boolean | undefined>;
};

export function selectCharacterPose(opts: {
  character: string;
  action: CharacterAction;
  direction?: CharacterDirection;
}): AssetDecision {
  const direction = opts.direction ?? 'right';
  const exact = findAsset({
    character: opts.character,
    action: opts.action,
    direction,
    type: 'character',
    productionReady: true,
  });

  if (exact) {
    return {
      asset: exact,
      decision: 'exact',
      query: { character: opts.character, action: opts.action, direction },
    };
  }

  const anyDirection = findCharacterPose(opts.character, opts.action, direction);
  if (anyDirection) {
    return {
      asset: anyDirection,
      decision: 'fallback',
      reason: `No production-ready ${opts.action}/${direction} pose; using closest ${anyDirection.action}/${anyDirection.direction}`,
      query: { character: opts.character, action: opts.action, direction },
    };
  }

  const idleFallback = findCharacterPose(opts.character, 'idle', direction);
  if (idleFallback) {
    return {
      asset: idleFallback,
      decision: 'fallback',
      reason: `No ${opts.action} pose; using idle/neutral`,
      query: { character: opts.character, action: opts.action, direction },
    };
  }

  return {
    asset: undefined,
    decision: 'missing',
    reason: `No production-ready pose for ${opts.character} action=${opts.action}`,
    query: { character: opts.character, action: opts.action, direction },
  };
}

export function selectBackground(opts: { nameContains: string }): AssetDecision {
  const asset = findBackground({ nameContains: opts.nameContains });
  if (asset) {
    return { asset, decision: 'exact', query: { nameContains: opts.nameContains } };
  }
  return {
    asset: undefined,
    decision: 'missing',
    reason: `No background matching "${opts.nameContains}"`,
    query: { nameContains: opts.nameContains },
  };
}

export function selectProp(opts: { nameContains: string }): AssetDecision {
  const assets = findAssets({ type: 'prop', productionReady: true, nameContains: opts.nameContains });
  const exact = assets.find(
    (a) => a.filename.toLowerCase() === `${opts.nameContains.toLowerCase()}.png` ||
      a.filename.toLowerCase() === opts.nameContains.toLowerCase(),
  );
  const asset = exact ?? assets[0];
  if (asset) {
    return {
      asset,
      decision: exact ? 'exact' : 'fallback',
      reason: exact ? undefined : `Using closest prop match for "${opts.nameContains}"`,
      query: { nameContains: opts.nameContains },
    };
  }
  return {
    asset: undefined,
    decision: 'missing',
    reason: `No prop matching "${opts.nameContains}"`,
    query: { nameContains: opts.nameContains },
  };
}

export function selectAudio(opts: {
  audioCategory?: AudioCategory;
  nameContains?: string;
}): AssetDecision {
  const assets = findAssets({
    type: 'audio',
    productionReady: true,
    nameContains: opts.nameContains,
  }).filter((a) => !opts.audioCategory || a.audioCategory === opts.audioCategory);

  const asset = assets[0];
  if (asset) {
    return {
      asset,
      decision: 'exact',
      query: { audioCategory: opts.audioCategory, nameContains: opts.nameContains },
    };
  }

  return {
    asset: undefined,
    decision: 'missing',
    reason: opts.nameContains
      ? `No audio matching "${opts.nameContains}"${opts.audioCategory ? ` (${opts.audioCategory})` : ''}`
      : `No audio asset${opts.audioCategory ? ` in category ${opts.audioCategory}` : ''}`,
    query: { audioCategory: opts.audioCategory, nameContains: opts.nameContains },
  };
}

export function selectVoice(opts: {
  speaker?: string;
  nameContains?: string;
}): AssetDecision {
  const assets = findAssets({
    type: 'audio',
    productionReady: true,
    audioCategory: 'dialogue',
    speaker: opts.speaker,
    nameContains: opts.nameContains,
  });
  const fallback = opts.speaker
    ? findAssets({
        type: 'audio',
        productionReady: true,
        nameContains: opts.nameContains ?? opts.speaker,
      }).filter((a) => a.audioCategory === 'dialogue' || a.speaker)
    : [];
  const asset = assets[0] ?? fallback[0];
  if (asset) {
    return {
      asset,
      decision: assets[0] ? 'exact' : 'fallback',
      query: { speaker: opts.speaker, nameContains: opts.nameContains },
    };
  }
  return {
    asset: undefined,
    decision: 'missing',
    reason: opts.speaker
      ? `No voice asset for speaker ${opts.speaker}`
      : 'No dialogue voice asset',
    query: { speaker: opts.speaker, nameContains: opts.nameContains },
  };
}

export function selectTalkingPose(
  character: string,
  direction: CharacterDirection = 'right',
): AssetDecision {
  const talk = selectCharacterPose({ character, action: 'talk', direction });
  if (talk.asset) return talk;

  const byName = findAssets({
    character,
    type: 'character',
    productionReady: true,
    nameContains: 'TALK',
  })[0];
  if (byName) {
    return {
      asset: byName,
      decision: 'fallback',
      reason: 'Using name-based talking pose match',
    };
  }

  const idle = selectCharacterPose({ character, action: 'idle', direction });
  if (idle.asset) {
    return {
      ...idle,
      decision: 'fallback',
      reason: idle.reason ?? 'No talking pose; using idle/neutral',
    };
  }
  return {
    asset: undefined,
    decision: 'missing',
    reason: `No talking or idle pose for ${character}`,
  };
}

export function listSpeakers(): string[] {
  const names = new Set<string>();
  for (const a of findAssets({ type: 'character', productionReady: true })) {
    if (a.character) names.add(a.character.toUpperCase());
  }
  return [...names].sort();
}

export function selectSurprisedPose(character: string, direction: CharacterDirection = 'right'): AssetDecision {
  const exact = selectCharacterPose({ character, action: 'surprised', direction });
  if (exact.asset) return exact;

  const byName = findAssets({
    character,
    type: 'character',
    productionReady: true,
    nameContains: direction === 'right' ? 'RIGHT_SURPRISED' : 'SURPRISED',
  })[0];

  if (byName) {
    return {
      asset: byName,
      decision: 'fallback',
      reason: 'Using name-based surprised pose match',
    };
  }

  return {
    asset: undefined,
    decision: 'missing',
    reason: `No surprised pose for ${character}`,
  };
}

export function listAvailableActions(character: string): CharacterAction[] {
  const assets = findAssets({ character, type: 'character', productionReady: true });
  const actions = new Set<CharacterAction>();
  for (const a of assets) {
    if (a.action !== 'unknown') actions.add(a.action);
  }
  return [...actions].sort();
}

export function requireAsset(decision: AssetDecision, label: string): AssetMeta {
  if (!decision.asset) {
    throw new Error(`${label}: ${decision.reason ?? 'asset missing'}`);
  }
  if (decision.decision === 'fallback') {
    console.warn(`[director] ${label}: ${decision.reason}`);
  }
  return decision.asset;
}

export { getAssetCatalogSummary };
