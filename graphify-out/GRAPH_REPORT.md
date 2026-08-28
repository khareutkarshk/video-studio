# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 71 files · ~32,726 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 789 nodes · 1571 edges · 45 communities (42 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c70d8eca`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- projectReducer.ts
- project.ts
- projectIO.ts
- registry.ts
- scripts
- properties
- assetSelection.ts
- properties
- dialogueHelpers.ts
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- presets.ts
- Forest Egg — Test Script
- properties
- plugins
- required
- properties
- properties
- startTime
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
- forestEggEpisode.ts
- audioHelpers.ts
- compositionHelpers.ts
- properties
- required
- definitions
- enum
- project.schema.json
- required
- layer

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 28 edges
2. `useProjectStore()` - 23 edges
3. `getTransformAtTime()` - 18 edges
4. `compilerOptions` - 18 edges
5. `getAssetByIdWithRuntime()` - 17 edges
6. `drawLayer()` - 16 edges
7. `findAssets()` - 15 edges
8. `PreviewCanvas()` - 15 edges
9. `compilerOptions` - 15 edges
10. `walk()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Kids Animation Studio App Shell` --conceptually_related_to--> `Kids Animation Studio`  [INFERRED]
  index.html → docs/animation-director.md
- `Asset Registry Generation` --conceptually_related_to--> `Alpha Bounds Metadata`  [INFERRED]
  public/assets/README.md → docs/animation-director.md
- `AssetGroup()` --calls--> `formatAssetDisplayName()`  [EXTRACTED]
  src/components/panels/AssetsPanel.tsx → src/assets/assetBrowser.ts
- `listAvailableActions()` --calls--> `findAssets()`  [EXTRACTED]
  src/director/assetSelection.ts → src/assets/assetQuery.ts
- `listSpeakers()` --calls--> `findAssets()`  [EXTRACTED]
  src/director/assetSelection.ts → src/assets/assetQuery.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (45 total, 3 thin omitted)

### Community 0 - "projectReducer.ts"
Cohesion: 0.05
Nodes (72): EditorLayout(), AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel(), LayerInspector(), poseLabel(), PreviewPanel() (+64 more)

### Community 1 - "project.ts"
Cohesion: 0.07
Nodes (64): App(), getCachedImage(), imageCache, loadImage(), preloadAssets(), getAssetByIdWithRuntime(), getCharacterReferenceHeightsFromRegistry(), DragState (+56 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.13
Nodes (28): TopBar(), getProjectSlug(), ProjectLoader(), createCustomFormat(), findOutputPreset(), OUTPUT_PRESETS, deserializeProject(), deserializeProjectFile() (+20 more)

### Community 3 - "registry.ts"
Cohesion: 0.11
Nodes (29): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+21 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (41): @ffmpeg/ffmpeg, @ffmpeg/util, oxlint, dependencies, @ffmpeg/ffmpeg, @ffmpeg/util, react, react-dom (+33 more)

### Community 5 - "properties"
Cohesion: 0.09
Nodes (24): ease-in, ease-in-out, ease-out, linear, properties, enum, properties, maximum (+16 more)

### Community 6 - "assetSelection.ts"
Cohesion: 0.17
Nodes (24): AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findAudio(), findBackground(), findCharacterPose(), findProp() (+16 more)

### Community 7 - "properties"
Cohesion: 0.17
Nodes (12): const, type, description, type, properties, fileVersion, outputFormatId, scenes (+4 more)

### Community 8 - "dialogueHelpers.ts"
Cohesion: 0.18
Nodes (11): selectVoice(), AudioCueOptions, addSpokenLine(), DialogueCueOptions, newReactionId(), ReactionAfterOptions, resetReactionCounter(), scheduleReactionAfterDialogue() (+3 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "generate-asset-registry.mjs"
Cohesion: 0.14
Nodes (21): assetsRoot, AUDIO_CATEGORIES, AUDIO_EXT, charRefHeights, DIRECTIONS, __dirname, IMAGE_EXT, inferAudioCategory() (+13 more)

### Community 12 - "presets.ts"
Cohesion: 0.15
Nodes (18): getGroundY(), DEFAULT_Y, enterFromRight(), exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight(), idle() (+10 more)

### Community 13 - "Forest Egg — Test Script"
Cohesion: 0.18
Nodes (10): Assets used, Audio beats (M5), Build command, Dialogue beats (M6), Expected audio asset queries, Expected composition, Forest Egg — Test Script, Scene grouping (+2 more)

### Community 14 - "properties"
Cohesion: 0.12
Nodes (18): null, string, items, type, type, scene, $ref, items (+10 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 16 - "required"
Cohesion: 0.20
Nodes (11): duration, fps, id, layers, name, type, version, volume (+3 more)

### Community 17 - "properties"
Cohesion: 0.18
Nodes (11): listen, type, type, react, enum, afterTrackId, id, kind (+3 more)

### Community 18 - "properties"
Cohesion: 0.20
Nodes (10): properties, type, items, type, locked, poseSegments, visible, zIndex (+2 more)

### Community 19 - "startTime"
Cohesion: 0.18
Nodes (11): type, poseSegment, minimum, type, properties, type, assetId, endTime (+3 more)

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
Nodes (18): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyKeyframesToLayer(), createScene() (+10 more)

### Community 35 - "forestEggEpisode.ts"
Cohesion: 0.13
Nodes (24): outDir, { project, assets, decisions }, root, AssetDecision, selectAudio(), getOffscreenX(), attachForestEggAudio(), buildForestEggEpisode() (+16 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.22
Nodes (11): addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack(), createMusicTrack() (+3 more)

### Community 37 - "compositionHelpers.ts"
Cohesion: 0.14
Nodes (13): clampToSafeZone(), DEFAULT_CHARACTER_SCALE, DEFAULT_PROP_SCALE, FLY_Y_OFFSET, getDefaultGroundY(), getFlyY(), getSafeZoneBounds(), MIN_CHARACTER_SPACING (+5 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 39 - "required"
Cohesion: 0.28
Nodes (9): opacity, rotation, scale, time, x, y, zoom, required (+1 more)

### Community 40 - "definitions"
Cohesion: 0.29
Nodes (7): type, type, definitions, audioTrack, cameraKeyframe, keyframe, type

### Community 41 - "enum"
Cohesion: 0.13
Nodes (15): ambience, crossfade, dialogue, fade, music, none, sfx, minimum (+7 more)

### Community 42 - "project.schema.json"
Cohesion: 0.22
Nodes (8): fileVersion, scenes, settings, description, required, $schema, title, type

### Community 43 - "required"
Cohesion: 0.25
Nodes (8): endTime, kind, speaker, startTime, reactionCue, required, required, type

### Community 44 - "layer"
Cohesion: 0.40
Nodes (5): assetId, keyframes, layer, required, type

## Knowledge Gaps
- **277 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `project.schema.json`, `required`, `layer`, `properties`, `startTime`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `definitions`, `enum`, `properties`, `startTime`, `name`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `AssetMeta` connect `assetSelection.ts` to `project.ts`, `projectIO.ts`, `registry.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `projectReducer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.051935081148564294 - nodes in this community are weakly interconnected._
- **Should `project.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06740506329113924 - nodes in this community are weakly interconnected._