# Forest Egg — Test Script

Canonical test script for Milestone 4+ director workflow (visual + audio).

## Script

> Bogo walks through the forest. He notices a giant egg, stops, points at it and looks surprised. Pogo then enters from the right.

## Visual beats

| Beat | Action | Character | Notes |
|------|--------|-----------|-------|
| 1 | walk | BOGO | Enters from left, walks right |
| 2 | stop | BOGO | Reaches intended position |
| 3 | look | BOGO | Notices giant egg |
| 4 | point | BOGO | Points toward egg |
| 5 | react | BOGO | Surprised expression |
| 6 | enter | POGO | From offscreen right |

## Scene grouping

| Scene | Beats | Duration (approx) |
|-------|-------|-------------------|
| 1 — Bogo Walks Through Forest | walk | ~3.5s |
| 2 — Bogo Finds Giant Egg | stop, look | ~2.3s |
| 3 — Bogo Points and Surprised | point, react | ~2.8s |
| 4 — Pogo Enters | enter | ~3.5s |

## Audio beats (M5)

Audio tracks are added **only when matching local assets exist** in the registry. If no audio files are present, scenes keep empty `audioTracks` arrays.

| Scene | Audio cue | Type | Timing anchor |
|-------|-----------|------|---------------|
| 1 | Forest ambience | ambience | `startTime: 0`, full scene |
| 1 | Footsteps | sfx | `0` → `walkDuration` |
| 2 | Notice reaction | sfx | `startTime: 0` |
| 3 | Point SFX | sfx | `neutralTime` (point pose start) |
| 3 | Surprised reaction | sfx | `pointEnd` (surprised pose start) |
| 4 | Pogo footsteps | sfx | `0` → `pogoWalkDuration` |

### Expected audio asset queries

| Cue | Query |
|-----|-------|
| Forest ambience | `{ audioCategory: 'ambience', nameContains: 'forest' }` |
| Footsteps | `{ audioCategory: 'sfx', nameContains: 'footstep' }` |
| Reaction | `{ audioCategory: 'sfx', nameContains: 'reaction' }` |
| Point SFX | `{ audioCategory: 'sfx', nameContains: 'point' }` |

Place approved files under `public/assets/audio/` and run `npm run generate-assets`.

## Expected composition

- **Backgrounds:** `BG_FOREST_MAIN` (scenes 1, 4), `BG_FOREST_CLEARING` (scenes 2, 3)
- **Bogo position:** left of egg, facing right (`BOGO_TARGET_X ≈ -180`)
- **Egg position:** in front of Bogo (`EGG_X > BOGO_X`)
- **Pogo entry:** starts at `x = +900` (offscreen right), walks to `x ≈ +120`

## Assets used

| Role | Query | Fallback policy |
|------|-------|-----------------|
| Bogo walk | `{ character: 'BOGO', action: 'walk', direction: 'right' }` | exact only |
| Bogo neutral | `{ character: 'BOGO', action: 'idle' }` | any direction |
| Bogo point | `{ character: 'BOGO', action: 'point', direction: 'right' }` | exact only |
| Bogo surprised | `{ action: 'surprised' }` or `RIGHT_SURPRISED` filename | log fallback |
| Giant egg | `{ type: 'prop', nameContains: 'GIANT_EGG' }` | exact only |
| Pogo walk | `{ character: 'POGO', action: 'walk', direction: 'right' }` | exact only |
| Pogo neutral | `{ character: 'POGO', action: 'idle' }` | any direction |

## Build command

```bash
npm run build-project   # writes projects/episode-01.json via buildForestEggEpisode()
npm run validate
```

Implementation: [`src/director/episodes/forestEggEpisode.ts`](../src/director/episodes/forestEggEpisode.ts)
