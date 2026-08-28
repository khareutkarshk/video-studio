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

## Dialogue beats (M6)

Text-only cues are always written. Voice `assetId` is set only when a local dialogue file exists.

| Scene | Speaker | Text | Timing |
|-------|---------|------|--------|
| 3 | BOGO | "Hey! Look at this giant egg!" | Point pose start (`neutralTime`) |
| 4 | POGO | "Whoa! It's huge!" | After Pogo arrives (`pogoWalkDuration`) |

Reaction cues: Pogo `listen` after Bogo's line (scene 3); Pogo `react` after Pogo's line (scene 4).

Voice files (optional): `public/assets/audio/dialogue/BOGO/`, `public/assets/audio/dialogue/POGO/`

## Expected composition

- **Backgrounds:** `BG_FOREST_MAIN` (scenes 1, 4), `BG_FOREST_CLEARING` (scenes 2, 3)
- **Bogo position:** left of egg, facing right (`BOGO_TARGET_X ≈ -280`)
- **Egg position:** in front of Bogo with wide gap (`EGG_X > BOGO_X`, gap ≈ 380)
- **Pogo entry:** starts at `x = +900` (offscreen right), walks left to `x ≈ +120` using `POGO_WALK_LEFT`

## Camera (M7)

| Scene | Camera intent |
|-------|---------------|
| 1 | Wide establishing (`zoom ≈ 0.85`); `cameraFollow` Bogo mid-walk; settle at stop |
| 2 | `frameSubjects` on Bogo + egg |
| 3 | Hold framed duo; slight zoom on surprised beat |
| 4 | Group frame: Bogo + egg + Pogo path; subtle pan as Pogo walks in |

Scene 4 includes held Bogo + egg layers (same positions as scene 3) so the entrance reads in context.

Preview in **16:9** and **9:16** using the output format selector — no duplicate animation data.

## Assets used

| Role | Query | Fallback policy |
|------|-------|-----------------|
| Bogo walk | `{ character: 'BOGO', action: 'walk', direction: 'right' }` | exact only |
| Bogo neutral | `{ character: 'BOGO', action: 'idle' }` | any direction |
| Bogo point | `{ character: 'BOGO', action: 'point', direction: 'right' }` | exact only |
| Bogo surprised | `{ action: 'surprised' }` or `RIGHT_SURPRISED` filename | log fallback |
| Giant egg | `{ type: 'prop', nameContains: 'GIANT_EGG' }` | exact only |
| Pogo walk | `{ character: 'POGO', action: 'walk', direction: 'left' }` | exact only |
| Pogo neutral | `{ character: 'POGO', action: 'idle' }` | any direction |

## Build command

```bash
npm run build-project   # writes projects/episode-01.json via buildForestEggEpisode()
npm run validate
```

Implementation: [`src/director/episodes/forestEggEpisode.ts`](../src/director/episodes/forestEggEpisode.ts)
