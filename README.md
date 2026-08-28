# Kids Animation Studio

Browser-based animation editor for kids' episodes with a deterministic director pipeline, canvas preview, and local MP4 export via FFmpeg.

## Quick start

```bash
npm install
npm run generate-assets
npm run dev
```

Open the URL shown in the terminal. Use **Export MP4** to render via the local export API (requires FFmpeg).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start editor + export API |
| `npm run build` | Production build |
| `npm run test` | Smoke tests |
| `npm run validate` | Validate `projects/episode-01.json` |
| `npm run build-project` | Regenerate episode JSON from director |
| `npm run export -- <project.json> [--format preset-id]` | CLI MP4 export |

## Export

See [docs/export.md](docs/export.md) for FFmpeg install, supported formats, output paths, and troubleshooting.

**Requirements:** system FFmpeg on PATH, generated assets, dev server running for UI export.

Output files: `exports/` (gitignored) + browser download.

## Director & docs

- [Production workflow](docs/production-workflow.md)
- [MP4 export](docs/export.md)
- [Animation director](docs/animation-director.md)
- [Forest egg test script](docs/scripts/forest-egg-test-script.md)
