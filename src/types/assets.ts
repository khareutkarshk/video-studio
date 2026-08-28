export type AssetType = 'character' | 'background' | 'prop' | 'audio';

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
  | 'unknown';

export type CharacterDirection = 'left' | 'right' | 'front' | 'back' | 'unknown';

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
  width: number;
  height: number;
  aspectRatio: number;
  isReferenceSheet: boolean;
  productionReady: boolean;
  hidden?: boolean;
  /** Runtime-imported assets use blob URLs */
  imported?: boolean;
};
