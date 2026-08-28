# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 73 files · ~36,733 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 833 nodes · 1724 edges · 45 communities (42 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf3b40e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- enum
- frameRenderer.ts
- projectIO.ts
- build-test-project.ts
- scripts
- properties
- validateProject.ts
- properties
- dialogueHelpers.ts
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- compositionHelpers.ts
- Forest Egg — Test Script
- properties
- plugins
- properties
- projectReducer.ts
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
- audioUtils.ts
- index.ts
- assetSelection.ts
- audioHelpers.ts
- properties
- required
- definitions
- enum
- project.schema.json
- required
- forestEggEpisode.ts
- buildForestEggEpisode
- duration

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 31 edges
2. `getTransformAtTime()` - 24 edges
3. `useProjectStore()` - 23 edges
4. `getAssetByIdWithRuntime()` - 19 edges
5. `compilerOptions` - 18 edges
6. `PreviewCanvas()` - 17 edges
7. `Scene` - 16 edges
8. `findAssets()` - 15 edges
9. `drawLayer()` - 15 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Kids Animation Studio App Shell` --conceptually_related_to--> `Kids Animation Studio`  [INFERRED]
  index.html → docs/animation-director.md
- `Asset Registry Generation` --conceptually_related_to--> `Alpha Bounds Metadata`  [INFERRED]
  public/assets/README.md → docs/animation-director.md
- `getAssetByIdFromRegistry()` --references--> `ASSET_REGISTRY`  [EXTRACTED]
  src/assets/assetQuery.ts → src/assets/registry.generated.ts
- `drawSelectionBox()` --indirect_call--> `getAssetByIdWithRuntime()`  [INFERRED]
  src/components/preview/PreviewCanvas.tsx → src/assets/registry.ts
- `PreviewCanvas()` --indirect_call--> `getAssetByIdWithRuntime()`  [INFERRED]
  src/components/preview/PreviewCanvas.tsx → src/assets/registry.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (45 total, 3 thin omitted)

### Community 0 - "enum"
Cohesion: 0.40
Nodes (5): ease-in, ease-in-out, ease-out, linear, enum

### Community 1 - "frameRenderer.ts"
Cohesion: 0.08
Nodes (57): getCachedImage(), imageCache, loadImage(), preloadAssets(), getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox(), getTransitionRenderState() (+49 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.12
Nodes (28): TopBar(), getProjectSlug(), ProjectLoader(), createDefaultScene(), DEFAULT_PROJECT, defaultCamera, GROUND_Y, makeLayer() (+20 more)

### Community 3 - "build-test-project.ts"
Cohesion: 0.50
Nodes (3): outDir, { project, assets, decisions }, root

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (41): @ffmpeg/ffmpeg, @ffmpeg/util, oxlint, dependencies, @ffmpeg/ffmpeg, @ffmpeg/util, react, react-dom (+33 more)

### Community 5 - "properties"
Cohesion: 0.12
Nodes (19): properties, properties, maximum, minimum, type, easing, opacity, rotation (+11 more)

### Community 6 - "validateProject.ts"
Cohesion: 0.07
Nodes (51): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+43 more)

### Community 7 - "properties"
Cohesion: 0.12
Nodes (16): fps, version, const, type, description, type, properties, fileVersion (+8 more)

### Community 8 - "dialogueHelpers.ts"
Cohesion: 0.18
Nodes (12): selectVoice(), addDialogueCue(), AudioCueOptions, addSpokenLine(), DialogueCueOptions, newReactionId(), ReactionAfterOptions, resetReactionCounter() (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "generate-asset-registry.mjs"
Cohesion: 0.14
Nodes (21): assetsRoot, AUDIO_CATEGORIES, AUDIO_EXT, charRefHeights, DIRECTIONS, __dirname, IMAGE_EXT, inferAudioCategory() (+13 more)

### Community 12 - "compositionHelpers.ts"
Cohesion: 0.07
Nodes (32): getGroundY(), carryLayerContinuity(), clampToSafeZone(), DEFAULT_CHARACTER_SCALE, DEFAULT_PROP_SCALE, FLY_Y_OFFSET, getDefaultGroundY(), getFlyY() (+24 more)

### Community 13 - "Forest Egg — Test Script"
Cohesion: 0.17
Nodes (11): Assets used, Audio beats (M5), Build command, Camera (M7), Dialogue beats (M6), Expected audio asset queries, Expected composition, Forest Egg — Test Script (+3 more)

### Community 14 - "properties"
Cohesion: 0.11
Nodes (20): null, string, items, type, type, scene, $ref, items (+12 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 17 - "properties"
Cohesion: 0.18
Nodes (11): listen, type, type, react, enum, afterTrackId, id, kind (+3 more)

### Community 18 - "projectReducer.ts"
Cohesion: 0.05
Nodes (74): App(), getAssetByIdWithRuntime(), EditorLayout(), AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel(), LayerInspector() (+66 more)

### Community 19 - "properties"
Cohesion: 0.12
Nodes (18): type, poseSegment, minimum, type, properties, type, properties, type (+10 more)

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
Cohesion: 0.10
Nodes (20): bogoLayer, computeEffectiveVolume(), computePreviewVolume(), directorFiles, durations, eggLayer, episode, episodePath (+12 more)

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

### Community 33 - "audioUtils.ts"
Cohesion: 0.14
Nodes (21): AudioPreviewEngine, AudioSyncParams, ResolvedAudioAsset, computeEffectiveVolume(), computePreviewVolume(), DIALOGUE_DUCK_FACTOR, getTrackDuration(), getTrackEndTime() (+13 more)

### Community 34 - "index.ts"
Cohesion: 0.16
Nodes (20): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+12 more)

### Community 35 - "assetSelection.ts"
Cohesion: 0.17
Nodes (24): AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findAudio(), findBackground(), findCharacterPose(), findProp() (+16 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.18
Nodes (13): selectAudio(), addAmbience(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack(), createMusicTrack() (+5 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 39 - "required"
Cohesion: 0.28
Nodes (9): opacity, rotation, scale, time, x, y, zoom, required (+1 more)

### Community 40 - "definitions"
Cohesion: 0.22
Nodes (9): type, type, definitions, audioTrack, cameraKeyframe, keyframe, reactionCue, type (+1 more)

### Community 41 - "enum"
Cohesion: 0.25
Nodes (8): ambience, crossfade, dialogue, fade, music, none, sfx, enum

### Community 42 - "project.schema.json"
Cohesion: 0.22
Nodes (8): fileVersion, scenes, settings, description, required, $schema, title, type

### Community 44 - "required"
Cohesion: 0.12
Nodes (19): assetId, duration, endTime, id, keyframes, kind, layers, name (+11 more)

### Community 46 - "forestEggEpisode.ts"
Cohesion: 0.11
Nodes (25): frameSubjects(), AssetDecision, cameraFollow(), CameraFollowOptions, cameraHold(), CameraHoldOptions, cameraMoveTo(), CameraMoveToOptions (+17 more)

### Community 51 - "buildForestEggEpisode"
Cohesion: 0.31
Nodes (11): buildForestEggEpisode(), finalizeScene(), clamp(), estimateDialogueDuration(), estimateHoldDuration(), estimatePauseDuration(), estimateReactionDuration(), estimateWalkDuration() (+3 more)

### Community 52 - "duration"
Cohesion: 0.29
Nodes (7): minimum, type, duration, transition, type, properties, type

## Knowledge Gaps
- **288 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+283 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `project.schema.json`, `properties`, `required`, `properties`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `definitions`, `properties`, `properties`, `duration`, `name`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Scene` connect `index.ts` to `frameRenderer.ts`, `projectIO.ts`, `audioUtils.ts`, `audioHelpers.ts`, `validateProject.ts`, `dialogueHelpers.ts`, `compositionHelpers.ts`, `forestEggEpisode.ts`, `projectReducer.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _288 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08018648018648018 - nodes in this community are weakly interconnected._
- **Should `projectIO.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11942959001782531 - nodes in this community are weakly interconnected._