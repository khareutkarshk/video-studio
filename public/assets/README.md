# Local Assets

Place your PNG/audio files here. They are **not tracked by Git** and stay on your machine only.

## Folder structure

```
public/assets/
├── Characters/
│   ├── BACKGROUND/     # BG_*.png backgrounds
│   ├── POGO/           # POGO character poses
│   ├── BOGO/           # BOGO character poses
│   ├── PIP/            # PIP character poses
│   └── PROPS/          # props (e.g. GIANT_EGG.png)
├── backgrounds/        # optional extra backgrounds
└── audio/
    ├── music/
    ├── ambience/
    ├── sfx/
    ├── dialogue/
    └── manifest.json   # optional provenance for commercial-safe assets
```

## Audio provenance

For YouTube, Shorts, and Reels, only use audio with clear licensing. Add approved assets under `audio/` and record provenance in `audio/manifest.json`:

```json
{
  "assets": {
    "audio/sfx/FOOTSTEPS.wav": {
      "source": "Kenney",
      "license": "CC0",
      "attributionRequired": false,
      "sourceUrl": "https://kenney.nl/assets"
    }
  }
}
```

After adding or removing files, regenerate the asset registry:

```bash
npm run generate-assets
```

See [`docs/animation-director.md`](../../docs/animation-director.md) for how Cursor should create and edit animation projects from scripts.

Then restart the dev server. Assets are loaded from `/assets/...` URLs locally via Vite.
