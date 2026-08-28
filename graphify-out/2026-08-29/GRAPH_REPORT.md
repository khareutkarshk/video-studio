# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 94 files · ~43,536 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 993 nodes · 2096 edges · 41 communities (37 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc4310a4`
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
- properties
- dialogueHelpers.ts
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
- audioHelpers.ts
- properties
- enum
- definitions
- cameraHelpers.ts
- forestEggEpisode.ts

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 31 edges
2. `useProjectStore()` - 25 edges
3. `getTransformAtTime()` - 24 edges
4. `runExport()` - 23 edges
5. `getAssetByIdWithRuntime()` - 22 edges
6. `compilerOptions` - 18 edges
7. `PreviewCanvas()` - 17 edges
8. `Scene` - 17 edges
9. `drawLayer()` - 16 edges
10. `Production Workflow` - 16 edges

## Surprising Connections (you probably didn't know these)
- `buildAudioMixPlan()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/assets/registry.ts
- `buildAudioMixPlan()` --calls--> `getSceneStartTimes()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/store/projectReducer.ts
- `attachExportApi()` --calls--> `findOutputPreset()`  [EXTRACTED]
  scripts/export/exportServer.ts → src/constants/outputPresets.ts
- `collectProjectImageUrls()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/projectAssets.ts → src/assets/registry.ts
- `collectProjectAudioPaths()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/projectAssets.ts → src/assets/registry.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (41 total, 4 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): export-cli.ts, export/**/*.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit (+11 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.06
Nodes (60): App(), getCachedImage(), imageCache, loadImage(), preloadAssets(), getCharacterReferenceHeightsFromRegistry(), PreviewPanel(), DragState (+52 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.07
Nodes (50): main(), parseArgs(), absPath, { errors, warnings }, { file, project }, raw, root, ExportDialog() (+42 more)

### Community 3 - "runExport.ts"
Cohesion: 0.07
Nodes (53): toUserExportError(), resolveCollisionSafeFilename(), attachExportApi(), cancelExportJob(), ExportJob, jobs, sendJson(), startExportJob() (+45 more)

### Community 4 - "scripts"
Cohesion: 0.04
Nodes (44): ffmpeg-static, ffprobe-static, @napi-rs/canvas, oxlint, dependencies, @napi-rs/canvas, react, react-dom (+36 more)

### Community 5 - "properties"
Cohesion: 0.07
Nodes (35): ease-in, ease-in-out, ease-out, linear, opacity, rotation, scale, time (+27 more)

### Community 6 - "registry.ts"
Cohesion: 0.08
Nodes (48): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+40 more)

### Community 7 - "properties"
Cohesion: 0.18
Nodes (11): const, type, description, type, properties, fileVersion, outputFormatId, scenes (+3 more)

### Community 8 - "dialogueHelpers.ts"
Cohesion: 0.16
Nodes (12): selectVoice(), AudioCueOptions, addSpokenLine(), DialogueCueOptions, newReactionId(), ReactionAfterOptions, resetReactionCounter(), scheduleReactionAfterDialogue() (+4 more)

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
Cohesion: 0.11
Nodes (21): null, string, items, type, type, properties, type, $ref (+13 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 16 - "presets.ts"
Cohesion: 0.18
Nodes (15): DEFAULT_Y, enterFromLeft(), exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight(), idle(), MovementPresetOptions (+7 more)

### Community 17 - "properties"
Cohesion: 0.17
Nodes (12): type, properties, type, items, type, id, locked, poseSegments (+4 more)

### Community 18 - "projectReducer.ts"
Cohesion: 0.05
Nodes (74): getAssetByIdWithRuntime(), EditorLayout(), AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel(), LayerInspector(), poseLabel() (+66 more)

### Community 19 - "properties"
Cohesion: 0.11
Nodes (20): listen, type, type, poseSegment, minimum, type, react, enum (+12 more)

### Community 20 - "visualBeats.ts"
Cohesion: 0.25
Nodes (5): BeatAction, BeatDirection, FOREST_EGG_BEATS, ScenePlan, VisualBeat

### Community 21 - "validateProject.ts"
Cohesion: 0.18
Nodes (22): computeSubjectBounds(), distanceToViewportEdge(), FrameSubjectsOptions, FrameSubjectsResult, getLandscapeSafeRect(), getLayerVisualBoundsAtTime(), getPortraitSafeRect(), getVisibleLogicalRect() (+14 more)

### Community 22 - "name"
Cohesion: 0.14
Nodes (14): fps, name, version, minimum, type, type, fps, name (+6 more)

### Community 23 - "smoke-test.mjs"
Cohesion: 0.08
Nodes (25): bogoLayer, computeEffectiveVolume(), computePreviewVolume(), directorFiles, durations, eggLayer, episode, episodePath (+17 more)

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
Cohesion: 0.12
Nodes (26): AudioMixInput, AudioMixPlan, buildAudioMixPlan(), getDialogueIntervals(), probeAudioDuration(), Segment, splitTrackSegments(), AudioPreviewEngine (+18 more)

### Community 34 - "index.ts"
Cohesion: 0.15
Nodes (20): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+12 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.18
Nodes (14): selectAudio(), addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack() (+6 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 41 - "enum"
Cohesion: 0.13
Nodes (15): ambience, crossfade, dialogue, fade, music, none, sfx, minimum (+7 more)

### Community 44 - "definitions"
Cohesion: 0.09
Nodes (27): assetId, duration, endTime, id, keyframes, kind, layers, speaker (+19 more)

### Community 46 - "cameraHelpers.ts"
Cohesion: 0.14
Nodes (17): frameSubjects(), cameraFollow(), CameraFollowOptions, cameraHold(), CameraHoldOptions, cameraMoveTo(), CameraMoveToOptions, cameraPan() (+9 more)

### Community 51 - "forestEggEpisode.ts"
Cohesion: 0.13
Nodes (29): outDir, { project, assets, decisions }, root, requireAsset(), selectBackground(), selectCharacterPose(), selectProp(), selectSurprisedPose() (+21 more)

## Knowledge Gaps
- **350 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+345 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `project.schema.json`, `properties`, `properties`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Scene` connect `dialogueHelpers.ts` to `audioMixBuilder.ts`, `frameRenderer.ts`, `index.ts`, `audioHelpers.ts`, `projectIO.ts`, `compositionHelpers.ts`, `cameraHelpers.ts`, `projectReducer.ts`, `forestEggEpisode.ts`, `validateProject.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `getAssetByIdWithRuntime()` connect `projectReducer.ts` to `audioMixBuilder.ts`, `frameRenderer.ts`, `runExport.ts`, `registry.ts`, `cameraHelpers.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _350 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0645045045045045 - nodes in this community are weakly interconnected._