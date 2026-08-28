# Animation Director Guide

**Authoritative guide for Cursor** when creating children's animation projects in Kids Animation Studio.

This application is a **local preview and inspection tool**. **Cursor** reads the script, searches real assets, builds project JSON, and the browser previews the result. The browser does **not** interpret stories, call AI APIs, or make animation decisions.

```
SCRIPT → Cursor (director) → project JSON → BROWSER PREVIEW → user feedback → Cursor edits JSON
```

---

## 17-Step Director Workflow

1. **Read the script** — understand story beats, characters, props, emotions.
2. **Break into visual beats** — discrete actions (walk, stop, point, enter). See [Visual Beats](#visual-beats).
3. **Group beats into scenes** — combine related actions; do not create a scene per micro-action.
4. **Identify characters** per scene — who appears, when they enter/exit.
5. **Search the asset registry** — `npm run generate-assets` then inspect `registry.generated.ts` or use `assetQuery`.
6. **Select poses/actions/directions** — use `selectCharacterPose()`; never invent filenames.
7. **Determine character sizes** — default `scale: 1.0`; renderer normalizes via alpha bounds.
8. **Position characters** — use composition helpers; egg in front of Bogo, entries from correct side.
9. **Create movement** — presets (`walkAcrossScene`, `enterFromRight`, etc.) produce keyframes.
10. **Sequence poses** — `sequencePoses()` on the same layer; independent from transform keyframes.
11. **Add props/backgrounds** — `addProp`, `setBackground` with real asset IDs.
12. **Add audio + dialogue cues** — SFX/music plus spoken lines with speaker, text, and timing. See [Audio Direction](#audio-direction) and [Dialogue Direction](#dialogue-direction).
13. **Set scene duration** — from action timing, not a fixed 5 seconds. See [Scene Timing](#scene-timing).
14. **Set camera framing** — keep action in center safe zone for 16:9 and 9:16.
15. **Validate** — `npm run validate`; fix all errors before preview.
16. **Preview** — `npm run dev` → http://localhost:5173
17. **Iterate** — edit project JSON or director code based on visual feedback. See [Feedback Loop](#feedback-loop).

---

## Visual Beats

Translate script lines into typed beats before building scenes.

**Example script:**
> Bogo walks through the forest, notices a giant egg, stops, points at it and looks surprised.

| Beat | Action | Character | Target | Direction |
|------|--------|-----------|--------|-----------|
| 1 | walk | BOGO | — | right |
| 2 | stop | BOGO | — | — |
| 3 | look | BOGO | giant egg | right |
| 4 | point | BOGO | giant egg | right |
| 5 | react | BOGO | giant egg | surprised |

**Scene grouping (forest-egg test):**

| Scene | Beats included |
|-------|----------------|
| 1 | walk |
| 2 | stop + look |
| 3 | point + react |
| 4 | Pogo enter |

TypeScript helpers: [`src/director/visualBeats.ts`](../src/director/visualBeats.ts)

```ts
import { FOREST_EGG_BEATS, getForestEggScenePlans, groupBeatsIntoScenes } from './src/director/visualBeats';

const plans = getForestEggScenePlans();
// or: groupBeatsIntoScenes(customBeats);
```

Full test script doc: [`docs/scripts/forest-egg-test-script.md`](scripts/forest-egg-test-script.md)

---

## Asset Selection

### Before selecting — inspect what exists

```bash
npm run generate-assets
```

```ts
import { getAssetCatalogSummary, listAvailableActions, selectCharacterPose } from './src/director';

getAssetCatalogSummary();
listAvailableActions('BOGO');
```

### Metadata fields

| Field | Use |
|-------|-----|
| `character` | BOGO, POGO, PIP |
| `action` | walk, idle, point, surprised, fly |
| `direction` | left, right, front |
| `productionReady` | must be `true` for animation |
| `nativeWidth` / `nativeHeight` | PNG dimensions |
| `alphaBounds` | visible content box for sizing/grounding |
| `characterSizeRatio` | relative size vs BOGO |

### Selection with fallback logging

```ts
import { selectCharacterPose, requireAsset, selectSurprisedPose } from './src/director';

const walk = selectCharacterPose({ character: 'BOGO', action: 'walk', direction: 'right' });
const asset = requireAsset(walk, 'Bogo walk');
```

**Rules:** Never invent asset IDs. Log fallback decisions. Do not silently reference missing assets.

Helpers: [`src/director/assetSelection.ts`](../src/director/assetSelection.ts)

---

## Character Actions

Every action combines **movement keyframes** + **pose segments** where applicable.

| Script concept | Preset | Pose segment |
|----------------|--------|--------------|
| walk toward X | `walkAcrossScene({ walkAssetId })` | walk pose |
| stop / idle | `stop({ poseAssetId })` | neutral |
| enter from right | `enterFromRight({ walkAssetId })` | walk pose |
| point | `stop({ poseAssetId: pointAsset })` | point pose |
| fly (Pip) | `flyAtHeight()` | fly pose (manual) |

**Example — Bogo walks (not static neutral sliding):**

```ts
const { keyframes, poseSegments } = walkAcrossScene({
  startTime: 0, endTime: 3.5, startX: -700, endX: -180,
  walkAssetId: walkAsset.id,
});
```

Presets: [`src/director/presets.ts`](../src/director/presets.ts)

---

## Character Interactions & Composition

```ts
import {
  placePropRelativeToCharacter,
  getOffscreenX,
  getDefaultGroundY,
  DEFAULT_CHARACTER_SCALE,
  DEFAULT_PROP_SCALE,
} from './src/director/compositionHelpers';

const bogoX = -180;
const eggX = placePropRelativeToCharacter({ characterX: bogoX, direction: 'right' });
const pogoStartX = getOffscreenX('right');  // +900
```

- Egg in front of Bogo when facing right (`eggX > bogoX`).
- Pogo enters from `x = +900`, not the left.
- Min spacing ~180 logical units. Safe zone X ≈ ±280.

Helpers: [`src/director/compositionHelpers.ts`](../src/director/compositionHelpers.ts)

---

## Character Size & Grounding

- Character default `scale: 1.0` (~65% frame height). Prop default `scale: 0.85`.
- Renderer uses alpha bounds — pose changes must not change visible height.
- Ground Y ≈ `260` (`getDefaultGroundY()`). Pip flies at `getFlyY()`.

---

## Scene Timing

| Action | Guideline |
|--------|-----------|
| Walk entrance | ~2–4s by distance |
| Point / reaction | ~1–2s per beat |
| Transition | ~0.5–1s |

```ts
import { estimateWalkDuration, estimateReactionDuration } from './src/director/timing';
```

Do **not** default every scene to 5 seconds.

---

## Audio Direction

Translate obvious visual actions into sound cues — but **not every action needs sound**. Keep children's content clear, not noisy.

### When to add sound

| Visual action | Audio cue | Notes |
|---------------|-----------|-------|
| Character walking | Footsteps SFX | During walk keyframe window only |
| Forest/outdoor scene | Subtle ambience | Low volume, full scene or fade in |
| Egg rolling | Rolling SFX | Starts when egg moves |
| Egg cracking | Crack SFX | At cracked pose start time |
| Point / surprise | Short reaction SFX | At pose segment start |
| Character entering fast | Optional whoosh | Use sparingly |

### Volume hierarchy

1. **Dialogue** (~0.9) — clearest
2. **Important SFX** (~0.5–0.7) — footsteps, reactions
3. **Music / ambience** (~0.25–0.35) — background layer

### Director helpers

```ts
import { addSfx, addAmbience, addMusic, selectAudio } from './src/director';

const footsteps = selectAudio({ audioCategory: 'sfx', nameContains: 'footstep' });
if (footsteps.asset) {
  scene = addSfx(scene, {
    assetId: footsteps.asset.id,
    name: 'Footsteps',
    startTime: 0,
    endTime: walkDuration,
    volume: 0.5,
  });
}
```

Helpers: [`src/director/audioHelpers.ts`](../src/director/audioHelpers.ts)

### Timing rule

**Animation timeline is source of truth.** Align `startTime` to:

- Walk SFX → walk keyframe `startTime`
- Reaction SFX → surprised pose segment `startTime`
- Point SFX → point pose segment `startTime`

### Provenance (commercial use)

For YouTube, Shorts, and Reels:

- Only use **local, approved** audio under `public/assets/audio/`
- Record license/source in `public/assets/audio/manifest.json`
- Never auto-download from arbitrary websites
- Never assume random internet audio is safe to publish

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

After adding audio files: `npm run generate-assets`

---

## Dialogue Direction

Translate spoken lines from the script into `type: "dialogue"` audio tracks. Dialogue is **not** a separate timeline — it lives on `scene.audioTracks` with `speaker`, `text`, optional `assetId`, and `layerId`.

**Example script:**

> Bogo: "Hey! Look at this giant egg!"
> Pogo: "Whoa! It's huge!"

```ts
import { addSpokenLine, selectVoice, estimateDialogueDuration, scheduleReactionAfterDialogue } from './src/director';

const line = 'Hey! Look at this giant egg!';
const voice = selectVoice({ speaker: 'BOGO' });
scene = addSpokenLine(scene, {
  speaker: 'BOGO',
  text: line,
  assetId: voice.asset?.id, // omit if no local voice file
  startTime: pointPoseStart,
  duration: estimateDialogueDuration(line, voice.asset?.durationSeconds),
  layerId: 'layer-bogo-poses',
});
```

### Timing

- Duration ≈ 13 characters/second, minimum ~1.2s, plus ~0.4s pause (`estimateDialogueDuration`).
- Align `startTime` to the pose/action (e.g. POINT starts when Bogo says "Look at this!").
- Lengthen the **scene** so the line plus pause fit inside bounds.
- Do not invent voice files. Text-only cues are valid for planning.

### Speaking vs poses

Dialogue tracks and pose segments stay **independent**.

- Prefer `selectTalkingPose()` only when the character is idle while speaking.
- Do **not** overwrite WALK / POINT / SURPRISED with a talking pose.
- `getActiveSpeakingCues(scene, time)` exposes `{ speaker, startTime, endTime }` for preview and future lip-sync.

### Conversational reactions

```ts
scene = scheduleReactionAfterDialogue(scene, {
  afterTrackId: 'bogo-dialogue-01',
  speaker: 'POGO',
  delay: 0.2,
  kind: 'listen',
});
```

Pogo listens, then reacts after Bogo finishes. No facial animation — this is timing metadata.

### Mix

Preview ducks music/ambience while dialogue is active. Keep dialogue volume ~0.9. SFX can overlap only if they do not bury the line.

### Speakers

Use `listSpeakers()` from production character assets. Do not hardcode BOGO/POGO/PIP as the only names.

Helpers: [`src/director/dialogueHelpers.ts`](../src/director/dialogueHelpers.ts), [`src/core/speaking.ts`](../src/core/speaking.ts)

---

## Camera & Output Formats

Same project works in 16:9 (`youtube-landscape`) and 9:16 (`youtube-portrait`). Do not duplicate scenes.

---

## Project Construction

```ts
import { buildForestEggEpisode } from './src/director/episodes/forestEggEpisode';

const { project, assets, decisions } = buildForestEggEpisode();
```

```bash
npm run build-project && npm run validate
```

---

## Validation

```bash
npm run validate
```

Fix all errors before preview. Warnings cover safe-zone crop risk and idle scene duration.

---

## Feedback Loop

| Feedback | Edit |
|----------|------|
| "Bogo is too small" | Increase layer `scale` on keyframes |
| "Closer to egg" | Adjust Bogo/egg `x` gap |
| "Pogo enters later" | Shift keyframe/pose times |
| "Scene too slow" | Reduce scene `duration` |
| "Portrait crops Bogo" | Move `x` toward center (±280) |
| "Footsteps too loud" | Lower SFX `volume` on audio track |
| "Add forest ambience" | `addAmbience()` aligned to scene duration |

---

## Test Episode

See [`docs/scripts/forest-egg-test-script.md`](scripts/forest-egg-test-script.md) and [`projects/episode-01.json`](../projects/episode-01.json).

| Scene | Content |
|-------|---------|
| 1 | Bogo walks (~3.5s) |
| 2 | Bogo + egg, egg right of Bogo (~2.3s) |
| 3 | POINT + Bogo line "Hey! Look at this giant egg!" |
| 4 | Pogo from right + "Whoa! It's huge!" |

---

## Director Modules

| Module | Purpose |
|--------|---------|
| `visualBeats.ts` | Beat types, scene grouping |
| `timing.ts` | Duration estimation |
| `assetSelection.ts` | Asset pick + fallback |
| `compositionHelpers.ts` | Position, spacing |
| `audioHelpers.ts` | Audio cue builders |
| `dialogueHelpers.ts` | Spoken lines + reaction cues |
| `presets.ts` | Movement presets |
| `episodes/forestEggEpisode.ts` | Test episode builder |

The browser is **not** an AI tool. **Cursor is the animation director.**
