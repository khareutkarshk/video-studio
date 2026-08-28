export type AssetType = 'character' | 'background' | 'prop' | 'audio';

export type AssetMeta = {
  id: string;
  filename: string;
  type: AssetType;
  url: string;
  width?: number;
  height?: number;
  category?: string;
};
