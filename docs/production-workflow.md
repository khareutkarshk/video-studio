# Production Workflow

Kids Animation Studio is a **local** animation production tool. This guide covers the full loop from assets to exported MP4.

## 1. Where assets go

Place source files under:

```
public/assets/
  Characters/
  backgrounds/
  Audio/          (when used)
```

Character PNGs, backgrounds, props, and audio are **not** embedded in project JSON. Projects reference assets by registry IDs (e.g. `characters-bogo-bogo_walk_right`).

See also `public/assets/README.md`.

## 2. Generate the asset registry

After adding or changing files under `public/assets/`:

```bash
npm run generate-assets
```

This updates `src/assets/registry.generated.ts` so the editor and export pipeline can resolve paths.

## 3. Cursor creates an animation from a script

1. Provide a children's animation script (beats, dialogue, camera notes).
2. Cursor uses the director pipeline (`src/director/`) to build or update `projects/episode-01.json`.
3. Or run `npm run build-project` for the forest-egg test episode.

Projects live in `projects/` as JSON. One master project drives all output formats.

## 4. Preview in the browser

```bash
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

Load a project via URL: `?project=episode-01` (loads `projects/episode-01.json`).

Use **Play/Pause** to preview animation, audio, and dialogue timing.

## 5. Give Cursor corrections

Describe what to fix (timing, poses, camera, dialogue text). Cursor edits the project JSON. Refresh or reload to preview again.

Use **Undo/Redo** for quick local experiments.

## 6. Save a project

Click **Save** in the top bar to download `{project_name}.json`.

Save copies into `projects/` manually if you want them versioned in the repo.

The **Unsaved changes** badge appears when the open project differs from the last saved snapshot.

## 7. Validate before export

```bash
npm run validate
```

Or validate a specific file:

```bash
node scripts/validate-project.mjs projects/episode-01.json
```

Fix **errors** before export. **Warnings** (e.g. portrait safe-area) may be acceptable.

Full pre-release check:

```bash
npm run generate-assets
npm run validate
npm run build
npm run test
```

## 8. Export

### From the UI

1. Start `npm run dev`
2. Click **Export MP4**
3. Choose preset, filename, output folder (`exports` by default), and quality
4. Review validation panel
5. Click **Export**
6. On success, review verification summary and download; file is also written server-side

### From the CLI

```bash
npm run export -- projects/episode-01.json --format youtube-landscape
npm run export -- projects/episode-01.json --format youtube-shorts --quality recommended --output-dir exports
```

Requires FFmpeg on PATH (or `ffmpeg-static` in dev dependencies for smoke tests).

## 9. YouTube settings (Landscape)

| Setting | Value |
|---------|-------|
| Preset ID | `youtube-landscape` |
| Resolution | 1920 × 1080 |
| Aspect | 16:9 |
| FPS | 30 |
| Default filename | `{slug}-youtube.mp4` |

## 10. Shorts settings

| Setting | Value |
|---------|-------|
| Preset ID | `youtube-shorts` |
| Resolution | 1080 × 1920 |
| Aspect | 9:16 |
| FPS | 30 |
| Default filename | `{slug}-shorts.mp4` |

## 11. Reels settings

| Setting | Value |
|---------|-------|
| Preset ID | `instagram-reels` |
| Resolution | 1080 × 1920 |
| Aspect | 9:16 |
| FPS | 30 |
| Default filename | `{slug}-reels.mp4` |

Shorts and Reels share resolution; export each preset if you need separate filenames.

## 12. Where exported videos are stored

Default folder at repo root:

```
exports/
  episode-01-youtube.mp4
  episode-01-shorts.mp4
  episode-01-reels.mp4
```

`exports/` is gitignored. Original assets in `public/assets/` are never modified by export.

If a filename already exists, export uses a safe name (`episode-01-youtube-2.mp4`).

## Quality presets

| UI label | Use |
|----------|-----|
| Recommended | Default YouTube-quality (CRF 20) |
| High | Larger file, higher quality (CRF 18) |
| Smaller File | Faster encode, smaller file (CRF 24) |

## Common errors

| Problem | Fix |
|---------|-----|
| FFmpeg not found | Install FFmpeg; `ffmpeg -version` |
| Validation failed | Run `npm run validate`; fix listed errors |
| Missing assets | `npm run generate-assets` |
| Cannot write to folder | Check `exports` path and permissions |
| Export cancelled | Retry; temp files are cleaned up |
| Verification failed | Check ffprobe output; re-export |
| Could not reach export server | Run `npm run dev` for UI export |

See [export.md](export.md) for technical export details.

## Workflow summary

```
Script → Cursor edits projects/*.json → npm run dev → Preview
       → corrections → Save → validate → Export → exports/*.mp4
```

Everything stays on your machine. No cloud upload or accounts.
