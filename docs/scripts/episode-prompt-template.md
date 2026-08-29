# Episode Prompt Template

Copy the block below into chat when you want a new episode. Fill every `{{...}}` field you care about; leave optional ones blank.

**You do not provide audio files.** The agent sources license-clear SFX / ambience / optional music (prefer CC0), saves them under `public/assets/audio/`, records provenance in `manifest.json`, wires cues to beats, then builds + validates the project.

---

## Prompt (copy from here)

```text
Create a Kids Animation Studio episode from this brief.

### Episode
- Title: {{EPISODE_TITLE}}
- Project file: projects/{{slug}}.json   (e.g. episode-02)
- Target length: {{~30s | ~60s | other}}
- Formats: landscape 16:9 + Shorts 9:16 (same master project)

### Story (1–3 sentences)
{{STORY}}

### Characters (use registry names: BOGO, POGO, PIP, …)
| Character | Role in episode |
|-----------|-----------------|
| {{NAME}}  | {{e.g. lead / enters late / silent}} |

### Setting / backgrounds
- Location mood: {{forest | clearing | home | …}}
- Preferred BG names if known: {{BG_FOREST_MAIN, … or "pick from registry"}}

### Props
| Prop | Notes |
|------|-------|
| {{GIANT_EGG or name}} | {{where / what happens}} |

### Visual beats (required)
List in order. One action per row.

| # | Action | Character | Direction / target | Notes |
|---|--------|-----------|--------------------|-------|
| 1 | {{walk | stop | look | point | react | enter | exit | …}} | {{BOGO}} | {{right / left / toward prop}} | {{}} |
| 2 | | | | |
| 3 | | | | |

### Scene grouping (optional — agent will group if blank)
| Scene name | Beats | Approx duration |
|------------|-------|-----------------|
| {{}} | {{1–2}} | {{~3s}} |

### Dialogue (optional — text only is fine; no voice files needed)
| Speaker | Line | When (beat) |
|---------|------|-------------|
| {{BOGO}} | "{{line}}" | {{e.g. after point}} |

### Camera intent (optional)
- Establishing: {{wide / follow walk}}
- Discovery: {{frame character + prop}}
- Reaction: {{slight zoom}}
- Entrance: {{group frame / pan with entrant}}

### Audio (agent-owned — do not attach files)
Agent must:
1. Infer SFX from visual beats (walk → footsteps, outdoor → ambience, point/react → short SFX, etc.).
2. Prefer CC0 / clear commercial-use sources; record each file in `public/assets/audio/manifest.json`.
3. Place files under `public/assets/audio/{ambience,sfx,music}/` with names that match `selectAudio` queries (e.g. `forest`, `footstep`, `reaction`, `point`).
4. Run `npm run generate-assets`, attach cues with director helpers, duck music/ambience under dialogue.
5. Optional soft music only if it fits kids tone and license is clear; skip if unsure.

Mood for sound: {{gentle forest | playful | quiet mystery | …}}
Skip music: {{yes | no}}

### Constraints
- Use only poses/props/backgrounds that exist in the asset registry (no inventing filenames).
- One active pose per character layer (`poseSegments`); no ghost layers.
- Keep subjects in portrait-safe center for Shorts.
- `npm run validate` must pass errors before done.
- Preview + export from the same master project.

### Deliverables
1. Script doc under `docs/scripts/{{slug}}.md` (beats + audio map).
2. Director episode builder (or update) + `projects/{{slug}}.json`.
3. Audio files + `manifest.json` entries.
4. Validate output summary.
```

---

## Minimal example (filled)

```text
Create a Kids Animation Studio episode from this brief.

### Episode
- Title: Forest Egg
- Project file: projects/episode-01.json
- Target length: ~12s
- Formats: landscape 16:9 + Shorts 9:16

### Story
Bogo walks through the forest, notices a giant egg, points and looks surprised. Pogo enters from the right.

### Characters
| Character | Role |
|-----------|------|
| BOGO | Lead — walk, notice, point, surprise |
| POGO | Late entrance from right |

### Setting / backgrounds
- Location mood: forest then clearing
- Preferred BG: BG_FOREST_MAIN, BG_FOREST_CLEARING

### Props
| Prop | Notes |
|------|-------|
| GIANT_EGG | In front of Bogo with clear gap |

### Visual beats
| # | Action | Character | Direction / target | Notes |
|---|--------|-----------|--------------------|-------|
| 1 | walk | BOGO | right | Enter from left |
| 2 | stop | BOGO | — | Near egg |
| 3 | look | BOGO | giant egg | Notice |
| 4 | point | BOGO | giant egg | |
| 5 | react | BOGO | surprised | |
| 6 | enter | POGO | left (from right) | Offscreen right → stop |

### Dialogue
| Speaker | Line | When |
|---------|------|------|
| BOGO | "Hey! Look at this giant egg!" | Point beat |
| POGO | "Whoa! It's huge!" | After Pogo arrives |

### Audio
Mood: gentle forest. Soft ambience + SFX; light music optional. Agent sources all audio.

### Constraints / Deliverables
As in the template above.
```

---

## What you must fill vs agent owns

| You provide | Agent owns |
|-------------|------------|
| Story + visual beats | Scene timing, camera, composition |
| Characters / props / location | Asset registry selection + fallbacks |
| Optional dialogue text | Text dialogue cues + ducking |
| Mood for sound (optional) | Finding, downloading, licensing SFX/ambience/music |
| Project slug / length | Episode builder, validate, project JSON |

Canonical worked example: [`forest-egg-test-script.md`](./forest-egg-test-script.md).
Director rules: [`docs/animation-director.md`](../animation-director.md).
