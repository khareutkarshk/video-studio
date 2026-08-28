# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 85 files · ~40,493 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 913 nodes · 1928 edges · 46 communities (43 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `38d5691a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- validateProject.ts
- frameRenderer.ts
- projectIO.ts
- runExport.ts
- scripts
- properties
- registry.ts
- project.schema.json
- project.ts
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- compositionHelpers.ts
- Forest Egg — Test Script
- $ref
- plugins
- projectReducer.ts
- properties
- interpolation.ts
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
- InspectorPanel.tsx
- audioMixBuilder.ts
- index.ts
- assetSelection.ts
- audioHelpers.ts
- useProjectStore
- properties
- ProjectContext.tsx
- required
- enum
- definitions
- cameraHelpers.ts
- forestEggEpisode.ts
- properties

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 31 edges
2. `useProjectStore()` - 25 edges
3. `getTransformAtTime()` - 24 edges
4. `getAssetByIdWithRuntime()` - 22 edges
5. `compilerOptions` - 18 edges
6. `runExport()` - 17 edges
7. `PreviewCanvas()` - 17 edges
8. `Scene` - 17 edges
9. `drawLayer()` - 16 edges
10. `findAssets()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `buildAudioMixPlan()` --calls--> `getAssetByIdWithRuntime()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/assets/registry.ts
- `buildAudioMixPlan()` --calls--> `getSceneStartTimes()`  [EXTRACTED]
  scripts/export/audioMixBuilder.ts → src/store/projectReducer.ts
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

## Communities (46 total, 3 thin omitted)

### Community 0 - "validateProject.ts"
Cohesion: 0.12
Nodes (29): getReferenceAlphaHeight(), computeSubjectBounds(), distanceToViewportEdge(), FrameSubjectsOptions, FrameSubjectsResult, getLandscapeSafeRect(), getLayerVisualBoundsAtTime(), getPortraitSafeRect() (+21 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.08
Nodes (56): renderExportFrames(), RenderFrameProgress, getCachedImage(), imageCache, loadImage(), getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox() (+48 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.10
Nodes (39): main(), parseArgs(), ExportDialog(), ExportDialogProps, TopBar(), getProjectSlug(), ProjectLoader(), createCustomFormat() (+31 more)

### Community 3 - "runExport.ts"
Cohesion: 0.12
Nodes (27): attachExportApi(), cancelExportJob(), ExportJob, jobs, sendJson(), startExportJob(), assertFfmpegAvailable(), checkFfmpeg() (+19 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (40): @napi-rs/canvas, oxlint, dependencies, @napi-rs/canvas, react, react-dom, devDependencies, oxlint (+32 more)

### Community 5 - "properties"
Cohesion: 0.07
Nodes (35): ease-in, ease-in-out, ease-out, linear, opacity, rotation, scale, time (+27 more)

### Community 6 - "registry.ts"
Cohesion: 0.11
Nodes (29): AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle(), getBackgroundAssets(), getVisibleProductionAssets() (+21 more)

### Community 7 - "project.schema.json"
Cohesion: 0.10
Nodes (19): fileVersion, scenes, settings, description, const, type, description, type (+11 more)

### Community 8 - "project.ts"
Cohesion: 0.18
Nodes (11): AudioCueOptions, DialogueCueOptions, newReactionId(), ReactionAfterOptions, resetReactionCounter(), scheduleReactionAfterDialogue(), CameraKeyframe, EasingType (+3 more)

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
Cohesion: 0.07
Nodes (25): CLI export, Common errors, Export from the UI, How it works, Limitations, MP4 Export, Output location, Requirements (+17 more)

### Community 14 - "$ref"
Cohesion: 0.15
Nodes (13): items, type, $ref, items, type, items, type, audioTracks (+5 more)

### Community 15 - "plugins"
Cohesion: 0.20
Nodes (9): react, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript (+1 more)

### Community 16 - "projectReducer.ts"
Cohesion: 0.15
Nodes (21): createDefaultScene(), DEFAULT_PROJECT, defaultCamera, GROUND_Y, makeLayer(), DEFAULT_OUTPUT_FORMAT, appReducer(), getActiveScene() (+13 more)

### Community 17 - "properties"
Cohesion: 0.17
Nodes (12): listen, type, minimum, type, react, enum, afterTrackId, endTime (+4 more)

### Community 18 - "interpolation.ts"
Cohesion: 0.15
Nodes (18): applyEasing(), DEFAULT_CAMERA, DEFAULT_TRANSFORM, findKeyframeAtTime(), getCameraAtTime(), getTransformAtTime(), interpolateKeyframes(), lerp() (+10 more)

### Community 19 - "properties"
Cohesion: 0.12
Nodes (17): type, poseSegment, type, properties, type, properties, type, assetId (+9 more)

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
Cohesion: 0.09
Nodes (23): bogoLayer, computeEffectiveVolume(), computePreviewVolume(), directorFiles, durations, eggLayer, episode, episodePath (+15 more)

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

### Community 32 - "InspectorPanel.tsx"
Cohesion: 0.18
Nodes (14): AUDIO_TYPES, AudioTrackInspector(), EASINGS, LayerInspector(), poseLabel(), AUDIO_TRACK_TYPES, AUDIO_TYPE_CLASS, AUDIO_TYPE_LABELS (+6 more)

### Community 33 - "audioMixBuilder.ts"
Cohesion: 0.12
Nodes (27): AudioMixInput, AudioMixPlan, buildAudioMixPlan(), getDialogueIntervals(), probeAudioDuration(), Segment, splitTrackSegments(), AudioPreviewEngine (+19 more)

### Community 34 - "index.ts"
Cohesion: 0.16
Nodes (20): CreateProjectFileOptions, addCharacter(), addLayer(), AddLayerOptions, addLayerPoseSegment(), addProp(), applyCameraPreset(), applyKeyframesToLayer() (+12 more)

### Community 35 - "assetSelection.ts"
Cohesion: 0.17
Nodes (24): AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findAudio(), findBackground(), findCharacterPose(), findProp() (+16 more)

### Community 36 - "audioHelpers.ts"
Cohesion: 0.18
Nodes (14): selectAudio(), addAmbience(), addDialogueCue(), addMusic(), addSfx(), buildTrack(), createAmbienceTrack(), createDialogueTrack() (+6 more)

### Community 37 - "useProjectStore"
Cohesion: 0.25
Nodes (12): EditorLayout(), InspectorPanel(), PreviewPanel(), LayersPanel(), SceneSettingsPanel(), ScenesPanel(), clampTime(), usePlaybackLoop() (+4 more)

### Community 38 - "properties"
Cohesion: 0.12
Nodes (17): properties, minimum, type, minimum, type, type, type, fadeIn (+9 more)

### Community 39 - "ProjectContext.tsx"
Cohesion: 0.21
Nodes (10): App(), preloadAssets(), getPresent(), ProjectContext, ProjectContextValue, ProjectProvider(), AppAction, AppState (+2 more)

### Community 40 - "required"
Cohesion: 0.18
Nodes (11): duration, fps, layers, name, version, scene, settings, required (+3 more)

### Community 41 - "enum"
Cohesion: 0.25
Nodes (8): ambience, crossfade, dialogue, fade, music, none, sfx, enum

### Community 44 - "definitions"
Cohesion: 0.11
Nodes (22): assetId, endTime, id, keyframes, kind, speaker, startTime, type (+14 more)

### Community 46 - "cameraHelpers.ts"
Cohesion: 0.15
Nodes (16): frameSubjects(), cameraFollow(), CameraFollowOptions, cameraHold(), CameraHoldOptions, cameraMoveTo(), CameraMoveToOptions, cameraPan() (+8 more)

### Community 51 - "forestEggEpisode.ts"
Cohesion: 0.14
Nodes (24): outDir, { project, assets, decisions }, root, AssetDecision, selectVoice(), getOffscreenX(), addSpokenLine(), attachForestEggDialogue() (+16 more)

### Community 52 - "properties"
Cohesion: 0.18
Nodes (12): null, string, type, minimum, type, backgroundAssetId, duration, transition (+4 more)

## Knowledge Gaps
- **312 isolated node(s):** `$schema`, `react`, `typescript`, `oxc`, `react/rules-of-hooks` (+307 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `definitions` to `required`, `properties`, `properties`, `project.schema.json`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `Scene` connect `index.ts` to `validateProject.ts`, `audioMixBuilder.ts`, `frameRenderer.ts`, `projectIO.ts`, `audioHelpers.ts`, `project.ts`, `compositionHelpers.ts`, `cameraHelpers.ts`, `projectReducer.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `properties` connect `properties` to `definitions`, `properties`, `properties`, `properties`, `name`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `react`, `typescript` to the rest of the system?**
  _312 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `validateProject.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11596638655462185 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07552447552447553 - nodes in this community are weakly interconnected._