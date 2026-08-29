# Graph Report - kids-animation-studio  (2026-08-29)

## Corpus Check
- 96 files · ~45,301 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1030 nodes · 2154 edges · 48 communities (44 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `404d68f7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- frameRenderer.ts
- regression-tests.ts
- assetSelection.ts
- scripts
- properties
- registry.ts
- properties
- project.ts
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- compositionHelpers.ts
- Production Workflow
- properties
- plugins
- presets.ts
- properties
- projectReducer.ts
- properties
- visualBeats.ts
- validateProject.ts
- name
- smoke-test.mjs
- project.schema.json
- Kids Animation Studio
- Alpha Bounds Metadata
- Pose Segments
- tsconfig.json
- Logical Composition Space
- Local Untracked Assets
- validate-project.mjs
- audioMixBuilder.ts
- index.ts
- runExport.ts
- audioHelpers.ts
- Kids Animation Cinematography
- properties
- build-test-project.ts
- enum
- required
- required
- cameraHelpers.ts
- required
- definitions
- keyframes
- forestEggEpisode.ts

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 31 edges
2. `useProjectStore()` - 25 edges
3. `getTransformAtTime()` - 24 edges
4. `runExport()` - 23 edges
5. `getAssetByIdWithRuntime()` - 22 edges
6. `compilerOptions` - 18 edges
7. `PreviewCanvas()` - 17 edges
8. `drawLayer()` - 17 edges
9. `Scene` - 17 edges
10. `Production Workflow` - 16 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `defaultExportFilename()`  [EXTRACTED]
  scripts/export-cli.ts → src/export/exportNaming.ts
- `buildAudioMixPlan()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/assets/registry.ts
- `buildAudioMixPlan()` --calls--> `getSceneStartTimes()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/store/projectReducer.ts
- `attachExportApi()` --calls--> `findOutputPreset()`  [EXTRACTED]
  scripts/export/exportServer.ts → src/constants/outputPresets.ts
- `collectProjectImageUrls()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/projectAssets.ts → src/assets/registry.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (48 total, 4 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): export-cli.ts, export/**/*.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit (+11 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.07
Nodes (64): getCachedImage(), imageCache, loadImage(), getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox(), getTransitionRenderState(), PreviewCanvas() (+56 more)

### Community 2 - "regression-tests.ts"
Cohesion: 0.06
Nodes (46): main(), parseArgs(), at0, at100, at50, episodePath, episodeRaw, frameRendererSrc (+38 more)

### Community 3 - "assetSelection.ts"
Cohesion: 0.16
Nodes (25): AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findAudio(), findBackground(), findCharacterPose(), findProp() (+17 more)

### Community 4 - "scripts"
Cohesion: 0.04
Nodes (44): ffmpeg-static, ffprobe-static, @napi-rs/canvas, oxlint, dependencies, @napi-rs/canvas, react, react-dom (+36 more)

### Community 5 - "properties"
Cohesion: 0.09
Nodes (24): ease-in, ease-in-out, ease-out, linear, properties, enum, properties, maximum (+16 more)

### Community 6 - "registry.ts"
Cohesion: 0.11
Nodes (29): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+21 more)

### Community 7 - "properties"
Cohesion: 0.15
Nodes (13): const, type, description, type, properties, fileVersion, outputFormatId, scenes (+5 more)

### Community 8 - "project.ts"
Cohesion: 0.19
Nodes (11): AudioCueOptions, DialogueCueOptions, newReactionId(), ReactionAfterOptions, resetReactionCounter(), scheduleReactionAfterDialogue(), Layer, ReactionCue (+3 more)

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

### Community 13 - "Production Workflow"
Cohesion: 0.04
Nodes (43): CLI export, Common errors, Export from the UI, How it works, Limitations, MP4 Export, Output location, Requirements (+35 more)

### Community 14 - "properties"
Cohesion: 0.10
Nodes (21): null, string, items, type, type, $ref, items, items (+13 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 16 - "presets.ts"
Cohesion: 0.18
Nodes (16): DEFAULT_Y, enterFromLeft(), exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight(), idle(), MovementPresetOptions (+8 more)

### Community 17 - "properties"
Cohesion: 0.18
Nodes (11): listen, type, type, react, enum, afterTrackId, id, kind (+3 more)

### Community 18 - "projectReducer.ts"
Cohesion: 0.05
Nodes (74): App(), preloadAssets(), getAssetByIdWithRuntime(), EditorLayout(), AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel() (+66 more)

### Community 19 - "properties"
Cohesion: 0.12
Nodes (18): type, poseSegment, minimum, type, properties, type, properties, type (+10 more)

### Community 20 - "visualBeats.ts"
Cohesion: 0.25
Nodes (5): BeatAction, BeatDirection, FOREST_EGG_BEATS, ScenePlan, VisualBeat

### Community 21 - "validateProject.ts"
Cohesion: 0.13
Nodes (26): computeSubjectBounds(), distanceToViewportEdge(), FrameSubjectsOptions, FrameSubjectsResult, getLandscapeSafeRect(), getLayerVisualBoundsAtTime(), getPortraitSafeRect(), getVisibleLogicalRect() (+18 more)

### Community 22 - "name"
Cohesion: 0.25
Nodes (8): minimum, type, type, fps, name, version, properties, type

### Community 23 - "smoke-test.mjs"
Cohesion: 0.08
Nodes (26): bogoLayer, computeEffectiveVolume(), computePreviewVolume(), directorFiles, durations, eggLayer, episode, episodePath (+18 more)

### Community 24 - "project.schema.json"
Cohesion: 0.22
Nodes (8): fileVersion, scenes, settings, description, required, $schema, title, type

### Community 25 - "Kids Animation Studio"
Cohesion: 0.50
Nodes (4): Director Helpers, Kids Animation Studio, Script-Driven Animation Workflow, Kids Animation Studio App Shell

### Community 26 - "Alpha Bounds Metadata"
Cohesion: 0.67
Nodes (3): Alpha Bounds Metadata, Smart Character Sizing, Asset Registry Generation

### Community 27 - "Pose Segments"
Cohesion: 0.67
Nodes (3): Episode 01 Forest Egg, Pose Segments, Transform Keyframes

### Community 33 - "audioMixBuilder.ts"
Cohesion: 0.15
Nodes (20): AudioMixInput, AudioMixPlan, buildAudioMixPlan(), getDialogueIntervals(), probeAudioDuration(), Segment, splitTrackSegments(), AudioPreviewEngine (+12 more)

### Community 34 - "index.ts"
Cohesion: 0.16
Nodes (19): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+11 more)

### Community 35 - "runExport.ts"
Cohesion: 0.05
Nodes (76): toUserExportError(), resolveCollisionSafeFilename(), attachExportApi(), cancelExportJob(), ExportJob, jobs, sendJson(), startExportJob() (+68 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.18
Nodes (14): selectAudio(), addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack() (+6 more)

### Community 37 - "Kids Animation Cinematography"
Cohesion: 0.20
Nodes (9): Agent workflow, Audio / dialogue, Camera, Core model, Framing checklist (16:9 and 9:16), Kids Animation Cinematography, Poses and reactions, Project touchpoints (+1 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 39 - "build-test-project.ts"
Cohesion: 0.50
Nodes (3): outDir, { project, assets, decisions }, root

### Community 41 - "enum"
Cohesion: 0.15
Nodes (13): ambience, crossfade, dialogue, fade, music, none, sfx, minimum (+5 more)

### Community 42 - "required"
Cohesion: 0.22
Nodes (11): opacity, rotation, scale, time, x, y, zoom, required (+3 more)

### Community 44 - "required"
Cohesion: 0.18
Nodes (13): assetId, endTime, id, keyframes, kind, speaker, startTime, type (+5 more)

### Community 46 - "cameraHelpers.ts"
Cohesion: 0.13
Nodes (18): frameSubjects(), cameraFollow(), CameraFollowOptions, cameraHold(), CameraHoldOptions, cameraMoveTo(), CameraMoveToOptions, cameraPan() (+10 more)

### Community 47 - "required"
Cohesion: 0.22
Nodes (9): duration, fps, layers, name, version, scene, required, type (+1 more)

### Community 48 - "definitions"
Cohesion: 0.22
Nodes (9): type, definitions, audioTrack, keyframe, layer, reactionCue, type, type (+1 more)

### Community 49 - "keyframes"
Cohesion: 0.40
Nodes (5): properties, type, type, camera, keyframes

### Community 51 - "forestEggEpisode.ts"
Cohesion: 0.16
Nodes (23): AssetDecision, selectVoice(), getOffscreenX(), addSpokenLine(), attachForestEggDialogue(), buildForestEggEpisode(), EGG_X, finalizeScene() (+15 more)

## Knowledge Gaps
- **377 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+372 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `project.schema.json`, `required`, `properties`, `required`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `AudioPreviewEngine` connect `audioMixBuilder.ts` to `projectReducer.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `getAssetByIdWithRuntime()` connect `projectReducer.ts` to `audioMixBuilder.ts`, `frameRenderer.ts`, `runExport.ts`, `registry.ts`, `cameraHelpers.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _377 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0684931506849315 - nodes in this community are weakly interconnected._