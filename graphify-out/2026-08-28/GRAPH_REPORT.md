# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 86 files · ~40,916 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 942 nodes · 1968 edges · 42 communities (39 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `38d5691a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- frameRenderer.ts
- projectIO.ts
- runExport.ts
- scripts
- properties
- registry.ts
- project.schema.json
- dialogueHelpers.ts
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- compositionHelpers.ts
- Forest Egg — Test Script
- properties
- plugins
- presets.ts
- properties
- project.ts
- properties
- visualBeats.ts
- validate-project.mjs
- name
- smoke-test.mjs
- build-test-project.ts
- Kids Animation Studio
- Alpha Bounds Metadata
- Pose Segments
- tsconfig.json
- Logical Composition Space
- Local Untracked Assets
- audioUtils.ts
- index.ts
- assetSelection.ts
- audioHelpers.ts
- properties
- required
- enum
- definitions
- cameraHelpers.ts
- forestEggEpisode.ts

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 31 edges
2. `useProjectStore()` - 25 edges
3. `getTransformAtTime()` - 24 edges
4. `getAssetByIdWithRuntime()` - 22 edges
5. `compilerOptions` - 18 edges
6. `PreviewCanvas()` - 17 edges
7. `Scene` - 17 edges
8. `drawLayer()` - 16 edges
9. `runExport()` - 15 edges
10. `findAssets()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `getDialogueIntervals()` --calls--> `getTrackEndTime()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/core/audioUtils.ts
- `renderExportFrames()` --calls--> `renderFrame()`  [EXTRACTED]
  scripts/export/renderExportFrames.ts → src/core/frameRenderer.ts
- `validateExportProject()` --calls--> `serializeProjectFile()`  [EXTRACTED]
  scripts/export/runExport.ts → src/core/projectIO.ts
- `validateExportProject()` --calls--> `validateProjectFile()`  [EXTRACTED]
  scripts/export/runExport.ts → src/core/validateProject.ts
- `Kids Animation Studio App Shell` --conceptually_related_to--> `Kids Animation Studio`  [INFERRED]
  index.html → docs/animation-director.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (42 total, 3 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): export-cli.ts, export/**/*.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit (+11 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.06
Nodes (80): getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox(), getTransitionRenderState(), PreviewCanvas(), browserImageSource, CHARACTER_HEIGHT_FRACTION, CharacterVisualBounds (+72 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.12
Nodes (28): main(), parseArgs(), TopBar(), getProjectSlug(), ProjectLoader(), createDefaultScene(), DEFAULT_PROJECT, defaultCamera (+20 more)

### Community 3 - "runExport.ts"
Cohesion: 0.06
Nodes (61): AudioMixInput, AudioMixPlan, buildAudioMixPlan(), getDialogueIntervals(), probeAudioDuration(), Segment, attachExportApi(), cancelExportJob() (+53 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (42): ffmpeg-static, @napi-rs/canvas, oxlint, dependencies, @napi-rs/canvas, react, react-dom, devDependencies (+34 more)

### Community 5 - "properties"
Cohesion: 0.06
Nodes (37): ease-in, ease-in-out, ease-out, linear, opacity, rotation, scale, time (+29 more)

### Community 6 - "registry.ts"
Cohesion: 0.09
Nodes (34): App(), AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets() (+26 more)

### Community 7 - "project.schema.json"
Cohesion: 0.10
Nodes (19): fileVersion, scenes, settings, description, const, type, description, type (+11 more)

### Community 8 - "dialogueHelpers.ts"
Cohesion: 0.20
Nodes (10): AudioCueOptions, addSpokenLine(), DialogueCueOptions, newReactionId(), ReactionAfterOptions, resetReactionCounter(), scheduleReactionAfterDialogue(), attachForestEggDialogue() (+2 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit (+11 more)

### Community 11 - "generate-asset-registry.mjs"
Cohesion: 0.14
Nodes (21): assetsRoot, AUDIO_CATEGORIES, AUDIO_EXT, charRefHeights, DIRECTIONS, __dirname, IMAGE_EXT, inferAudioCategory() (+13 more)

### Community 12 - "compositionHelpers.ts"
Cohesion: 0.12
Nodes (15): getGroundY(), carryLayerContinuity(), clampToSafeZone(), DEFAULT_CHARACTER_SCALE, DEFAULT_PROP_SCALE, FLY_Y_OFFSET, getDefaultGroundY(), getFlyY() (+7 more)

### Community 13 - "Forest Egg — Test Script"
Cohesion: 0.07
Nodes (25): CLI export, Common errors, Export from the UI, How it works, Limitations, MP4 Export, Output location, Requirements (+17 more)

### Community 14 - "properties"
Cohesion: 0.11
Nodes (21): null, string, items, type, type, properties, type, $ref (+13 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 16 - "presets.ts"
Cohesion: 0.18
Nodes (16): DEFAULT_Y, enterFromLeft(), enterFromRight(), exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight(), idle() (+8 more)

### Community 17 - "properties"
Cohesion: 0.18
Nodes (11): listen, type, type, react, enum, afterTrackId, id, kind (+3 more)

### Community 18 - "project.ts"
Cohesion: 0.06
Nodes (65): AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel(), LayerInspector(), poseLabel(), PreviewPanel(), LayersPanel() (+57 more)

### Community 19 - "properties"
Cohesion: 0.10
Nodes (21): type, poseSegment, minimum, type, properties, type, properties, type (+13 more)

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
Cohesion: 0.08
Nodes (25): bogoLayer, computeEffectiveVolume(), computePreviewVolume(), directorFiles, durations, eggLayer, episode, episodePath (+17 more)

### Community 24 - "build-test-project.ts"
Cohesion: 0.50
Nodes (3): outDir, { project, assets, decisions }, root

### Community 25 - "Kids Animation Studio"
Cohesion: 0.50
Nodes (4): Director Helpers, Kids Animation Studio, Script-Driven Animation Workflow, Kids Animation Studio App Shell

### Community 26 - "Alpha Bounds Metadata"
Cohesion: 0.67
Nodes (3): Alpha Bounds Metadata, Smart Character Sizing, Asset Registry Generation

### Community 27 - "Pose Segments"
Cohesion: 0.67
Nodes (3): Episode 01 Forest Egg, Pose Segments, Transform Keyframes

### Community 33 - "audioUtils.ts"
Cohesion: 0.12
Nodes (24): splitTrackSegments(), AudioPreviewEngine, AudioSyncParams, ResolvedAudioAsset, computeEffectiveVolume(), computePreviewVolume(), DIALOGUE_DUCK_FACTOR, getTrackDuration() (+16 more)

### Community 34 - "index.ts"
Cohesion: 0.16
Nodes (20): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+12 more)

### Community 35 - "assetSelection.ts"
Cohesion: 0.18
Nodes (22): AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findAudio(), findBackground(), findCharacterPose(), findProp() (+14 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.21
Nodes (12): addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack(), createMusicTrack() (+4 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 40 - "required"
Cohesion: 0.18
Nodes (11): duration, fps, layers, name, version, scene, settings, required (+3 more)

### Community 41 - "enum"
Cohesion: 0.13
Nodes (15): ambience, crossfade, dialogue, fade, music, none, sfx, minimum (+7 more)

### Community 44 - "definitions"
Cohesion: 0.12
Nodes (20): assetId, endTime, id, keyframes, kind, speaker, startTime, type (+12 more)

### Community 46 - "cameraHelpers.ts"
Cohesion: 0.14
Nodes (17): frameSubjects(), cameraFollow(), CameraFollowOptions, cameraHold(), CameraHoldOptions, cameraMoveTo(), CameraMoveToOptions, cameraPan() (+9 more)

### Community 51 - "forestEggEpisode.ts"
Cohesion: 0.17
Nodes (21): AssetDecision, resetAudioCounter(), getOffscreenX(), buildForestEggEpisode(), EGG_X, finalizeScene(), ForestEggAssets, ForestEggAudioTiming (+13 more)

## Knowledge Gaps
- **328 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+323 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `required`, `properties`, `properties`, `project.schema.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Scene` connect `index.ts` to `frameRenderer.ts`, `projectIO.ts`, `runExport.ts`, `audioHelpers.ts`, `audioUtils.ts`, `dialogueHelpers.ts`, `compositionHelpers.ts`, `cameraHelpers.ts`, `project.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `getAssetByIdWithRuntime()` connect `runExport.ts` to `frameRenderer.ts`, `registry.ts`, `cameraHelpers.ts`, `project.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _328 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05948399426660296 - nodes in this community are weakly interconnected._