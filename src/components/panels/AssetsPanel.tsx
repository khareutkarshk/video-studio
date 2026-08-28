import { useEffect, useState } from 'react';
import { ASSET_REGISTRY } from '../../assets/registry';
import { loadImage } from '../../assets/loadImage';
import { useProjectStore } from '../../store/ProjectContext';

export function AssetsPanel() {
  const { dispatch } = useProjectStore();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    ASSET_REGISTRY.forEach((asset) => {
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
  }, []);

  const backgrounds = ASSET_REGISTRY.filter((a) => a.type === 'background');
  const characters = ASSET_REGISTRY.filter((a) => a.type === 'character');
  const props = ASSET_REGISTRY.filter((a) => a.type === 'prop');

  return (
    <div className="panel assets-panel">
      <div className="panel-header">Assets</div>
      <div className="panel-body assets-body">
        <AssetSection
          title="Backgrounds"
          assets={backgrounds}
          thumbnails={thumbnails}
          onSelect={(id) => dispatch({ type: 'SET_BACKGROUND', assetId: id })}
        />
        <AssetSection
          title="Characters"
          assets={characters}
          thumbnails={thumbnails}
          onSelect={(id) =>
            dispatch({
              type: 'ADD_OR_SELECT_LAYER',
              assetId: id,
              layerId: id === 'placeholder-character' ? 'pogo' : `layer-${id}`,
            })
          }
        />
        {props.length > 0 && (
          <AssetSection
            title="Props"
            assets={props}
            thumbnails={thumbnails}
            onSelect={(id) =>
              dispatch({
                type: 'ADD_OR_SELECT_LAYER',
                assetId: id,
                layerId: `layer-${id}`,
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
  assets: typeof ASSET_REGISTRY;
  thumbnails: Record<string, string>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="asset-section">
      <div className="asset-section-title">{title}</div>
      <div className="asset-grid">
        {assets.map((asset) => (
          <button
            key={asset.id}
            className="asset-item"
            onClick={() => onSelect(asset.id)}
            title={asset.filename}
          >
            {thumbnails[asset.id] ? (
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
