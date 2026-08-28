import type { ProjectFile } from '../../types/projectFile';
import { PROJECT_DATA_VERSION, PROJECT_FILE_VERSION } from '../../types/projectFile';
import type { Layer, Scene } from '../../types/project';
import { createScene, addCharacter, addProp, resetLayerCounter } from '../sceneHelpers';
import { walkAcrossScene, enterFromRight, stop } from '../presets';
import { sequencePoses } from '../poseHelpers';
import {
  requireAsset,
  selectAudio,
  selectBackground,
  selectCharacterPose,
  selectProp,
  selectSurprisedPose,
  type AssetDecision,
} from '../assetSelection';
import { addAmbience, addSfx, resetAudioCounter } from '../audioHelpers';
import {
  DEFAULT_CHARACTER_SCALE,
  DEFAULT_PROP_SCALE,
  getDefaultGroundY,
  getOffscreenX,
  placePropRelativeToCharacter,
} from '../compositionHelpers';
import { estimateHoldDuration, estimateReactionDuration, estimateWalkDuration, roundTime, sceneDurationFromLayers } from '../timing';

export type ForestEggAssets = {
  bgForestMain: string;
  bgForestClearing: string;
  bogoWalkRight: string;
  bogoNeutral: string;
  bogoPointRight: string;
  bogoSurprised: string;
  pogoWalkRight: string;
  pogoNeutral: string;
  giantEgg: string;
};

export type ForestEggBuildResult = {
  project: ProjectFile;
  assets: ForestEggAssets;
  decisions: AssetDecision[];
};

const BOGO_TARGET_X = -180;
const EGG_X = placePropRelativeToCharacter({ characterX: BOGO_TARGET_X, direction: 'right' });
const POGO_TARGET_X = 120;

export function resolveForestEggAssets(): ForestEggAssets {
  const bgMain = requireAsset(selectBackground({ nameContains: 'FOREST_MAIN' }), 'bgForestMain');
  const bgClearing = requireAsset(selectBackground({ nameContains: 'FOREST_CLEARING' }), 'bgForestClearing');
  const bogoWalk = requireAsset(selectCharacterPose({ character: 'BOGO', action: 'walk', direction: 'right' }), 'bogoWalk');
  const bogoNeutral = requireAsset(selectCharacterPose({ character: 'BOGO', action: 'idle', direction: 'right' }), 'bogoNeutral');
  const bogoPoint = requireAsset(selectCharacterPose({ character: 'BOGO', action: 'point', direction: 'right' }), 'bogoPoint');
  const bogoSurprised = requireAsset(selectSurprisedPose('BOGO', 'right'), 'bogoSurprised');
  const pogoWalk = requireAsset(selectCharacterPose({ character: 'POGO', action: 'walk', direction: 'right' }), 'pogoWalk');
  const pogoNeutral = requireAsset(selectCharacterPose({ character: 'POGO', action: 'idle', direction: 'right' }), 'pogoNeutral');
  const egg = requireAsset(selectProp({ nameContains: 'GIANT_EGG' }), 'giantEgg');

  return {
    bgForestMain: bgMain.id,
    bgForestClearing: bgClearing.id,
    bogoWalkRight: bogoWalk.id,
    bogoNeutral: bogoNeutral.id,
    bogoPointRight: bogoPoint.id,
    bogoSurprised: bogoSurprised.id,
    pogoWalkRight: pogoWalk.id,
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

export function buildForestEggEpisode(): ForestEggBuildResult {
  resetLayerCounter();
  resetAudioCounter();
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

  const reactionDuration = estimateReactionDuration({ beats: 2 });
  const neutralTime = roundTime(reactionDuration * 0.25);
  const pointEnd = roundTime(reactionDuration * 0.65);
  const scene3Duration = roundTime(reactionDuration + 0.3);

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
    walkAssetId: assets.pogoWalkRight,
  });

  const scene4Duration = roundTime(pogoWalkDuration + 0.8);

  let scene4 = createScene({
    id: 'scene-4',
    name: 'Pogo Enters',
    duration: scene4Duration,
    backgroundAssetId: assets.bgForestMain,
    transition: { type: 'fade', duration: 0.5 },
  });
  scene4 = addCharacter(scene4, {
    id: 'layer-pogo',
    name: 'Pogo',
    assetId: assets.pogoWalkRight,
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
