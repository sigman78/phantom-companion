import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  gameStore, activations, adversaryGroups,
  removeAdversaryGroup, endTurn, nextActivation, prevActivation,
} from './gameStore';
import type { AdversaryUnit, ActivationEntry } from '../types/game';

const CLEAN_STATE = {
  phase: 'setup' as const,
  setup: {
    selectedTypeName: null,
    difficulty: 1 as const,
    colorToggles: { Red: true, Blue: true, Cyan: true, Yellow: true },
    selectedTypes: [],
  },
  turn: {
    turnNumber: 1,
    units: [],
    decks: {},
    activations: [],
    activeActivationIndex: 0,
    selectedUnitId: null,
    selectedAdversaryName: null,
    phase: 'game' as const,
  },
  jsonCache: { class: {}, species: {} },
};

function makeUnit(id: string, adversaryName: string, color: AdversaryUnit['color'] = 'Red'): AdversaryUnit {
  return { id, adversaryName, species: 'Grallok', className: 'Archer', color, difficulty: 1, alive: true };
}

function makeEntry(unit: AdversaryUnit, order: number): ActivationEntry {
  return {
    unit,
    speciesCard: { Name: 'S', Cost: 1, Actions: [] },
    classCard:   { Color: 'Red' as const, Name: 'C', Cost: 1, Actions: [] },
    initiative: order,
    activationOrder: order,
    speciesCardIndex: 0,
    classCardIndex: 0,
  };
}

beforeEach(() => {
  gameStore.set(CLEAN_STATE);
});

describe('initial state', () => {
  it('has empty units array', () => {
    expect(get(gameStore).turn.units).toHaveLength(0);
  });
  it('has turnNumber 1', () => {
    expect(get(gameStore).turn.turnNumber).toBe(1);
  });
  it('has activeActivationIndex 0', () => {
    expect(get(gameStore).turn.activeActivationIndex).toBe(0);
  });
  it('activations derived store is empty', () => {
    expect(get(activations)).toHaveLength(0);
  });
  it('adversaryGroups derived store is empty', () => {
    expect(get(adversaryGroups)).toHaveLength(0);
  });
});

describe('adversaryGroups', () => {
  it('returns one group per unique adversaryName', () => {
    gameStore.update(s => ({
      ...s,
      turn: {
        ...s.turn,
        units: [
          makeUnit('A:Red',  'TypeA', 'Red'),
          makeUnit('A:Blue', 'TypeA', 'Blue'),
          makeUnit('B:Red',  'TypeB', 'Red'),
        ],
      },
    }));
    const groups = get(adversaryGroups);
    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('TypeA');
    expect(groups[1].name).toBe('TypeB');
  });
  it('includes all units for each group', () => {
    gameStore.update(s => ({
      ...s,
      turn: {
        ...s.turn,
        units: [
          makeUnit('A:Red',  'TypeA', 'Red'),
          makeUnit('A:Blue', 'TypeA', 'Blue'),
        ],
      },
    }));
    const groups = get(adversaryGroups);
    expect(groups[0].units).toHaveLength(2);
  });
});

describe('removeAdversaryGroup', () => {
  it('removes all units with matching adversaryName', () => {
    gameStore.update(s => ({
      ...s,
      turn: {
        ...s.turn,
        units: [
          makeUnit('A:Red', 'TypeA'),
          makeUnit('B:Red', 'TypeB'),
        ],
      },
    }));
    removeAdversaryGroup('TypeA');
    const units = get(gameStore).turn.units;
    expect(units).toHaveLength(1);
    expect(units[0].adversaryName).toBe('TypeB');
  });
  it('clears selectedAdversaryName when it matches the removed group', () => {
    gameStore.update(s => ({
      ...s,
      turn: {
        ...s.turn,
        selectedAdversaryName: 'TypeA',
        units: [makeUnit('A:Red', 'TypeA')],
      },
    }));
    removeAdversaryGroup('TypeA');
    expect(get(gameStore).turn.selectedAdversaryName).toBeNull();
  });
  it('keeps selectedAdversaryName when a different group is removed', () => {
    gameStore.update(s => ({
      ...s,
      turn: {
        ...s.turn,
        selectedAdversaryName: 'TypeA',
        units: [
          makeUnit('A:Red', 'TypeA'),
          makeUnit('B:Red', 'TypeB'),
        ],
      },
    }));
    removeAdversaryGroup('TypeB');
    expect(get(gameStore).turn.selectedAdversaryName).toBe('TypeA');
  });
});

describe('endTurn', () => {
  it('increments turnNumber', () => {
    endTurn();
    expect(get(gameStore).turn.turnNumber).toBe(2);
  });
  it('clears activations', () => {
    const unitA = makeUnit('A:Red', 'TypeA');
    gameStore.update(s => ({
      ...s,
      turn: { ...s.turn, activations: [makeEntry(unitA, 1)] },
    }));
    endTurn();
    expect(get(gameStore).turn.activations).toHaveLength(0);
  });
  it('resets activeActivationIndex to 0', () => {
    gameStore.update(s => ({
      ...s,
      turn: { ...s.turn, activeActivationIndex: 3 },
    }));
    endTurn();
    expect(get(gameStore).turn.activeActivationIndex).toBe(0);
  });
});

describe('nextActivation / prevActivation', () => {
  const unitA = makeUnit('A:Red', 'TypeA', 'Red');
  const unitB = makeUnit('B:Red', 'TypeB', 'Red');

  beforeEach(() => {
    gameStore.update(s => ({
      ...s,
      turn: {
        ...s.turn,
        activations: [makeEntry(unitA, 1), makeEntry(unitB, 2)],
        activeActivationIndex: 0,
        selectedUnitId: 'A:Red',
        selectedAdversaryName: 'TypeA',
      },
    }));
  });

  it('nextActivation advances index', () => {
    nextActivation();
    expect(get(gameStore).turn.activeActivationIndex).toBe(1);
  });

  it('nextActivation updates selectedUnitId to match new index', () => {
    nextActivation();
    expect(get(gameStore).turn.selectedUnitId).toBe('B:Red');
  });

  it('nextActivation clamps at end (length - 1)', () => {
    nextActivation(); // to 1
    nextActivation(); // should clamp at 1
    expect(get(gameStore).turn.activeActivationIndex).toBe(1);
  });

  it('prevActivation decrements index', () => {
    nextActivation(); // to 1
    prevActivation(); // back to 0
    expect(get(gameStore).turn.activeActivationIndex).toBe(0);
  });

  it('prevActivation clamps at 0', () => {
    prevActivation(); // already at 0
    expect(get(gameStore).turn.activeActivationIndex).toBe(0);
  });
});
