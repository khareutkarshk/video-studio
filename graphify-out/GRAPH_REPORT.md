# Graph Report - kids-animation-studio  (2026-08-29)

## Corpus Check
- 95 files · ~44,253 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1013 nodes · 2126 edges · 51 communities (47 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09af2761`
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
- ExportDialog.tsx
- audioHelpers.ts
- regression-tests.ts
- properties
- verifyOutput.ts
- export-cli.ts
- enum
- required
- exportServer.ts
- required
- ffmpegCheck.ts
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
8. `Scene` - 17 edges
9. `drawLayer()` - 16 edges
10. `Production Workflow` - 16 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `findOutputPreset()`  [EXTRACTED]
  scripts/export-cli.ts → src/constants/outputPresets.ts
- `main()` --calls--> `deserializeProjectFile()`  [EXTRACTED]
  scripts/export-cli.ts → src/core/projectIO.ts
- `buildAudioMixPlan()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/assets/registry.ts
- `attachExportApi()` --calls--> `findOutputPreset()`  [EXTRACTED]
  scripts/export/exportServer.ts → src/constants/outputPresets.ts
- `collectProjectImageUrls()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/projectAssets.ts → src/assets/registry.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (51 total, 4 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): export-cli.ts, export/**/*.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit (+11 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.06
Nodes (69): renderExportFrames(), RenderFrameProgress, getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox(), getTransitionRenderState(), PreviewCanvas(), CHARACTER_HEIGHT_FRACTION (+61 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.18
Nodes (20): absPath, { errors, warnings }, { file, project }, raw, root, TopBar(), getProjectSlug(), ProjectLoader() (+12 more)

### Community 3 - "runExport.ts"
Cohesion: 0.21
Nodes (14): resolveCollisionSafeFilename(), cache, clearNodeImageCache(), createNodeImageSource(), preloadNodeImages(), checkDiskSpace(), estimateExportBytes(), resolveExportsDir() (+6 more)

### Community 4 - "scripts"
Cohesion: 0.04
Nodes (44): ffmpeg-static, ffprobe-static, @napi-rs/canvas, oxlint, dependencies, @napi-rs/canvas, react, react-dom (+36 more)

### Community 5 - "properties"
Cohesion: 0.09
Nodes (24): ease-in, ease-in-out, ease-out, linear, properties, enum, properties, maximum (+16 more)

### Community 6 - "registry.ts"
Cohesion: 0.06
Nodes (54): App(), AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets() (+46 more)

### Community 7 - "properties"
Cohesion: 0.15
Nodes (13): const, type, description, type, properties, fileVersion, outputFormatId, scenes (+5 more)

### Community 8 - "project.ts"
Cohesion: 0.10
Nodes (22): DEFAULT_PROJECT, defaultCamera, GROUND_Y, getActivePoseSegment(), AudioCueOptions, DialogueCueOptions, newReactionId(), ReactionAfterOptions (+14 more)

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
Cohesion: 0.13
Nodes (14): getGroundY(), clampToSafeZone(), DEFAULT_CHARACTER_SCALE, DEFAULT_PROP_SCALE, FLY_Y_OFFSET, getDefaultGroundY(), getFlyY(), getSafeZoneBounds() (+6 more)

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
Nodes (16): DEFAULT_Y, enterFromLeft(), enterFromRight(), exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight(), idle() (+8 more)

### Community 17 - "properties"
Cohesion: 0.18
Nodes (11): listen, type, type, react, enum, afterTrackId, id, kind (+3 more)

### Community 18 - "projectReducer.ts"
Cohesion: 0.06
Nodes (61): getAssetByIdWithRuntime(), EditorLayout(), AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel(), LayerInspector(), poseLabel() (+53 more)

### Community 19 - "properties"
Cohesion: 0.12
Nodes (18): type, poseSegment, minimum, type, properties, type, properties, type (+10 more)

### Community 20 - "visualBeats.ts"
Cohesion: 0.25
Nodes (5): BeatAction, BeatDirection, FOREST_EGG_BEATS, ScenePlan, VisualBeat

### Community 21 - "validateProject.ts"
Cohesion: 0.17
Nodes (21): computeSubjectBounds(), distanceToViewportEdge(), FrameSubjectsOptions, FrameSubjectsResult, getLandscapeSafeRect(), getPortraitSafeRect(), getVisibleLogicalRect(), isRectInsideViewport() (+13 more)

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
Nodes (21): AudioMixInput, AudioMixPlan, buildAudioMixPlan(), getDialogueIntervals(), probeAudioDuration(), Segment, splitTrackSegments(), AudioPreviewEngine (+13 more)

### Community 34 - "index.ts"
Cohesion: 0.15
Nodes (20): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+12 more)

### Community 35 - "ExportDialog.tsx"
Cohesion: 0.19
Nodes (19): ExportDialog(), ExportDialogProps, ValidationIssue, cancelExport(), checkFfmpegStatus(), getExportStatus(), parseJson(), startExport() (+11 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.24
Nodes (10): addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack(), createMusicTrack() (+2 more)

### Community 37 - "regression-tests.ts"
Cohesion: 0.11
Nodes (17): at0, at100, at50, episodePath, episodeRaw, mixPlan, { project: episodeProject }, { project: restored } (+9 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 39 - "verifyOutput.ts"
Cohesion: 0.23
Nodes (13): collectProjectAudioPaths(), collectProjectImageUrls(), findMissingAudioAssets(), findMissingImageAssets(), resolvePublicAssetPath(), validateExportProject(), FfprobeResult, FfprobeStream (+5 more)

### Community 40 - "export-cli.ts"
Cohesion: 0.23
Nodes (11): main(), parseArgs(), DEFAULT_EXPORT_QUALITY_ID, EXPORT_QUALITY_PRESETS, ExportQualityPreset, findExportQuality(), isValidExportQualityId(), defaultExportFilename() (+3 more)

### Community 41 - "enum"
Cohesion: 0.15
Nodes (13): ambience, crossfade, dialogue, fade, music, none, sfx, minimum (+5 more)

### Community 42 - "required"
Cohesion: 0.22
Nodes (11): opacity, rotation, scale, time, x, y, zoom, required (+3 more)

### Community 43 - "exportServer.ts"
Cohesion: 0.29
Nodes (7): toUserExportError(), attachExportApi(), cancelExportJob(), ExportJob, jobs, sendJson(), startExportJob()

### Community 44 - "required"
Cohesion: 0.18
Nodes (13): assetId, endTime, id, keyframes, kind, speaker, startTime, type (+5 more)

### Community 45 - "ffmpegCheck.ts"
Cohesion: 0.38
Nodes (9): assertFfmpegAvailable(), checkFfmpeg(), ffmpegStaticPath(), FfmpegStatus, ffprobeStaticPath(), probeBinary(), require, resolveFfmpegPath() (+1 more)

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
Cohesion: 0.10
Nodes (36): outDir, { project, assets, decisions }, root, requireAsset(), selectAudio(), selectBackground(), selectCharacterPose(), selectProp() (+28 more)

## Knowledge Gaps
- **367 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+362 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `project.schema.json`, `required`, `properties`, `required`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `AudioPreviewEngine` connect `audioMixBuilder.ts` to `projectReducer.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `getAssetByIdWithRuntime()` connect `projectReducer.ts` to `audioMixBuilder.ts`, `frameRenderer.ts`, `registry.ts`, `verifyOutput.ts`, `cameraHelpers.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _367 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06388888888888888 - nodes in this community are weakly interconnected._