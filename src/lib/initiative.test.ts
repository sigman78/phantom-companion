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
    classCard:   { Color: unit.color, Name: 'C', Cost: 0, Actions: [] },
    initiative,
    activationOrder: 0,
    speciesCardIndex: 0,
    classCardIndex: 0,
    classCardOrderIndex: 0,
    drawGroupOrder: 0,
  };
}

function makeEntryWithMeta(
  unit: AdversaryUnit,
  initiative: number,
  classCost: number,
  classCardOrderIndex: number,
  drawGroupOrder: number
): ActivationEntry {
  return {
    unit,
    speciesCard: { Name: 'S', Cost: 0, Actions: [] },
    classCard:   { Color: unit.color, Name: 'C', Cost: classCost, Actions: [] },
    initiative,
    activationOrder: 0,
    speciesCardIndex: 0,
    classCardIndex: 0,
    classCardOrderIndex,
    drawGroupOrder,
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
  it('tie-breaks same-cost entries by class card JSON order', () => {
    const entries = [
      makeEntryWithMeta(makeUnit('Yellow'), 3, 3, 1, 0),
      makeEntryWithMeta(makeUnit('Red'),    3, 3, 3, 0),
      makeEntryWithMeta(makeUnit('Cyan'),   3, 3, 0, 0),
      makeEntryWithMeta(makeUnit('Blue'),   3, 3, 2, 0),
    ];
    const sorted = sortActivations(entries);
    expect(sorted.map(e => e.unit.color)).toEqual(['Cyan', 'Yellow', 'Blue', 'Red']);
  });
  it('keeps initiative as the primary sort before class card order', () => {
    const entries = [
      makeEntryWithMeta(makeUnit('Yellow'), 4, 3, 0, 0),
      makeEntryWithMeta(makeUnit('Red'),    2, 1, 3, 0),
      makeEntryWithMeta(makeUnit('Cyan'),   3, 2, 1, 0),
      makeEntryWithMeta(makeUnit('Blue'),   1, 0, 2, 0),
    ];
    const sorted = sortActivations(entries);
    expect(sorted.map(e => e.initiative)).toEqual([1, 2, 3, 4]);
  });
  it('keeps cross-group equal initiatives in draw group order', () => {
    const entries = [
      makeEntryWithMeta(makeUnit('Yellow'), 3, 3, 1, 1),
      makeEntryWithMeta(makeUnit('Red'),    3, 3, 2, 0),
      makeEntryWithMeta(makeUnit('Cyan'),   3, 3, 0, 1),
      makeEntryWithMeta(makeUnit('Blue'),   3, 3, 3, 0),
    ];
    const sorted = sortActivations(entries);
    expect(sorted.map(e => `${e.drawGroupOrder}:${e.unit.color}`)).toEqual([
      '0:Red',
      '0:Blue',
      '1:Cyan',
      '1:Yellow',
    ]);
  });
  it('keeps different adversary types grouped while preserving per-type card order', () => {
    const typeAEntries = [
      makeEntryWithMeta(
        { ...makeUnit('Yellow'), adversaryName: 'TypeA', id: 'TypeA:Yellow' },
        4,
        4,
        1,
        0
      ),
      makeEntryWithMeta(
        { ...makeUnit('Cyan'), adversaryName: 'TypeA', id: 'TypeA:Cyan' },
        4,
        4,
        0,
        0
      ),
    ];
    const typeBEntries = [
      makeEntryWithMeta(
        { ...makeUnit('Red'), adversaryName: 'TypeB', id: 'TypeB:Red' },
        4,
        4,
        1,
        1
      ),
      makeEntryWithMeta(
        { ...makeUnit('Blue'), adversaryName: 'TypeB', id: 'TypeB:Blue' },
        4,
        4,
        0,
        1
      ),
    ];
    const sorted = sortActivations([
      typeBEntries[0],
      typeAEntries[0],
      typeBEntries[1],
      typeAEntries[1],
    ]);
    expect(sorted.map(e => `${e.unit.adversaryName}:${e.unit.color}`)).toEqual([
      'TypeA:Cyan',
      'TypeA:Yellow',
      'TypeB:Blue',
      'TypeB:Red',
    ]);
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
