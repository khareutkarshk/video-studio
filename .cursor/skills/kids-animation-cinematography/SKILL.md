---
name: kids-animation-cinematography
description: >-
  Kids Animation Studio video editing and cinematography principles for local
  2D kids episodes. Use when creating or correcting animation projects, camera
  moves, poses, scene transitions, framing for YouTube 16:9 / Shorts 9:16,
  preview/export consistency, or when the user asks about shot design, camera
  pan/zoom, pose timing, or production video quality.
---

# Kids Animation Cinematography

Apply these rules when building or fixing Kids Animation Studio projects
(`projects/*.json`, director helpers, preview/export). Everything stays local.

## Core model

- One **master project** drives landscape and portrait exports.
- Characters live in **logical composition space** (origin center, ~1920×1080).
- The **background is a landscape plate**. Camera pans/zooms **inside** it.
  Never leave black bars from camera moving the plate off-screen.
- **Pose segments** switch the character PNG on one layer. Never stack old poses
  as extra layers. One active pose per layer at time `t`.

## Camera

Do:

- Pan/zoom to follow action (`cameraFollow`, `cameraPan`, `cameraZoom`).
- Keep camera inside the background plate (renderer clamps with pan margin).
- Prefer modest moves: zoom ~0.9–1.25, pan within safe composition.
- Frame important subjects in the **portrait safe** center when the episode
  will also export as Shorts/Reels.

Do not:

- Treat camera as moving the whole stage into empty space.
- Use extreme pan that would require BG smaller than the viewport.
- Re-author separate animations per aspect ratio.

## Poses and reactions

Do:

- Use `poseSegments` on a single character layer for NEUTRAL → POINT → SURPRISED
  (etc.). Timing must be contiguous, non-overlapping.
- Carry **transform continuity** between scenes (`carryLayerContinuity`), not
  duplicate character layers.
- Change pose on reaction/dialogue beats; keep ground Y stable.

Do not:

- Add a second layer for the next pose (causes ghosting).
- Rely on scene crossfade to “blend” two poses of the same character.

## Character vs prop overlap

Do:

- Keep character foot-anchors clear of props unless the script says they grab,
  hide behind, or climb the prop (`placeCharacterBesideProp`, `MIN_PROP_CLEARANCE`).
- Place wide props (giant egg) with `placePropRelativeToCharacter` / gap ≥ clearance.
- Treat accidental overlap as a bug: fix spacing first; do not “solve” it only by
  z-index tricks.

Do not:

- Park a walk target on top of a prop (e.g. Pogo stop X ≈ egg X).
- Stack characters over props in the default episode layout.

## Scene transitions

| Type | Use when |
|------|----------|
| `fade` | Location change, time jump, avoid character doubles |
| `crossfade` | Same location / BG blend only (renderer crossfades **backgrounds**; characters come from the **incoming** scene) |
| `none` | Hard cut |

Prefer `fade` when the same character continues with a new pose in the next scene.

## Framing checklist (16:9 and 9:16)

Before export:

1. Characters and props readable in landscape.
2. Critical faces/props inside **portrait safe** (center ~9:16 crop).
3. No accidental off-screen starts unless intentional entrance.
4. Egg/props not covering faces.
5. Camera path does not reveal empty margins.

## Audio / dialogue

- User episode prompts do **not** require audio files. Agent sources SFX/ambience
  (prefer CC0), saves under `public/assets/audio/`, records `manifest.json`, then
  `npm run generate-assets` and wires cues to beats.
- Dialogue may be text-only until voice files exist.
- Keep dialogue windows aligned with pose/reaction cues.
- Duck music/ambience under dialogue (preview + export mix).
- Final MP4 duration must equal project timeline (never `-shortest` truncating).

## Agent workflow

1. Prefer user brief from `docs/scripts/episode-prompt-template.md` (or equivalent).
2. Read script → plan beats (enter, discover, react, exit).
3. Source missing audio from clear commercial-safe licenses; never skip provenance.
4. Build/update project via director helpers or edit JSON.
5. `npm run validate` — fix **errors**; treat portrait warnings seriously for Shorts.
6. Preview in browser (`pnpm dev`) — scrub pose changes and camera moves.
7. Export landscape + Shorts from the same master project.
8. If user reports ghosts: check duplicate layers, poseSegments, and transition type.
9. If user reports BG sliding off-frame: reduce camera pan/zoom or keep subjects
   centered; renderer clamps to the BG plate.

## Project touchpoints

- Camera helpers: `src/director/cameraHelpers.ts`
- Pose helpers: `src/director/poseHelpers.ts`
- Renderer / BG plate: `src/core/frameRenderer.ts`
- Composition / safe area: `src/core/composition.ts`, `compositionFraming.ts`
- Episode prompt template: `docs/scripts/episode-prompt-template.md`
- Docs: `docs/production-workflow.md`, `docs/animation-director.md`
