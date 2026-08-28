export type AssetType = 'character' | 'background' | 'prop' | 'audio';

export type AudioCategory = 'music' | 'ambience' | 'sfx' | 'dialogue';

export type CharacterAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'point'
  | 'wave'
  | 'surprised'
  | 'curious'
  | 'fly'
  | 'face'
  | 'talk'
  | 'unknown';

export type CharacterDirection = 'left' | 'right' | 'front' | 'back' | 'unknown';

export type AlphaBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AssetMeta = {
  id: string;
  filename: string;
  path: string;
  type: AssetType;
  url: string;
  category: string;
  character?: string;
  action: CharacterAction;
  direction: CharacterDirection;
  /** Native PNG pixel dimensions. */
  nativeWidth: number;
  nativeHeight: number;
  /** @deprecated Use nativeWidth — kept for registry compatibility during migration. */
  width: number;
  /** @deprecated Use nativeHeight — kept for registry compatibility during migration. */
  height: number;
  aspectRatio: number;
  /** Visible non-transparent content bounds in native pixel coords. */
  alphaBounds?: AlphaBounds;
  /** Relative visual size vs BOGO reference neutral pose (1.0 = BOGO-sized). */
  characterSizeRatio?: number;
  isReferenceSheet: boolean;
  productionReady: boolean;
  hidden?: boolean;
  /** Runtime-imported assets use blob URLs */
  imported?: boolean;
  /** Voice/dialogue speaker inferred from path or manifest. */
  speaker?: string;
  /** Audio-only: category inferred from folder or manifest. */
  audioCategory?: AudioCategory;
  /** Audio-only: duration in seconds when known at registry generation. */
  durationSeconds?: number;
  /** Provenance for commercial-safe use. */
  source?: string;
  license?: string;
  attributionRequired?: boolean;
  sourceUrl?: string;
};
