# Animation Director Guide

This application is a **local preview and inspection tool** for script-driven children's 2D animation. **Cursor** (or any coding agent) reads your script, inspects assets, and edits structured project JSON. The browser previews the result live.

The browser does **not** interpret natural-language stories or generate animation decisions.

## Workflow

```
USER SCRIPT → CURSOR → project JSON → BROWSER PREVIEW
```

1. Write or receive an animation script/story
2. Run `npm run generate-assets` to refresh the asset catalog
3. Inspect assets (see below)
4. Edit or generate `projects/episode-01.json`
5. Run `npm run validate`
6. Open `npm run dev` and preview at http://localhost:5173
7. Iterate: edit JSON → validate → refresh browser

## Project File Location

Canonical project files live in:

```
projects/episode-01.json
```

Load in browser:

- Default: http://localhost:5173 (loads `episode-01.json`)
- Specific: http://localhost:5173?project=episode-01

## Project Schema

```json
{
  "fileVersion": 3,
  "settings": { "name": "...", "fps": 30, "version": 2 },
  "outputFormatId": "youtube-landscape",
  "scenes": [
    {
      "id": "scene-1",
      "name": "Scene Name",
      "duration": 5,
      "backgroundAssetId": "characters-background-bg_forest_main",
      "transition": { "type": "fade", "duration": 0.5 },
      "camera": { "keyframes": [{ "time": 0, "x": 0, "y": 0, "zoom": 1 }] },
      "audioTracks": [],
      "layers": [
        {
          "id": "layer-bogo-walk",
          "name": "Bogo Walk",
          "assetId": "characters-bogo-bogo_walk_right",
          "startTime": 0,
          "endTime": 5,
          "zIndex": 1,
          "visible": true,
          "locked": false,
          "keyframes": [
            { "time": 0, "x": -700, "y": 142, "scale": 0.7, "rotation": 0, "opacity": 1, "easing": "linear" },
            { "time": 4, "x": -200, "y": 142, "scale": 0.7, "rotation": 0, "opacity": 1, "easing": "ease-in-out" }
          ]
        }
      ]
    }
  ]
}
```

Full schema: [`src/schema/project.schema.json`](../src/schema/project.schema.json)

**Important:** Animation data (scenes, layers, keyframes) is separate from `outputFormatId`. The same project previews in 16:9 and 9:16 without duplicating scenes.

## Inspecting Assets

### Regenerate catalog

```bash
npm run generate-assets
```

Reads `public/assets/Characters/` and writes `src/assets/registry.generated.ts`.

### Asset metadata

Each asset includes derived metadata:

| Field | Example |
|-------|---------|
| `id` | `characters-bogo-bogo_walk_right` |
| `character` | `BOGO` |
| `action` | `walk` |
| `direction` | `right` |
| `productionReady` | `true` (false for reference/emotion sheets) |

### Query API (TypeScript)

Use [`src/assets/assetQuery.ts`](../src/assets/assetQuery.ts):

```ts
import { findCharacterPose, findBackground, findProp } from './src/assets/assetQuery';

findCharacterPose('BOGO', 'walk', 'right');
findBackground({ nameContains: 'FOREST_MAIN' });
findProp({ nameContains: 'GIANT_EGG' });
```

### Director helpers

Use [`src/director/`](../src/director/) when building projects programmatically:

```ts
import { createScene, addCharacter, createProjectFile } from './src/director';
import { walkAcrossScene } from './src/director/presets';
import { findCharacterPose } from './src/assets/assetQuery';

const walkAsset = findCharacterPose('BOGO', 'walk', 'right')!;
let scene = createScene({
  id: 'scene-1',
  name: 'Bogo Walks',
  duration: 5,
  backgroundAssetId: 'characters-background-bg_forest_main',
});
scene = addCharacter(scene, {
  id: 'layer-bogo',
  assetId: walkAsset.id,
  name: 'Bogo',
  keyframes: walkAcrossScene({ startTime: 0, endTime: 4, startX: -700, endX: -200, y: 142 }),
});
```

### Animation presets

| Preset | Use case |
|--------|----------|
| `walkAcrossScene` | Character walks left-to-right |
| `runAcrossScene` | Faster walk |
| `enterFromLeft` / `enterFromRight` | Character enters frame |
| `exitLeft` / `exitRight` | Character exits |
| `idle` | Hold position |
| `jump` | Vertical arc |
| `flyAcrossScene` | For PIP fly poses |
| `point` / `wave` | Hold pose |

Coordinates use **logical space** with origin at center (1920×1080 reference). Default `y: 142`, `scale: 0.7`.

## Pose Selection from Script

| Script line | Asset query |
|-------------|-------------|
| "Bogo walks" | `{ character: 'BOGO', action: 'walk', direction: 'right' }` |
| "Pogo enters" | `{ character: 'POGO', action: 'walk', direction: 'right' }` + `enterFromRight` |
| "points at egg" | `{ character: 'BOGO', action: 'point', direction: 'right' }` |
| "giant egg" | `{ type: 'prop', nameContains: 'GIANT_EGG' }` |
| "forest background" | `{ type: 'background', nameContains: 'FOREST' }` |

If metadata is `unknown`, inspect `registry.generated.ts` directly rather than guessing.

## Camera Framing

Camera keyframes live on each scene:

```json
"camera": {
  "keyframes": [
    { "time": 0, "x": 0, "y": 0, "zoom": 1, "easing": "linear" }
  ]
}
```

- `x`, `y`: pan offset in logical units
- `zoom`: 1.0 = default

Keep important action in the **center safe zone** so it works in both landscape (16:9) and portrait (9:16). The yellow dashed guide in preview shows the portrait crop when editing in landscape.

## Multi-Scene Stories

Each scene has its own duration, background, layers, and transition. During playback, scenes advance automatically (Scene 1/3 · time display in timeline).

Transitions: `none`, `fade`, `crossfade` with duration in seconds.

## Validation

```bash
npm run validate
npm run build-project   # regenerate episode-01.json from real assets
```

Validation checks:

- Unknown asset IDs
- Duplicate layer/scene IDs
- Keyframes outside scene duration
- Invalid timing
- Missing required fields

## Example: Episode 01

Script: *"Bogo walks through the forest, notices a giant egg, points toward it, then Pogo enters."*

See [`projects/episode-01.json`](../projects/episode-01.json):

| Scene | Content |
|-------|---------|
| 1 | Bogo walks right across `BG_FOREST_MAIN` |
| 2 | Bogo neutral + giant egg + Bogo points on `BG_FOREST_CLEARING` |
| 3 | Pogo walks in on `BG_FOREST_MAIN` |

Rebuild with: `npm run build-project`

## Iteration Loop

1. User gives feedback ("make Bogo walk faster", "move egg left")
2. Cursor edits `projects/episode-01.json` or uses director helpers
3. `npm run validate`
4. Refresh browser
5. Preview and inspect in the editor UI

## What the Browser Is

- **Preview** — live Canvas playback
- **Inspect** — layers, keyframes, inspector, timeline
- **Manual tweaks** — small adjustments via UI

The browser is **not** an AI generator, cloud editor, or natural-language animation tool.
