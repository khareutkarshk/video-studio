import { useEffect, useMemo, useState } from 'react';
import {
  buildAssetBrowserGroups,
  countVisibleAssets,
  formatAssetDisplayName,
  layerIdForAsset,
} from '../../assets/assetBrowser';
import { loadThumbnailsBatch } from '../../assets/thumbnails';
import { registerImportedAsset } from '../../assets/registry';
import { useProjectStore } from '../../store/ProjectContext';
import type { AssetMeta } from '../../types/assets';
import type { AssetBrowserGroup } from '../../assets/assetBrowser';

export function AssetsPanel() {
  const { state, dispatch } = useProjectStore();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [importTick, setImportTick] = useState(0);

  const groups = useMemo(
    () => buildAssetBrowserGroups(filter),
    [filter, importTick],
  );

  const allUrls = useMemo(
    () => groups.flatMap((g) => g.assets.map((a) => a.url)),
    [groups],
  );

  useEffect(() => {
    if (allUrls.length === 0) return;
    let cancelled = false;

    loadThumbnailsBatch(allUrls, undefined, 6, (url, dataUrl) => {
      if (cancelled || !dataUrl) return;
      setThumbnails((prev) => (prev[url] ? prev : { ...prev, [url]: dataUrl }));
    });

    return () => {
      cancelled = true;
    };
  }, [allUrls.join('|')]);

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
        path: file.name,
        type: isAudio
          ? 'audio'
          : ext.includes('bg') || file.name.toUpperCase().includes('BG_')
            ? 'background'
            : 'character',
        url,
        category: 'Imported',
        action: 'unknown',
        direction: 'unknown',
        width: 0,
        height: 0,
        nativeWidth: 0,
        nativeHeight: 0,
        aspectRatio: 0,
        isReferenceSheet: false,
        productionReady: true,
        imported: true,
      };
      registerImportedAsset(asset);
    }
    setImportTick((n) => n + 1);
    e.target.value = '';
  };

  const handleBackgroundSelect = (assetId: string) => {
    dispatch({ type: 'SET_BACKGROUND', assetId });
  };

  const handleLayerSelect = (asset: AssetMeta) => {
    dispatch({
      type: 'ADD_OR_SELECT_LAYER',
      assetId: asset.id,
      layerId: layerIdForAsset(asset.id),
      name: formatAssetDisplayName(asset),
    });
  };

  const handleAudioSelect = (asset: AssetMeta) => {
    dispatch({
      type: 'ADD_AUDIO_TRACK',
      assetId: asset.id,
      name: formatAssetDisplayName(asset),
      trackType: asset.audioCategory ?? 'sfx',
    });
  };

  const toggleCollapse = (groupId: string) => {
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const activeBackgroundId =
    state.project.scenes.find((s) => s.id === state.editor.activeSceneId)?.backgroundAssetId ??
    null;

  return (
    <div className="panel assets-panel">
      <div className="panel-header">
        <span>Assets</span>
        <button
          className="btn-icon"
          title="Import local files"
          onClick={() => document.getElementById('asset-import-input')?.click()}
        >
          +
        </button>
        <input
          id="asset-import-input"
          type="file"
          accept="image/*,audio/*"
          multiple
          hidden
          onChange={handleImport}
        />
      </div>

      <div className="panel-body assets-body">
        <input
          className="asset-search"
          placeholder="Search by name, pose, character..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {groups.length === 0 ? (
          <div className="assets-empty">
            {countVisibleAssets() === 0
              ? 'No assets found. Add PNGs to public/assets/ and run npm run generate-assets.'
              : 'No assets match your search.'}
          </div>
        ) : (
          groups.map((group) => (
            <AssetGroup
              key={group.id}
              group={group}
              thumbnails={thumbnails}
              collapsed={collapsed[group.id] ?? false}
              activeBackgroundId={activeBackgroundId}
              onToggle={() => toggleCollapse(group.id)}
              onSelect={(asset) => {
                if (group.kind === 'background') handleBackgroundSelect(asset.id);
                else if (group.kind === 'audio') handleAudioSelect(asset);
                else handleLayerSelect(asset);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AssetGroup({
  group,
  thumbnails,
  collapsed,
  activeBackgroundId,
  onToggle,
  onSelect,
}: {
  group: AssetBrowserGroup;
  thumbnails: Record<string, string>;
  collapsed: boolean;
  activeBackgroundId: string | null;
  onToggle: () => void;
  onSelect: (asset: AssetMeta) => void;
}) {
  return (
    <div className="asset-section">
      <button className="asset-section-header" onClick={onToggle} type="button">
        <span className="asset-section-chevron">{collapsed ? '▸' : '▾'}</span>
        <span className="asset-section-title">{group.title}</span>
        <span className="asset-section-count">{group.assets.length}</span>
      </button>

      {!collapsed && (
        <div className={`asset-grid ${group.kind === 'background' ? 'asset-grid-bg' : ''}`}>
          {group.assets.map((asset) => {
            const displayName = formatAssetDisplayName(asset);
            const isActiveBg =
              group.kind === 'background' && activeBackgroundId === asset.id;

            return (
              <button
                key={asset.id}
                className={`asset-item ${isActiveBg ? 'asset-item-active' : ''}`}
                onClick={() => onSelect(asset)}
                title={asset.filename}
              >
                {group.kind === 'audio' ? (
                  <div className="asset-audio-icon">♪</div>
                ) : thumbnails[asset.url] ? (
                  <img src={thumbnails[asset.url]} alt={displayName} loading="lazy" />
                ) : (
                  <div className="asset-placeholder asset-placeholder-loading" />
                )}
                <span className="asset-name">{displayName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
