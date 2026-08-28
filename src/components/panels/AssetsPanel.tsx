import { useEffect, useRef, useState } from 'react';
import {
  getAllAssets,
  getAssetsByType,
  getCategories,
  registerImportedAsset,
} from '../../assets/registry';
import { loadImage } from '../../assets/loadImage';
import { useProjectStore } from '../../store/ProjectContext';
import type { AssetMeta } from '../../types/assets';

export function AssetsPanel() {
  const { dispatch } = useProjectStore();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setImportTick] = useState(0);

  const assets = getAllAssets();

  useEffect(() => {
    assets.forEach((asset) => {
      loadImage(asset.url)
        .then((img) => {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const scale = Math.min(64 / img.width, 64 / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (64 - w) / 2, (64 - h) / 2, w, h);
          setThumbnails((prev) => ({ ...prev, [asset.id]: canvas.toDataURL() }));
        })
        .catch(() => undefined);
    });
  }, [assets.length]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
      const asset: AssetMeta = {
        id: `imported-${Date.now()}-${file.name}`,
        filename: file.name,
        type: isAudio ? 'audio' : ext.includes('bg') || file.name.toUpperCase().includes('BG_') ? 'background' : 'character',
        url,
        category: 'Imported',
        imported: true,
      };
      registerImportedAsset(asset);
    }
    setImportTick((n) => n + 1);
    e.target.value = '';
  };

  const backgrounds = getAssetsByType('background').filter(matchFilter);
  const props = getAssetsByType('prop').filter(matchFilter);
  const audio = getAssetsByType('audio').filter(matchFilter);
  const charCategories = getCategories().filter(
    (c) => !['BACKGROUND', 'backgrounds', 'PROPS', 'Imported', 'misc'].includes(c),
  );

  function matchFilter(a: AssetMeta) {
    if (!filter) return true;
    return a.filename.toLowerCase().includes(filter.toLowerCase());
  }

  return (
    <div className="panel assets-panel">
      <div className="panel-header">
        <span>Assets</span>
        <button className="btn-icon" title="Import files" onClick={() => fileInputRef.current?.click()}>+</button>
        <input ref={fileInputRef} type="file" accept="image/*,audio/*" multiple hidden onChange={handleImport} />
      </div>
      <div className="panel-body assets-body">
        <input
          className="asset-search"
          placeholder="Search assets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <AssetSection
          title="Backgrounds"
          assets={backgrounds}
          thumbnails={thumbnails}
          onSelect={(id) => dispatch({ type: 'SET_BACKGROUND', assetId: id })}
        />

        {charCategories.map((cat) => {
          const chars = getAllAssets().filter(
            (a) => a.type === 'character' && a.category === cat && matchFilter(a),
          );
          if (chars.length === 0) return null;
          return (
            <AssetSection
              key={cat}
              title={cat}
              assets={chars}
              thumbnails={thumbnails}
              onSelect={(id, asset) =>
                dispatch({
                  type: 'ADD_OR_SELECT_LAYER',
                  assetId: id,
                  layerId: `layer-${id}`,
                  name: asset.filename.replace(/\.[^.]+$/, ''),
                })
              }
            />
          );
        })}

        {props.length > 0 && (
          <AssetSection
            title="Props"
            assets={props}
            thumbnails={thumbnails}
            onSelect={(id, asset) =>
              dispatch({
                type: 'ADD_OR_SELECT_LAYER',
                assetId: id,
                layerId: `layer-${id}`,
                name: asset.filename.replace(/\.[^.]+$/, ''),
              })
            }
          />
        )}

        {audio.length > 0 && (
          <AssetSection
            title="Audio"
            assets={audio}
            thumbnails={thumbnails}
            onSelect={(id, asset) =>
              dispatch({
                type: 'ADD_AUDIO_TRACK',
                assetId: id,
                name: asset.filename.replace(/\.[^.]+$/, ''),
              })
            }
          />
        )}
      </div>
    </div>
  );
}

function AssetSection({
  title,
  assets,
  thumbnails,
  onSelect,
}: {
  title: string;
  assets: AssetMeta[];
  thumbnails: Record<string, string>;
  onSelect: (id: string, asset: AssetMeta) => void;
}) {
  return (
    <div className="asset-section">
      <div className="asset-section-title">{title}</div>
      <div className="asset-grid">
        {assets.map((asset) => (
          <button
            key={asset.id}
            className="asset-item"
            onClick={() => onSelect(asset.id, asset)}
            title={asset.filename}
          >
            {asset.type === 'audio' ? (
              <div className="asset-audio-icon">♪</div>
            ) : thumbnails[asset.id] ? (
              <img src={thumbnails[asset.id]} alt={asset.filename} />
            ) : (
              <div className="asset-placeholder" />
            )}
            <span className="asset-name">{asset.filename}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
