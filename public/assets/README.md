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
└── backgrounds/        # optional extra backgrounds
```

After adding or removing files, regenerate the asset registry:

```bash
npm run generate-assets
```

See [`docs/animation-director.md`](../../docs/animation-director.md) for how Cursor should create and edit animation projects from scripts.

Then restart the dev server. Assets are loaded from `/assets/...` URLs locally via Vite.
