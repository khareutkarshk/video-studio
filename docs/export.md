# MP4 Export

Kids Animation Studio exports MP4 videos locally using **Node.js** and **system FFmpeg**. The browser preview is unchanged; export runs through the Vite dev server.

## Requirements

1. **FFmpeg** on your PATH (or set `FFMPEG_PATH` to a binary; dev installs include `ffmpeg-static` for smoke tests)  
   - Linux: `sudo apt install ffmpeg`  
   - macOS: `brew install ffmpeg`  
   - Windows: install from [ffmpeg.org](https://ffmpeg.org/) and add to PATH  

2. Verify installation:

```bash
ffmpeg -version
```

3. **Generated assets** in `public/assets/`:

```bash
npm run generate-assets
```

4. **Dev server** (export API is dev-server middleware):

```bash
npm run dev
```

## Export from the UI

1. Open the app with `npm run dev`
2. Click **Export MP4** in the top bar
3. Choose output format, review validation warnings/errors
4. Click **Export**
5. When complete, the file downloads and is saved to `exports/` at the repo root

## CLI export

Same pipeline as the UI, without the browser:

```bash
npm run export -- projects/episode-01.json --format youtube-landscape
npm run export -- projects/episode-01.json --format youtube-shorts
```

Optional: `--filename my_episode.mp4`

## Supported formats

| Preset ID | Resolution | Aspect |
|-----------|------------|--------|
| `youtube-landscape` | 1920×1080 | 16:9 |
| `youtube-shorts` | 1080×1920 | 9:16 |
| `instagram-reels` | 1080×1920 | 9:16 |

Default encode settings: H.264 (`libx264`, preset `medium`, CRF 20), AAC 192 kbps @ 48 kHz.

## Output location

Completed files are written to:

```
exports/{project_name}_{width}x{height}.mp4
```

The folder is gitignored. Failed exports do not leave partial files in `exports/`.

## How it works

1. **Validate** project (errors block export; warnings are shown)
2. **Render frames** with the same `renderFrame()` used by preview (`@napi-rs/canvas` in Node)
3. **Mix audio** with FFmpeg filters (fades, volume, dialogue ducking on music/ambience)
4. **Encode** PNG sequence + mixed audio to MP4 via system FFmpeg

Text-only dialogue tracks (no audio file) are valid — they still duck background music but export without spoken audio until voice files exist.

## Common errors

| Error | Fix |
|-------|-----|
| FFmpeg was not found | Install FFmpeg and ensure it is on PATH |
| Validation failed | Fix errors listed in the export dialog |
| Missing assets | Run `npm run generate-assets` or add missing files under `public/` |
| Could not reach export server | Start the app with `npm run dev` |
| Export cancelled | Temp files are cleaned up; retry export |

## Limitations

- Export requires the Vite dev server (not a standalone production build server)
- PNG frame sequence is slower than piped raw video (acceptable for M8)
- No cloud upload or YouTube integration
