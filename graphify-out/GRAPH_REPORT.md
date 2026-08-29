# Graph Report - kids-animation-studio  (2026-08-29)

## Corpus Check
- 97 files · ~46,645 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1041 nodes · 2167 edges · 53 communities (49 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c03fe6a8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- frameRenderer.ts
- regression-tests.ts
- Forest Egg — Test Script
- scripts
- properties
- validateProject.ts
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
- startTime
- visualBeats.ts
- project.ts
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
- properties
- MP4 Export
- enum
- required
- Kids Animation Studio
- required
- Episode Prompt Template
- forestEggEpisode.ts
- required
- definitions
- keyframes
- enum
- buildForestEggEpisode
- 8. Export

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

## Communities (53 total, 4 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): export-cli.ts, export/**/*.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit (+11 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.05
Nodes (83): getCachedImage(), imageCache, getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox(), getTransitionRenderState(), PreviewCanvas(), browserImageSource (+75 more)

### Community 2 - "regression-tests.ts"
Cohesion: 0.08
Nodes (40): main(), parseArgs(), at0, at100, at50, episodePath, episodeRaw, frameRendererSrc (+32 more)

### Community 3 - "Forest Egg — Test Script"
Cohesion: 0.18
Nodes (11): Assets used, Audio beats (M5), Build command, Camera (M7), Dialogue beats (M6), Expected audio asset queries, Expected composition, Forest Egg — Test Script (+3 more)

### Community 4 - "scripts"
Cohesion: 0.04
Nodes (44): ffmpeg-static, ffprobe-static, @napi-rs/canvas, oxlint, dependencies, @napi-rs/canvas, react, react-dom (+36 more)

### Community 5 - "properties"
Cohesion: 0.11
Nodes (20): properties, type, cameraKeyframe, properties, maximum, minimum, type, opacity (+12 more)

### Community 6 - "validateProject.ts"
Cohesion: 0.05
Nodes (71): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+63 more)

### Community 7 - "properties"
Cohesion: 0.17
Nodes (12): const, type, description, type, properties, fileVersion, outputFormatId, scenes (+4 more)

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
Cohesion: 0.10
Nodes (16): carryLayerContinuity(), clampToSafeZone(), DEFAULT_CHARACTER_SCALE, DEFAULT_PROP_SCALE, FLY_Y_OFFSET, getDefaultGroundY(), getFlyY(), getSafeZoneBounds() (+8 more)

### Community 13 - "Production Workflow"
Cohesion: 0.13
Nodes (15): 10. Shorts settings, 11. Reels settings, 12. Where exported videos are stored, 1. Where assets go, 2. Generate the asset registry, 3. Cursor creates an animation from a script, 4. Preview in the browser, 5. Give Cursor corrections (+7 more)

### Community 14 - "properties"
Cohesion: 0.12
Nodes (18): null, string, items, type, type, scene, $ref, items (+10 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 16 - "presets.ts"
Cohesion: 0.16
Nodes (18): getGroundY(), DEFAULT_Y, enterFromLeft(), enterFromRight(), exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight() (+10 more)

### Community 17 - "properties"
Cohesion: 0.18
Nodes (11): listen, type, type, react, enum, afterTrackId, id, kind (+3 more)

### Community 18 - "projectReducer.ts"
Cohesion: 0.05
Nodes (67): App(), preloadAssets(), getAssetByIdWithRuntime(), EditorLayout(), AUDIO_TYPES, AudioTrackInspector(), EASINGS, InspectorPanel() (+59 more)

### Community 19 - "startTime"
Cohesion: 0.18
Nodes (11): type, poseSegment, minimum, type, properties, type, assetId, endTime (+3 more)

### Community 20 - "visualBeats.ts"
Cohesion: 0.25
Nodes (5): BeatAction, BeatDirection, FOREST_EGG_BEATS, ScenePlan, VisualBeat

### Community 21 - "project.ts"
Cohesion: 0.27
Nodes (7): getActivePoseSegment(), PoseSegmentInput, sequencePoses(), SequencePosesOptions, Layer, PoseSegment, SceneTransition

### Community 22 - "name"
Cohesion: 0.25
Nodes (8): minimum, type, type, fps, name, version, properties, type

### Community 23 - "smoke-test.mjs"
Cohesion: 0.08
Nodes (27): bogoLayer, computeEffectiveVolume(), computePreviewVolume(), directorFiles, durations, eggLayer, episode, episodePath (+19 more)

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
Cohesion: 0.12
Nodes (25): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+17 more)

### Community 35 - "runExport.ts"
Cohesion: 0.05
Nodes (74): toUserExportError(), resolveCollisionSafeFilename(), attachExportApi(), cancelExportJob(), ExportJob, jobs, sendJson(), startExportJob() (+66 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.21
Nodes (12): addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack(), createMusicTrack() (+4 more)

### Community 37 - "Kids Animation Cinematography"
Cohesion: 0.18
Nodes (10): Agent workflow, Audio / dialogue, Camera, Character vs prop overlap, Core model, Framing checklist (16:9 and 9:16), Kids Animation Cinematography, Poses and reactions (+2 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 39 - "properties"
Cohesion: 0.20
Nodes (10): properties, type, items, type, locked, poseSegments, visible, zIndex (+2 more)

### Community 40 - "MP4 Export"
Cohesion: 0.22
Nodes (9): CLI export, Common errors, Export from the UI, How it works, Limitations, MP4 Export, Output location, Requirements (+1 more)

### Community 41 - "enum"
Cohesion: 0.13
Nodes (15): ambience, crossfade, dialogue, fade, music, none, sfx, minimum (+7 more)

### Community 42 - "required"
Cohesion: 0.28
Nodes (9): opacity, rotation, scale, time, x, y, zoom, required (+1 more)

### Community 43 - "Kids Animation Studio"
Cohesion: 0.29
Nodes (5): Director & docs, Export, Kids Animation Studio, Quick start, Scripts

### Community 44 - "required"
Cohesion: 0.18
Nodes (13): assetId, endTime, id, keyframes, kind, speaker, startTime, type (+5 more)

### Community 45 - "Episode Prompt Template"
Cohesion: 0.33
Nodes (4): Episode Prompt Template, Minimal example (filled), Prompt (copy from here), What you must fill vs agent owns

### Community 46 - "forestEggEpisode.ts"
Cohesion: 0.11
Nodes (24): frameSubjects(), cameraFollow(), CameraFollowOptions, cameraHold(), CameraHoldOptions, cameraMoveTo(), CameraMoveToOptions, cameraPan() (+16 more)

### Community 47 - "required"
Cohesion: 0.29
Nodes (7): duration, fps, layers, name, version, required, required

### Community 48 - "definitions"
Cohesion: 0.22
Nodes (9): type, definitions, audioTrack, keyframe, layer, reactionCue, type, type (+1 more)

### Community 49 - "keyframes"
Cohesion: 0.33
Nodes (6): properties, type, items, type, camera, keyframes

### Community 50 - "enum"
Cohesion: 0.33
Nodes (6): ease-in, ease-in-out, ease-out, linear, enum, easing

### Community 51 - "buildForestEggEpisode"
Cohesion: 0.19
Nodes (15): outDir, { project, assets, decisions }, root, resetAudioCounter(), buildForestEggEpisode(), finalizeScene(), clamp(), estimateDialogueDuration() (+7 more)

### Community 52 - "8. Export"
Cohesion: 0.67
Nodes (3): 8. Export, From the CLI, From the UI

## Knowledge Gaps
- **383 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+378 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `project.schema.json`, `startTime`, `properties`, `properties`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `AudioPreviewEngine` connect `audioMixBuilder.ts` to `projectReducer.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `enum`, `definitions`, `properties`, `startTime`, `name`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _383 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05433848797250859 - nodes in this community are weakly interconnected._