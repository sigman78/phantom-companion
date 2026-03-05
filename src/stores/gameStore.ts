import { writable, derived, get } from 'svelte/store';
import type {
  AdversaryType, AdversaryUnit, AdversaryColor, ClassName, SpeciesName,
  DifficultyLevel, TurnState, ActivationEntry,
  ColorCard, SpeciesCard,
} from '../types/game';
import { createDeck, drawCard, deckKey } from '../lib/deck';
import { calcInitiative, sortActivations, numberActivations } from '../lib/initiative';
import { CLASS_FILE, SPECIES_FILE } from '../lib/adversaries';

export type ClassDeckJson   = Array<Record<AdversaryColor, ColorCard>>;
export type SpeciesDeckJson = SpeciesCard[];

interface GameStore {
  phase: 'game';
  turn: TurnState;
  jsonCache: {
    class:   Partial<Record<ClassName,   ClassDeckJson>>;
    species: Partial<Record<SpeciesName, SpeciesDeckJson>>;
  };
}

const initialTurn: TurnState = {
  turnNumber: 1,
  units: [],
  decks: {},
  activations: [],
  selectedUnitId: null,
  selectedAdversaryName: null,
  phase: 'game',
};

export const gameStore = writable<GameStore>({
  phase: 'game',
  turn: initialTurn,
  jsonCache: { class: {}, species: {} },
});

export const activations  = derived(gameStore, s => s.turn.activations);
export const currentTurn  = derived(gameStore, s => s.turn.turnNumber);

// Add all 4 color units for an adversary type
export async function addAdversaryGroup(
  type: AdversaryType,
  difficulty: DifficultyLevel
): Promise<void> {
  const s = get(gameStore);
  const classCache   = { ...s.jsonCache.class };
  const speciesCache = { ...s.jsonCache.species };

  if (!classCache[type.className]) {
    const res = await fetch(`/game-data/data/class/${CLASS_FILE[type.className]}`);
    classCache[type.className] = await res.json() as ClassDeckJson;
  }
  if (!speciesCache[type.species]) {
    const res = await fetch(`/game-data/data/species/${SPECIES_FILE[type.species]}`);
    speciesCache[type.species] = await res.json() as SpeciesDeckJson;
  }

  const colors: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];
  const newUnits: AdversaryUnit[] = colors.map(color => ({
    id: `${type.name}:${color}`,
    adversaryName: type.name,
    species: type.species,
    className: type.className,
    color,
    difficulty,
    alive: true,
  }));

  gameStore.update(s => {
    const key   = deckKey(type.species, type.className);
    const decks = s.turn.decks[key]
      ? s.turn.decks
      : { ...s.turn.decks, [key]: createDeck() };
    // Remove any existing units for this adversary type before re-adding
    const existing = s.turn.units.filter(u => u.adversaryName !== type.name);
    return {
      ...s,
      turn: { ...s.turn, units: [...existing, ...newUnits], decks },
      jsonCache: { class: classCache, species: speciesCache },
    };
  });
}

export function removeAdversaryGroup(adversaryName: string): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      units:       s.turn.units.filter(u => u.adversaryName !== adversaryName),
      activations: s.turn.activations.filter(e => e.unit.adversaryName !== adversaryName),
      selectedAdversaryName:
        s.turn.selectedAdversaryName === adversaryName ? null : s.turn.selectedAdversaryName,
    },
  }));
}

export function drawTurn(): void {
  gameStore.update(s => {
    const { turn, jsonCache } = s;
    const livingUnits = turn.units.filter(u => u.alive);
    if (livingUnits.length === 0) return s;

    const groups = new Map<string, AdversaryUnit[]>();
    for (const unit of livingUnits) {
      const key = deckKey(unit.species, unit.className);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(unit);
    }

    let decks = { ...turn.decks };
    const entries: ActivationEntry[] = [];

    for (const [key, units] of groups) {
      const { speciesIndex, classIndex, deck: newDeck } = drawCard(decks[key]);
      decks = { ...decks, [key]: newDeck };

      const unit0       = units[0];
      const speciesJson  = jsonCache.species[unit0.species]!;
      const classJson    = jsonCache.class[unit0.className]!;
      const speciesCard  = speciesJson[speciesIndex];
      const classEntry   = classJson[classIndex];

      for (const unit of units) {
        const classCard  = classEntry[unit.color];
        const initiative = calcInitiative(unit, speciesCard, classEntry);
        entries.push({
          unit, speciesCard, classCard, initiative,
          activationOrder: 0,
          speciesCardIndex: speciesIndex,
          classCardIndex:   classIndex,
        });
      }
    }

    const activations = numberActivations(sortActivations(entries));
    return { ...s, turn: { ...turn, decks, activations, selectedUnitId: null } };
  });
}

export function endTurn(): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      turnNumber: s.turn.turnNumber + 1,
      activations: [],
      selectedUnitId: null,
    },
  }));
}

export function selectUnit(id: string): void {
  const unit = get(gameStore).turn.units.find(u => u.id === id);
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      selectedUnitId: id,
      selectedAdversaryName: unit?.adversaryName ?? s.turn.selectedAdversaryName,
    },
  }));
}

export function selectAdversary(name: string): void {
  gameStore.update(s => ({
    ...s,
    turn: { ...s.turn, selectedAdversaryName: name, selectedUnitId: null },
  }));
}

export function markUnitDead(id: string): void {
  gameStore.update(s => ({
    ...s,
    turn: { ...s.turn, units: s.turn.units.map(u => u.id === id ? { ...u, alive: false } : u) },
  }));
}

export function reviveUnit(id: string): void {
  gameStore.update(s => ({
    ...s,
    turn: { ...s.turn, units: s.turn.units.map(u => u.id === id ? { ...u, alive: true } : u) },
  }));
}
