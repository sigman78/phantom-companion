import { describe, it, expect } from 'vitest';
import { calcInitiative, sortActivations, numberActivations } from './initiative';
import type { AdversaryUnit, SpeciesCard, ColorCard, ActivationEntry, AdversaryColor } from '../types/game';

function makeUnit(color: 'Red' | 'Blue' | 'Cyan' | 'Yellow'): AdversaryUnit {
  return {
    id: `TestAdversary:${color}`,
    adversaryName: 'TestAdversary',
    species: 'Grallok',
    className: 'Archer',
    color,
    difficulty: 1,
    alive: true,
  };
}

function makeColorCard(cost: number) {
  return { Name: 'Card', Cost: cost, Actions: [] as ColorCard['Actions'] };
}

function makeEntry(unit: AdversaryUnit, initiative: number): ActivationEntry {
  return {
    unit,
    speciesCard: { Name: 'S', Cost: 0, Actions: [] },
    classCard:   { Name: 'C', Cost: 0, Actions: [] },
    initiative,
    activationOrder: 0,
    speciesCardIndex: 0,
    classCardIndex: 0,
  };
}

function makeColorCardEntry(red: number, blue: number, cyan: number, yellow: number): ColorCard[] {
  return [
    { Color: 'Red',    ...makeColorCard(red) },
    { Color: 'Blue',   ...makeColorCard(blue) },
    { Color: 'Cyan',   ...makeColorCard(cyan) },
    { Color: 'Yellow', ...makeColorCard(yellow) },
  ];
}

describe('calcInitiative', () => {
  it('sums species card Cost + color class Cost', () => {
    const unit = makeUnit('Red');
    const speciesCard: SpeciesCard = { Name: 'S', Cost: 3, Actions: [] };
    const classEntry = makeColorCardEntry(2, 1, 4, 5);
    expect(calcInitiative(unit, speciesCard, classEntry)).toBe(5);
  });
  it('uses the unit color to select the class card', () => {
    const unit = makeUnit('Cyan');
    const speciesCard: SpeciesCard = { Name: 'S', Cost: 1, Actions: [] };
    const classEntry = makeColorCardEntry(0, 0, 6, 0);
    expect(calcInitiative(unit, speciesCard, classEntry)).toBe(7);
  });
});

describe('sortActivations', () => {
  it('sorts ascending by initiative', () => {
    const entries = [
      makeEntry(makeUnit('Red'), 5),
      makeEntry(makeUnit('Blue'), 2),
      makeEntry(makeUnit('Cyan'), 8),
    ];
    const sorted = sortActivations(entries);
    expect(sorted.map(e => e.initiative)).toEqual([2, 5, 8]);
  });
  it('tie-breaks by COLOR_ORDER: Red < Blue < Cyan < Yellow', () => {
    const entries = [
      makeEntry(makeUnit('Yellow'), 3),
      makeEntry(makeUnit('Red'),    3),
      makeEntry(makeUnit('Cyan'),   3),
      makeEntry(makeUnit('Blue'),   3),
    ];
    const sorted = sortActivations(entries);
    expect(sorted.map(e => e.unit.color)).toEqual(['Red', 'Blue', 'Cyan', 'Yellow']);
  });
});

describe('numberActivations', () => {
  it('assigns 1-based activationOrder', () => {
    const entries = [
      makeEntry(makeUnit('Red'),  1),
      makeEntry(makeUnit('Blue'), 2),
      makeEntry(makeUnit('Cyan'), 3),
    ];
    const numbered = numberActivations(entries);
    expect(numbered.map(e => e.activationOrder)).toEqual([1, 2, 3]);
  });
});
