export type BeatAction =
  | 'walk'
  | 'stop'
  | 'look'
  | 'point'
  | 'react'
  | 'enter'
  | 'exit'
  | 'fly';

export type BeatDirection = 'left' | 'right';

export type VisualBeat = {
  action: BeatAction;
  character?: string;
  target?: string;
  direction?: BeatDirection;
  notes?: string;
};

export type ScenePlan = {
  name: string;
  beats: VisualBeat[];
};

/** Group consecutive beats into sensible scenes (do not create a scene per micro-action). */
export function groupBeatsIntoScenes(beats: VisualBeat[]): ScenePlan[] {
  if (beats.length === 0) return [];

  const plans: ScenePlan[] = [];
  let current: VisualBeat[] = [];
  let sceneIndex = 1;

  const flush = (name: string) => {
    if (current.length === 0) return;
    plans.push({ name, beats: [...current] });
    current = [];
    sceneIndex++;
  };

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const next = beats[i + 1];

    current.push(beat);

    if (beat.action === 'walk' && next?.action === 'stop') continue;
    if (beat.action === 'stop' && next?.action === 'look') continue;
    if (beat.action === 'look' && (next?.action === 'point' || next?.action === 'react')) continue;
    if (beat.action === 'point' && next?.action === 'react') continue;

    if (beat.action === 'walk') {
      flush(`${beat.character ?? 'Character'} Walks`);
    } else if (beat.action === 'stop' || beat.action === 'look') {
      flush(`${beat.character ?? 'Character'} Notices ${beat.target ?? 'Target'}`);
    } else if (beat.action === 'point' || beat.action === 'react') {
      flush(`${beat.character ?? 'Character'} Reacts`);
    } else if (beat.action === 'enter') {
      flush(`${beat.character ?? 'Character'} Enters`);
    } else if (beat.action === 'exit') {
      flush(`${beat.character ?? 'Character'} Exits`);
    } else if (beat.action === 'fly') {
      flush(`${beat.character ?? 'Character'} Flies`);
    } else {
      flush(`Scene ${sceneIndex}`);
    }
  }

  if (current.length > 0) {
    flush(`Scene ${sceneIndex}`);
  }

  return plans;
}

/** Canonical beat breakdown for the forest-egg test script. */
export const FOREST_EGG_BEATS: VisualBeat[] = [
  { action: 'walk', character: 'BOGO', direction: 'right', notes: 'Through the forest' },
  { action: 'stop', character: 'BOGO', notes: 'Reaches intended position' },
  { action: 'look', character: 'BOGO', target: 'giant egg', direction: 'right' },
  { action: 'point', character: 'BOGO', target: 'giant egg', direction: 'right' },
  { action: 'react', character: 'BOGO', target: 'giant egg', notes: 'surprised' },
  { action: 'enter', character: 'POGO', direction: 'right', notes: 'From offscreen right' },
];

export function getForestEggScenePlans(): ScenePlan[] {
  return [
    {
      name: 'Bogo Walks Through Forest',
      beats: [
        { action: 'walk', character: 'BOGO', direction: 'right' },
      ],
    },
    {
      name: 'Bogo Finds Giant Egg',
      beats: [
        { action: 'stop', character: 'BOGO' },
        { action: 'look', character: 'BOGO', target: 'giant egg', direction: 'right' },
      ],
    },
    {
      name: 'Bogo Points and Surprised',
      beats: [
        { action: 'point', character: 'BOGO', target: 'giant egg', direction: 'right' },
        { action: 'react', character: 'BOGO', target: 'giant egg', notes: 'surprised' },
      ],
    },
    {
      name: 'Pogo Enters',
      beats: [
        { action: 'enter', character: 'POGO', direction: 'right' },
      ],
    },
  ];
}
