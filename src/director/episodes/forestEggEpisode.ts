import type { ProjectFile } from '../../types/projectFile';
import { PROJECT_DATA_VERSION, PROJECT_FILE_VERSION } from '../../types/projectFile';
import type { Layer, Scene } from '../../types/project';
import { createScene, addCharacter, addProp, resetLayerCounter, applyCameraPreset } from '../sceneHelpers';
import { walkAcrossScene, enterFromRight, stop } from '../presets';
import { sequencePoses } from '../poseHelpers';
import {
  cameraFollow,
  cameraHold,
  cameraMoveTo,
  cameraPan,
  cameraZoom,
  mergeCameraKeyframes,
} from '../cameraHelpers';
import { getAssetByIdWithRuntime, getCharacterReferenceHeightsFromRegistry } from '../../assets/registry';
import {
  computeSubjectBounds,
  frameSubjects,
  LANDSCAPE_OUTPUT,
} from '../../core/compositionFraming';
import {
  requireAsset,
  selectAudio,
  selectBackground,
  selectCharacterPose,
  selectProp,
  selectSurprisedPose,
  selectVoice,
  type AssetDecision,
} from '../assetSelection';
import { addAmbience, addSfx, resetAudioCounter } from '../audioHelpers';
import { addSpokenLine, resetReactionCounter, scheduleReactionAfterDialogue } from '../dialogueHelpers';
import {
  DEFAULT_CHARACTER_SCALE,
  DEFAULT_PROP_SCALE,
  carryLayerContinuity,
  getDefaultGroundY,
  getOffscreenX,
  placePropRelativeToCharacter,
} from '../compositionHelpers';
import {
  estimateDialogueDuration,
  estimateHoldDuration,
  estimatePauseDuration,
  estimateReactionDuration,
  estimateWalkDuration,
  roundTime,
  sceneDurationFromLayers,
} from '../timing';

export type ForestEggAssets = {
  bgForestMain: string;
  bgForestClearing: string;
  bogoWalkRight: string;
  bogoNeutral: string;
  bogoPointRight: string;
  bogoSurprised: string;
  pogoWalkLeft: string;
  pogoNeutral: string;
  giantEgg: string;
};

export type ForestEggBuildResult = {
  project: ProjectFile;
  assets: ForestEggAssets;
  decisions: AssetDecision[];
};

/** Wide giant-egg prop needs extra anchor gap so sprites do not overlap visually. */
const GIANT_EGG_GAP = 380;
const BOGO_TARGET_X = -280;
const EGG_X = placePropRelativeToCharacter({
  characterX: BOGO_TARGET_X,
  direction: 'right',
  gap: GIANT_EGG_GAP,
});
const POGO_TARGET_X = 120;

export function resolveForestEggAssets(): ForestEggAssets {
  const bgMain = requireAsset(selectBackground({ nameContains: 'FOREST_MAIN' }), 'bgForestMain');
  const bgClearing = requireAsset(selectBackground({ nameContains: 'FOREST_CLEARING' }), 'bgForestClearing');
  const bogoWalk = requireAsset(selectCharacterPose({ character: 'BOGO', action: 'walk', direction: 'right' }), 'bogoWalk');
  const bogoNeutral = requireAsset(selectCharacterPose({ character: 'BOGO', action: 'idle', direction: 'right' }), 'bogoNeutral');
  const bogoPoint = requireAsset(selectCharacterPose({ character: 'BOGO', action: 'point', direction: 'right' }), 'bogoPoint');
  const bogoSurprised = requireAsset(selectSurprisedPose('BOGO', 'right'), 'bogoSurprised');
  const pogoWalk = requireAsset(selectCharacterPose({ character: 'POGO', action: 'walk', direction: 'left' }), 'pogoWalk');
  const pogoNeutral = requireAsset(selectCharacterPose({ character: 'POGO', action: 'idle', direction: 'right' }), 'pogoNeutral');
  const egg = requireAsset(selectProp({ nameContains: 'GIANT_EGG' }), 'giantEgg');

  return {
    bgForestMain: bgMain.id,
    bgForestClearing: bgClearing.id,
    bogoWalkRight: bogoWalk.id,
    bogoNeutral: bogoNeutral.id,
    bogoPointRight: bogoPoint.id,
    bogoSurprised: bogoSurprised.id,
    pogoWalkLeft: pogoWalk.id,
    pogoNeutral: pogoNeutral.id,
    giantEgg: egg.id,
  };
}

function finalizeScene(scene: Scene, duration?: number): Scene {
  const computed = duration ?? sceneDurationFromLayers(scene.layers);
  return {
    ...scene,
    duration: computed,
    layers: scene.layers.map((l) => ({ ...l, endTime: computed })),
  };
}

function tryOptionalAudio(decisions: AssetDecision[], selector: () => AssetDecision): string | undefined {
  const decision = selector();
  decisions.push(decision);
  if (!decision.asset) {
    console.warn(`[director] audio skipped: ${decision.reason ?? 'asset missing'}`);
    return undefined;
  }
  if (decision.decision === 'fallback') {
    console.warn(`[director] audio: ${decision.reason}`);
  }
  return decision.asset.id;
}

export type ForestEggAudioTiming = {
  walkDuration: number;
  scene1Duration: number;
  scene2Duration: number;
  neutralTime: number;
  pointEnd: number;
  scene3Duration: number;
  pogoWalkDuration: number;
  scene4Duration: number;
};

export function attachForestEggAudio(
  scenes: [Scene, Scene, Scene, Scene],
  timing: ForestEggAudioTiming,
  decisions: AssetDecision[],
): [Scene, Scene, Scene, Scene] {
  let [scene1, scene2, scene3, scene4] = scenes;

  const forestAmb = tryOptionalAudio(decisions, () =>
    selectAudio({ audioCategory: 'ambience', nameContains: 'forest' }),
  );
  const footsteps = tryOptionalAudio(decisions, () =>
    selectAudio({ audioCategory: 'sfx', nameContains: 'footstep' }),
  );
  const reaction = tryOptionalAudio(decisions, () =>
    selectAudio({ audioCategory: 'sfx', nameContains: 'reaction' }),
  );
  const pointSfx = tryOptionalAudio(decisions, () =>
    selectAudio({ audioCategory: 'sfx', nameContains: 'point' }),
  );

  if (forestAmb) {
    scene1 = addAmbience(scene1, {
      assetId: forestAmb,
      name: 'Forest Ambience',
      startTime: 0,
      endTime: timing.scene1Duration,
      fadeIn: 0.5,
      fadeOut: 0.3,
    });
  }

  if (footsteps) {
    scene1 = addSfx(scene1, {
      assetId: footsteps,
      name: 'Footsteps',
      startTime: 0,
      endTime: timing.walkDuration,
      volume: 0.5,
    });
  }

  if (reaction) {
    scene2 = addSfx(scene2, {
      assetId: reaction,
      name: 'Notice Reaction',
      startTime: 0,
      duration: 0.6,
      volume: 0.45,
    });
  }

  if (pointSfx) {
    scene3 = addSfx(scene3, {
      assetId: pointSfx,
      name: 'Point SFX',
      startTime: timing.neutralTime,
      duration: 0.5,
      volume: 0.4,
    });
  }

  if (reaction) {
    scene3 = addSfx(scene3, {
      assetId: reaction,
      name: 'Surprised Reaction',
      startTime: timing.pointEnd,
      duration: 0.7,
      volume: 0.5,
    });
  }

  if (footsteps) {
    scene4 = addSfx(scene4, {
      assetId: footsteps,
      name: 'Pogo Footsteps',
      startTime: 0,
      endTime: timing.pogoWalkDuration,
      volume: 0.5,
    });
  }

  return [scene1, scene2, scene3, scene4];
}

export function attachForestEggDialogue(
  scenes: [Scene, Scene, Scene, Scene],
  timing: ForestEggAudioTiming & { bogoLineStart: number; bogoLineDuration: number; pogoLineStart: number; pogoLineDuration: number },
  decisions: AssetDecision[],
): [Scene, Scene, Scene, Scene] {
  let [scene1, scene2, scene3, scene4] = scenes;

  const bogoVoice = selectVoice({ speaker: 'BOGO' });
  decisions.push(bogoVoice);
  const pogoVoice = selectVoice({ speaker: 'POGO' });
  decisions.push(pogoVoice);

  const bogoLine = 'Hey! Look at this giant egg!';
  scene3 = addSpokenLine(scene3, {
    id: 'bogo-dialogue-01',
    speaker: 'BOGO',
    text: bogoLine,
    assetId: bogoVoice.asset?.id,
    startTime: timing.bogoLineStart,
    duration: timing.bogoLineDuration,
    layerId: 'layer-bogo-poses',
  });
  scene3 = scheduleReactionAfterDialogue(scene3, {
    afterTrackId: 'bogo-dialogue-01',
    speaker: 'POGO',
    delay: 0.2,
    kind: 'listen',
  });

  const pogoLine = "Whoa! It's huge!";
  scene4 = addSpokenLine(scene4, {
    id: 'pogo-dialogue-01',
    speaker: 'POGO',
    text: pogoLine,
    assetId: pogoVoice.asset?.id,
    startTime: timing.pogoLineStart,
    duration: timing.pogoLineDuration,
    layerId: 'layer-pogo',
  });
  scene4 = scheduleReactionAfterDialogue(scene4, {
    afterTrackId: 'pogo-dialogue-01',
    speaker: 'POGO',
    delay: 0.15,
    kind: 'react',
  });

  if (!bogoVoice.asset) {
    console.warn('[director] Bogo dialogue is text-only (no local voice file)');
  }
  if (!pogoVoice.asset) {
    console.warn('[director] Pogo dialogue is text-only (no local voice file)');
  }

  return [scene1, scene2, scene3, scene4];
}

function attachForestEggCamera(
  scenes: [Scene, Scene, Scene, Scene],
  timing: ForestEggAudioTiming,
): [Scene, Scene, Scene, Scene] {
  let [scene1, scene2, scene3, scene4] = scenes;
  const charRefHeights = getCharacterReferenceHeightsFromRegistry();
  const getAsset = (id: string) => getAssetByIdWithRuntime(id);

  const followStart = roundTime(timing.walkDuration * 0.35);
  const followEnd = roundTime(timing.walkDuration * 0.85);

  scene1 = applyCameraPreset(
    scene1,
    mergeCameraKeyframes(
      cameraHold({ time: 0, x: 0, y: 0, zoom: 0.85, easing: 'linear' }),
      cameraFollow({
        startTime: followStart,
        endTime: followEnd,
        layerId: 'layer-bogo-walk',
        scene: scene1,
        zoom: 0.92,
        offsetX: -60,
        easing: 'ease-in-out',
      }),
      cameraMoveTo({
        startTime: followEnd,
        endTime: timing.walkDuration,
        from: { x: BOGO_TARGET_X - 40, y: 0, zoom: 0.92 },
        to: { x: BOGO_TARGET_X + 40, y: 0, zoom: 0.95 },
        easing: 'ease-out',
      }),
    ),
  );

  const scene2Bounds = computeSubjectBounds(
    scene2,
    ['layer-bogo', 'layer-giant-egg'],
    0,
    LANDSCAPE_OUTPUT,
    getAsset,
    charRefHeights,
  );
  if (scene2Bounds) {
    const frame = frameSubjects({ bounds: scene2Bounds, outputFormat: LANDSCAPE_OUTPUT, padding: 140 });
    scene2 = applyCameraPreset(
      scene2,
      cameraHold({
        time: 0,
        duration: timing.scene2Duration,
        x: frame.x,
        y: frame.y,
        zoom: frame.zoom,
        easing: 'ease-out',
      }),
    );
  }

  const scene3Bounds = computeSubjectBounds(
    scene3,
    ['layer-bogo-poses', 'layer-giant-egg'],
    0,
    LANDSCAPE_OUTPUT,
    getAsset,
    charRefHeights,
  );
  if (scene3Bounds) {
    const frame = frameSubjects({ bounds: scene3Bounds, outputFormat: LANDSCAPE_OUTPUT, padding: 130 });
    scene3 = applyCameraPreset(
      scene3,
      mergeCameraKeyframes(
        cameraHold({
          time: 0,
          x: frame.x,
          y: frame.y,
          zoom: frame.zoom,
          easing: 'ease-out',
        }),
        cameraZoom({
          startTime: timing.pointEnd,
          endTime: Math.min(timing.pointEnd + 0.4, timing.scene3Duration),
          x: frame.x,
          y: frame.y,
          fromZoom: frame.zoom,
          toZoom: Math.min(1.15, frame.zoom + 0.08),
          easing: 'ease-in-out',
        }),
      ),
    );
  }

  const scene4Bounds = computeSubjectBounds(
    scene4,
    ['layer-bogo-hold', 'layer-giant-egg', 'layer-pogo'],
    timing.pogoWalkDuration,
    LANDSCAPE_OUTPUT,
    getAsset,
    charRefHeights,
  );
  const scene4StartBounds = computeSubjectBounds(
    scene4,
    ['layer-bogo-hold', 'layer-giant-egg', 'layer-pogo'],
    0,
    LANDSCAPE_OUTPUT,
    getAsset,
    charRefHeights,
  );
  const startFrame = scene4StartBounds
    ? frameSubjects({ bounds: scene4StartBounds, outputFormat: LANDSCAPE_OUTPUT, padding: 160, maxZoom: 1.0 })
    : { x: -20, y: 0, zoom: 0.88 };
  const endFrame = scene4Bounds
    ? frameSubjects({ bounds: scene4Bounds, outputFormat: LANDSCAPE_OUTPUT, padding: 150, maxZoom: 1.0 })
    : startFrame;

  scene4 = applyCameraPreset(
    scene4,
    mergeCameraKeyframes(
      cameraHold({ time: 0, x: startFrame.x, y: startFrame.y, zoom: startFrame.zoom, easing: 'linear' }),
      cameraPan({
        startTime: 0,
        endTime: timing.pogoWalkDuration,
        fromX: startFrame.x,
        toX: endFrame.x,
        y: startFrame.y,
        zoom: startFrame.zoom,
        easing: 'ease-in-out',
      }),
    ),
  );

  return [scene1, scene2, scene3, scene4];
}

export function buildForestEggEpisode(): ForestEggBuildResult {
  resetLayerCounter();
  resetAudioCounter();
  resetReactionCounter();
  const groundY = getDefaultGroundY();
  const assets = resolveForestEggAssets();
  const decisions: AssetDecision[] = [
    selectBackground({ nameContains: 'FOREST_MAIN' }),
    selectBackground({ nameContains: 'FOREST_CLEARING' }),
    selectCharacterPose({ character: 'BOGO', action: 'walk', direction: 'right' }),
    selectCharacterPose({ character: 'BOGO', action: 'idle', direction: 'right' }),
    selectCharacterPose({ character: 'BOGO', action: 'point', direction: 'right' }),
    selectSurprisedPose('BOGO', 'right'),
    selectCharacterPose({ character: 'POGO', action: 'walk', direction: 'right' }),
    selectCharacterPose({ character: 'POGO', action: 'idle', direction: 'right' }),
    selectProp({ nameContains: 'GIANT_EGG' }),
  ];

  const walkStartX = getOffscreenX('left') + 200;
  const walkEndX = BOGO_TARGET_X;
  const walkDuration = estimateWalkDuration({ startX: walkStartX, endX: walkEndX });

  const walkResult = walkAcrossScene({
    startTime: 0,
    endTime: walkDuration,
    startX: walkStartX,
    endX: walkEndX,
    y: groundY,
    scale: DEFAULT_CHARACTER_SCALE,
    walkAssetId: assets.bogoWalkRight,
    easing: 'ease-in-out',
  });

  const scene1Duration = roundTime(walkDuration + 0.3);

  let scene1 = createScene({
    id: 'scene-1',
    name: 'Bogo Walks Through Forest',
    duration: scene1Duration,
    backgroundAssetId: assets.bgForestMain,
    transition: { type: 'fade', duration: 0.5 },
  });
  scene1 = addCharacter(scene1, {
    id: 'layer-bogo-walk',
    name: 'Bogo',
    assetId: assets.bogoWalkRight,
    endTime: scene1Duration,
    keyframes: walkResult.keyframes,
    poseSegments: walkResult.poseSegments,
  });
  scene1 = finalizeScene(scene1, scene1Duration);

  const holdDuration = estimateHoldDuration();
  const stopResult = stop({
    time: 0,
    duration: holdDuration,
    x: BOGO_TARGET_X,
    y: groundY,
    scale: DEFAULT_CHARACTER_SCALE,
    poseAssetId: assets.bogoNeutral,
  });

  const scene2Duration = roundTime(holdDuration + 0.3);

  let scene2 = createScene({
    id: 'scene-2',
    name: 'Bogo Finds Giant Egg',
    duration: scene2Duration,
    backgroundAssetId: assets.bgForestClearing,
    transition: { type: 'crossfade', duration: 0.5 },
  });
  scene2 = addCharacter(scene2, {
    id: 'layer-bogo',
    name: 'Bogo',
    assetId: assets.bogoNeutral,
    zIndex: 2,
    endTime: scene2Duration,
    keyframes: stopResult.keyframes,
    poseSegments: stopResult.poseSegments,
  });
  scene2 = addProp(scene2, {
    id: 'layer-giant-egg',
    name: 'Giant Egg',
    assetId: assets.giantEgg,
    zIndex: 1,
    endTime: scene2Duration,
    keyframes: stopResult.keyframes.map((kf) => ({ ...kf, x: EGG_X, scale: DEFAULT_PROP_SCALE })),
  });
  scene2 = finalizeScene(scene2, scene2Duration);
  scene2 = carryLayerContinuity(scene1, scene2, (l) => l.name === 'Bogo' || l.id.includes('bogo'));

  const pauseDuration = estimatePauseDuration();
  const reactionDuration = estimateReactionDuration({ beats: 2 });
  const neutralTime = roundTime(pauseDuration + reactionDuration * 0.2);
  const pointEnd = roundTime(neutralTime + reactionDuration * 0.45);
  const bogoLine = 'Hey! Look at this giant egg!';
  const bogoLineDuration = estimateDialogueDuration(bogoLine);
  const scene3Duration = roundTime(Math.max(reactionDuration + 0.3, neutralTime + bogoLineDuration + 0.4));

  const bogoHoldKeyframes = stop({
    time: 0,
    duration: scene3Duration,
    x: BOGO_TARGET_X,
    y: groundY,
    scale: DEFAULT_CHARACTER_SCALE,
  }).keyframes;

  let scene3 = createScene({
    id: 'scene-3',
    name: 'Bogo Points and Surprised',
    duration: scene3Duration,
    backgroundAssetId: assets.bgForestClearing,
    transition: { type: 'crossfade', duration: 0.5 },
  });
  scene3 = addProp(scene3, {
    id: 'layer-giant-egg',
    name: 'Giant Egg',
    assetId: assets.giantEgg,
    zIndex: 1,
    endTime: scene3Duration,
    keyframes: bogoHoldKeyframes.map((kf) => ({ ...kf, x: EGG_X, scale: DEFAULT_PROP_SCALE })),
  });
  scene3 = addCharacter(scene3, {
    id: 'layer-bogo-poses',
    name: 'Bogo',
    assetId: assets.bogoNeutral,
    zIndex: 2,
    endTime: scene3Duration,
    keyframes: bogoHoldKeyframes,
    poseSegments: sequencePoses({
      segments: [
        { assetId: assets.bogoNeutral, startTime: 0, endTime: neutralTime },
        { assetId: assets.bogoPointRight, startTime: neutralTime, endTime: pointEnd },
        { assetId: assets.bogoSurprised, startTime: pointEnd, endTime: scene3Duration },
      ],
    }),
  });
  scene3 = finalizeScene(scene3, scene3Duration);
  scene3 = carryLayerContinuity(scene2, scene3, (l) => l.name === 'Bogo' || l.id.includes('bogo'));
  scene3 = carryLayerContinuity(scene2, scene3, (l) => l.name === 'Giant Egg');

  const pogoWalkDuration = estimateWalkDuration({
    startX: getOffscreenX('right'),
    endX: POGO_TARGET_X,
  });

  const pogoEnter = enterFromRight({
    startTime: 0,
    endTime: pogoWalkDuration,
    targetX: POGO_TARGET_X,
    y: groundY,
    scale: DEFAULT_CHARACTER_SCALE,
    offscreenX: getOffscreenX('right'),
    walkAssetId: assets.pogoWalkLeft,
  });

  const pogoLine = "Whoa! It's huge!";
  const pogoLineDuration = estimateDialogueDuration(pogoLine);
  const scene4Duration = roundTime(pogoWalkDuration + pogoLineDuration + 0.5);

  const scene4HoldKeyframes = stop({
    time: 0,
    duration: scene4Duration,
    x: BOGO_TARGET_X,
    y: groundY,
    scale: DEFAULT_CHARACTER_SCALE,
    poseAssetId: assets.bogoNeutral,
  }).keyframes;

  let scene4 = createScene({
    id: 'scene-4',
    name: 'Pogo Enters',
    duration: scene4Duration,
    backgroundAssetId: assets.bgForestMain,
    transition: { type: 'fade', duration: 0.5 },
  });
  scene4 = addProp(scene4, {
    id: 'layer-giant-egg',
    name: 'Giant Egg',
    assetId: assets.giantEgg,
    zIndex: 1,
    endTime: scene4Duration,
    keyframes: scene4HoldKeyframes.map((kf) => ({ ...kf, x: EGG_X, scale: DEFAULT_PROP_SCALE })),
  });
  scene4 = addCharacter(scene4, {
    id: 'layer-bogo-hold',
    name: 'Bogo',
    assetId: assets.bogoNeutral,
    zIndex: 2,
    endTime: scene4Duration,
    keyframes: scene4HoldKeyframes,
    poseSegments: [{ assetId: assets.bogoNeutral, startTime: 0, endTime: scene4Duration }],
  });
  scene4 = addCharacter(scene4, {
    id: 'layer-pogo',
    name: 'Pogo',
    assetId: assets.pogoWalkLeft,
    endTime: scene4Duration,
    keyframes: pogoEnter.keyframes,
    poseSegments: sequencePoses({
      segments: [
        ...(pogoEnter.poseSegments ?? []),
        {
          assetId: assets.pogoNeutral,
          startTime: pogoWalkDuration,
          endTime: scene4Duration,
        },
      ],
    }),
  });
  scene4 = finalizeScene(scene4, scene4Duration);

  const audioTiming: ForestEggAudioTiming = {
    walkDuration,
    scene1Duration,
    scene2Duration,
    neutralTime,
    pointEnd,
    scene3Duration,
    pogoWalkDuration,
    scene4Duration,
  };

  [scene1, scene2, scene3, scene4] = attachForestEggAudio(
    [scene1, scene2, scene3, scene4],
    audioTiming,
    decisions,
  );

  [scene1, scene2, scene3, scene4] = attachForestEggDialogue(
    [scene1, scene2, scene3, scene4],
    {
      ...audioTiming,
      bogoLineStart: neutralTime,
      bogoLineDuration,
      pogoLineStart: pogoWalkDuration,
      pogoLineDuration,
    },
    decisions,
  );

  [scene1, scene2, scene3, scene4] = attachForestEggCamera(
    [scene1, scene2, scene3, scene4],
    audioTiming,
  );

  const project: ProjectFile = {
    fileVersion: PROJECT_FILE_VERSION,
    settings: {
      name: 'Episode 01 — Forest Egg',
      fps: 30,
      version: PROJECT_DATA_VERSION,
    },
    outputFormatId: 'youtube-landscape',
    scenes: [scene1, scene2, scene3, scene4],
  };

  return { project, assets, decisions };
}

/** Composition summary for docs and tests. */
export function getForestEggComposition(): {
  bogoX: number;
  eggX: number;
  pogoTargetX: number;
  pogoStartX: number;
} {
  return {
    bogoX: BOGO_TARGET_X,
    eggX: EGG_X,
    pogoTargetX: POGO_TARGET_X,
    pogoStartX: getOffscreenX('right'),
  };
}

export function getForestEggLayerPositions(layers: Layer[]): { bogoX?: number; eggX?: number; pogoStartX?: number } {
  const result: { bogoX?: number; eggX?: number; pogoStartX?: number } = {};
  for (const layer of layers) {
    const x = layer.keyframes[0]?.x;
    if (layer.name === 'Bogo' || layer.id.includes('bogo')) result.bogoX = x;
    if (layer.name === 'Giant Egg') result.eggX = x;
    if (layer.name === 'Pogo') result.pogoStartX = x;
  }
  return result;
}
