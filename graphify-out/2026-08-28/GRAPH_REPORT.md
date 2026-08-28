# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 69 files · ~30,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 732 nodes · 1460 edges · 45 communities (42 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3116ded3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- projectReducer.ts
- frameRenderer.ts
- projectIO.ts
- registry.ts
- scripts
- properties
- assetSelection.ts
- project.schema.json
- settings
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- presets.ts
- Forest Egg — Test Script
- $ref
- plugins
- required
- properties
- type
- properties
- visualBeats.ts
- validate-project.mjs
- name
- smoke-test.mjs
- keyframes
- Kids Animation Studio
- Alpha Bounds Metadata
- Pose Segments
- tsconfig.json
- Logical Composition Space
- Local Untracked Assets
- React + TypeScript + Vite
- validateProject.ts
- index.ts
- forestEggEpisode.ts
- audioHelpers.ts
- compositionHelpers.ts
- properties
- required
- definitions
- enum
- enum
- build-test-project.ts
- opacity

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 25 edges
2. `useProjectStore()` - 23 edges
3. `getTransformAtTime()` - 18 edges
4. `compilerOptions` - 18 edges
5. `getAssetByIdWithRuntime()` - 17 edges
6. `PreviewCanvas()` - 15 edges
7. `compilerOptions` - 15 edges
8. `drawLayer()` - 13 edges
9. `findAssets()` - 12 edges
10. `appReducer()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Kids Animation Studio App Shell` --conceptually_related_to--> `Kids Animation Studio`  [INFERRED]
  index.html → docs/animation-director.md
- `Asset Registry Generation` --conceptually_related_to--> `Alpha Bounds Metadata`  [INFERRED]
  public/assets/README.md → docs/animation-director.md
- `drawSelectionBox()` --indirect_call--> `getAssetByIdWithRuntime()`  [INFERRED]
  src/components/preview/PreviewCanvas.tsx → src/assets/registry.ts
- `PreviewCanvas()` --indirect_call--> `getAssetByIdWithRuntime()`  [INFERRED]
  src/components/preview/PreviewCanvas.tsx → src/assets/registry.ts
- `ProjectProvider()` --indirect_call--> `historyReducer()`  [INFERRED]
  src/store/ProjectContext.tsx → src/store/projectReducer.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (45 total, 3 thin omitted)

### Community 0 - "projectReducer.ts"
Cohesion: 0.07
Nodes (52): AUDIO_TYPES, EASINGS, InspectorPanel(), createDefaultScene(), DEFAULT_PROJECT, defaultCamera, GROUND_Y, makeLayer() (+44 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.10
Nodes (46): getCachedImage(), getCharacterReferenceHeightsFromRegistry(), PreviewPanel(), DragState, drawSelectionBox(), PreviewCanvas(), CHARACTER_HEIGHT_FRACTION, CharacterVisualBounds (+38 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.07
Nodes (51): react, App(), getAssetByIdWithRuntime(), EditorLayout(), TopBar(), AudioTrackInspector(), LayerInspector(), poseLabel() (+43 more)

### Community 3 - "registry.ts"
Cohesion: 0.10
Nodes (32): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+24 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (41): @ffmpeg/ffmpeg, @ffmpeg/util, oxlint, dependencies, @ffmpeg/ffmpeg, @ffmpeg/util, react, react-dom (+33 more)

### Community 5 - "properties"
Cohesion: 0.16
Nodes (15): properties, properties, easing, rotation, scale, time, x, y (+7 more)

### Community 6 - "assetSelection.ts"
Cohesion: 0.15
Nodes (25): AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findAudio(), findBackground(), findCharacterPose(), findProp() (+17 more)

### Community 7 - "project.schema.json"
Cohesion: 0.10
Nodes (19): fileVersion, scenes, settings, description, const, type, description, type (+11 more)

### Community 8 - "settings"
Cohesion: 0.33
Nodes (6): fps, name, version, settings, required, type

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "generate-asset-registry.mjs"
Cohesion: 0.14
Nodes (20): assetsRoot, AUDIO_CATEGORIES, AUDIO_EXT, charRefHeights, DIRECTIONS, __dirname, IMAGE_EXT, inferAudioCategory() (+12 more)

### Community 12 - "presets.ts"
Cohesion: 0.18
Nodes (14): DEFAULT_Y, exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight(), idle(), MovementPresetOptions, MovementPresetResult (+6 more)

### Community 13 - "Forest Egg — Test Script"
Cohesion: 0.20
Nodes (9): Assets used, Audio beats (M5), Build command, Expected audio asset queries, Expected composition, Forest Egg — Test Script, Scene grouping, Script (+1 more)

### Community 14 - "$ref"
Cohesion: 0.25
Nodes (8): items, $ref, items, type, items, type, layers, poseSegments

### Community 15 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 16 - "required"
Cohesion: 0.15
Nodes (15): assetId, duration, endTime, id, keyframes, layers, startTime, type (+7 more)

### Community 17 - "properties"
Cohesion: 0.22
Nodes (10): type, minimum, type, audioTracks, duration, transition, type, properties (+2 more)

### Community 18 - "type"
Cohesion: 0.50
Nodes (4): null, string, type, backgroundAssetId

### Community 19 - "properties"
Cohesion: 0.13
Nodes (17): type, type, type, properties, type, properties, assetId, endTime (+9 more)

### Community 20 - "visualBeats.ts"
Cohesion: 0.25
Nodes (5): BeatAction, BeatDirection, FOREST_EGG_BEATS, ScenePlan, VisualBeat

### Community 21 - "validate-project.mjs"
Cohesion: 0.25
Nodes (7): assetIds, errors, file, issues, outputIds, registrySrc, root

### Community 22 - "name"
Cohesion: 0.25
Nodes (8): minimum, type, type, fps, name, version, properties, type

### Community 23 - "smoke-test.mjs"
Cohesion: 0.13
Nodes (15): bogoLayer, computeEffectiveVolume(), directorFiles, durations, eggLayer, episode, episodePath, getTrackDuration() (+7 more)

### Community 24 - "keyframes"
Cohesion: 0.33
Nodes (6): properties, type, items, type, camera, keyframes

### Community 25 - "Kids Animation Studio"
Cohesion: 0.50
Nodes (4): Director Helpers, Kids Animation Studio, Script-Driven Animation Workflow, Kids Animation Studio App Shell

### Community 26 - "Alpha Bounds Metadata"
Cohesion: 0.67
Nodes (3): Alpha Bounds Metadata, Smart Character Sizing, Asset Registry Generation

### Community 27 - "Pose Segments"
Cohesion: 0.67
Nodes (3): Episode 01 Forest Egg, Pose Segments, Transform Keyframes

### Community 32 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 33 - "validateProject.ts"
Cohesion: 0.15
Nodes (16): AudioPreviewEngine, AudioSyncParams, ResolvedAudioAsset, computeEffectiveVolume(), getTrackDuration(), getTrackEndTime(), getTrackLocalTime(), isTrackActiveAt() (+8 more)

### Community 34 - "index.ts"
Cohesion: 0.13
Nodes (23): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyKeyframesToLayer(), CreateSceneOptions (+15 more)

### Community 35 - "forestEggEpisode.ts"
Cohesion: 0.16
Nodes (20): resetAudioCounter(), getOffscreenX(), buildForestEggEpisode(), EGG_X, finalizeScene(), ForestEggAssets, ForestEggAudioTiming, ForestEggBuildResult (+12 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.18
Nodes (14): addAmbience(), addDialogueCue(), addMusic(), addSfx(), AudioCueOptions, buildTrack(), createAmbienceTrack(), createDialogueTrack() (+6 more)

### Community 37 - "compositionHelpers.ts"
Cohesion: 0.14
Nodes (14): getGroundY(), clampToSafeZone(), DEFAULT_CHARACTER_SCALE, DEFAULT_PROP_SCALE, FLY_Y_OFFSET, getDefaultGroundY(), getFlyY(), getSafeZoneBounds() (+6 more)

### Community 38 - "properties"
Cohesion: 0.15
Nodes (13): properties, minimum, type, minimum, type, type, fadeIn, fadeOut (+5 more)

### Community 39 - "required"
Cohesion: 0.22
Nodes (11): opacity, rotation, scale, time, x, y, zoom, required (+3 more)

### Community 40 - "definitions"
Cohesion: 0.22
Nodes (9): type, type, definitions, audioTrack, cameraKeyframe, layer, scene, type (+1 more)

### Community 41 - "enum"
Cohesion: 0.25
Nodes (8): ambience, crossfade, dialogue, fade, music, none, sfx, enum

### Community 42 - "enum"
Cohesion: 0.40
Nodes (5): ease-in, ease-in-out, ease-out, linear, enum

### Community 43 - "build-test-project.ts"
Cohesion: 0.50
Nodes (3): outDir, { project, assets, decisions }, root

### Community 44 - "opacity"
Cohesion: 0.50
Nodes (4): maximum, minimum, type, opacity

## Knowledge Gaps
- **257 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+252 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `required`, `required`, `project.schema.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `react` connect `projectIO.ts` to `projectReducer.ts`, `frameRenderer.ts`, `registry.ts`, `plugins`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `definitions`, `properties`, `properties`, `name`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _257 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `projectReducer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07010402532790593 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10377358490566038 - nodes in this community are weakly interconnected._