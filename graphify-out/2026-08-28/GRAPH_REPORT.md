# Graph Report - kids-animation-studio  (2026-08-28)

## Corpus Check
- 66 files · ~27,082 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 647 nodes · 1284 edges · 33 communities (30 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.83)
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
- forestEggEpisode.ts
- properties
- required
- compilerOptions
- compilerOptions
- generate-asset-registry.mjs
- presets.ts
- Forest Egg — Test Script
- $ref
- plugins
- layer
- duration
- properties
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

## God Nodes (most connected - your core abstractions)
1. `buildForestEggEpisode()` - 23 edges
2. `useProjectStore()` - 23 edges
3. `getTransformAtTime()` - 18 edges
4. `compilerOptions` - 18 edges
5. `getAssetByIdWithRuntime()` - 15 edges
6. `PreviewCanvas()` - 15 edges
7. `compilerOptions` - 15 edges
8. `drawLayer()` - 13 edges
9. `appReducer()` - 12 edges
10. `AssetMeta` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Kids Animation Studio App Shell` --conceptually_related_to--> `Kids Animation Studio`  [INFERRED]
  index.html → docs/animation-director.md
- `Asset Registry Generation` --conceptually_related_to--> `Alpha Bounds Metadata`  [INFERRED]
  public/assets/README.md → docs/animation-director.md
- `drawSelectionBox()` --indirect_call--> `getAssetByIdWithRuntime()`  [INFERRED]
  src/components/preview/PreviewCanvas.tsx → src/assets/registry.ts
- `PreviewCanvas()` --indirect_call--> `getAssetByIdWithRuntime()`  [INFERRED]
  src/components/preview/PreviewCanvas.tsx → src/assets/registry.ts
- `AssetGroup()` --calls--> `formatAssetDisplayName()`  [EXTRACTED]
  src/components/panels/AssetsPanel.tsx → src/assets/assetBrowser.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Script to Preview Pipeline** — docs_animation_director_script_driven_workflow, docs_animation_director_director_helpers, docs_animation_director_episode_01 [EXTRACTED 1.00]

## Communities (33 total, 3 thin omitted)

### Community 0 - "projectReducer.ts"
Cohesion: 0.06
Nodes (63): getAssetByIdWithRuntime(), EASINGS, InspectorPanel(), LayerInspector(), poseLabel(), PreviewPanel(), LayersPanel(), SceneSettingsPanel() (+55 more)

### Community 1 - "frameRenderer.ts"
Cohesion: 0.11
Nodes (45): getCachedImage(), getCharacterReferenceHeightsFromRegistry(), DragState, drawSelectionBox(), PreviewCanvas(), CHARACTER_HEIGHT_FRACTION, CharacterVisualBounds, computeAutoFitScale() (+37 more)

### Community 2 - "projectIO.ts"
Cohesion: 0.09
Nodes (39): TopBar(), getProjectSlug(), ProjectLoader(), createDefaultScene(), DEFAULT_PROJECT, defaultCamera, GROUND_Y, makeLayer() (+31 more)

### Community 3 - "registry.ts"
Cohesion: 0.09
Nodes (34): react, App(), AssetBrowserGroup, buildAssetBrowserGroups(), CHARACTER_ORDER, countVisibleAssets(), formatAssetDisplayName(), formatCategoryTitle() (+26 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (41): @ffmpeg/ffmpeg, @ffmpeg/util, oxlint, dependencies, @ffmpeg/ffmpeg, @ffmpeg/util, react, react-dom (+33 more)

### Community 5 - "properties"
Cohesion: 0.05
Nodes (46): ease-in, ease-in-out, ease-out, fileVersion, linear, opacity, rotation, scale (+38 more)

### Community 6 - "forestEggEpisode.ts"
Cohesion: 0.05
Nodes (75): outDir, { project, assets, decisions }, root, AssetCatalogSummary, AssetQuery, findAsset(), findAssets(), findBackground() (+67 more)

### Community 7 - "properties"
Cohesion: 0.20
Nodes (10): const, type, description, type, properties, fileVersion, outputFormatId, scenes (+2 more)

### Community 8 - "required"
Cohesion: 0.18
Nodes (11): duration, fps, layers, name, version, scene, settings, required (+3 more)

### Community 9 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 11 - "generate-asset-registry.mjs"
Cohesion: 0.19
Nodes (17): assetsRoot, AUDIO_EXT, charRefHeights, DIRECTIONS, __dirname, IMAGE_EXT, inferCategory(), inferType() (+9 more)

### Community 12 - "presets.ts"
Cohesion: 0.12
Nodes (18): getActivePoseSegment(), PoseSegmentInput, SequencePosesOptions, DEFAULT_Y, exitLeft(), exitRight(), flyAcrossScene(), flyAtHeight() (+10 more)

### Community 13 - "Forest Egg — Test Script"
Cohesion: 0.25
Nodes (7): Assets used, Build command, Expected composition, Forest Egg — Test Script, Scene grouping, Script, Visual beats

### Community 14 - "$ref"
Cohesion: 0.25
Nodes (8): $ref, items, type, items, type, layers, poseSegments, items

### Community 15 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 16 - "layer"
Cohesion: 0.22
Nodes (9): assetId, endTime, id, keyframes, startTime, layer, required, type (+1 more)

### Community 17 - "duration"
Cohesion: 0.18
Nodes (11): crossfade, fade, none, minimum, type, duration, transition, type (+3 more)

### Community 18 - "properties"
Cohesion: 0.22
Nodes (9): null, string, type, type, type, audioTracks, backgroundAssetId, id (+1 more)

### Community 19 - "properties"
Cohesion: 0.14
Nodes (16): type, poseSegment, type, properties, type, properties, type, assetId (+8 more)

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
Cohesion: 0.17
Nodes (10): bogoLayer, directorFiles, durations, eggLayer, episode, episodePath, registryPath, root (+2 more)

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

## Knowledge Gaps
- **230 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+225 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `properties` to `layer`, `required`, `properties`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `react` connect `registry.ts` to `projectReducer.ts`, `frameRenderer.ts`, `projectIO.ts`, `plugins`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `AssetMeta` connect `frameRenderer.ts` to `projectIO.ts`, `registry.ts`, `forestEggEpisode.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAssetByIdWithRuntime()` (e.g. with `drawSelectionBox()` and `PreviewCanvas()`) actually correct?**
  _`getAssetByIdWithRuntime()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _230 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `projectReducer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06288568909785483 - nodes in this community are weakly interconnected._
- **Should `frameRenderer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10980392156862745 - nodes in this community are weakly interconnected._