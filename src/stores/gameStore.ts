import { writable, derived, get } from 'svelte/store';
import type {
  AdversaryType, AdversaryUnit, AdversaryColor, ClassName, SpeciesName,
  DifficultyLevel, TurnState, ActivationEntry,
  ColorCard, SpeciesCard, AppPhase, SetupState,
} from '../types/game';
import { createDeck, drawCard, deckKey } from '../lib/deck';
import { calcInitiative, sortActivations, numberActivations } from '../lib/initiative';
import { CLASS_FILE, SPECIES_FILE } from '../lib/adversaries';

export type ClassDeckJson   = Array<ColorCard[]>;
export type SpeciesDeckJson = SpeciesCard[];

interface GameStore {
  phase: AppPhase;
  setup: SetupState;
  turn: TurnState;
  jsonCache: {
    class:   Partial<Record<ClassName,   ClassDeckJson>>;
    species: Partial<Record<SpeciesName, SpeciesDeckJson>>;
  };
}

const initialSetup: SetupState = {
  selectedTypeName: null,
  difficulty: 1,
  colorToggles: { Red: true, Blue: true, Cyan: true, Yellow: true },
};

const initialTurn: TurnState = {
  turnNumber: 1,
  units: [],
  decks: {},
  activations: [],
  activeActivationIndex: 0,
  selectedUnitId: null,
  selectedAdversaryName: null,
  phase: 'game',
};

export const gameStore = writable<GameStore>({
  phase: 'setup',
  setup: initialSetup,
  turn: initialTurn,
  jsonCache: { class: {}, species: {} },
});

export const activations  = derived(gameStore, s => s.turn.activations);
export const currentTurn  = derived(gameStore, s => s.turn.turnNumber);

export const adversaryGroups = derived(gameStore, s => {
  const seen = new Set<string>();
  return s.turn.units
    .filter(u => { const n = !seen.has(u.adversaryName); seen.add(u.adversaryName); return n; })
    .map(u => ({
      name: u.adversaryName,
      difficulty: u.difficulty,
      units: s.turn.units.filter(uu => uu.adversaryName === u.adversaryName),
    }));
});

// --- Setup actions ---

export function setSetupType(name: string | null): void {
  gameStore.update(s => ({ ...s, setup: { ...s.setup, selectedTypeName: name } }));
}

export function setSetupDifficulty(d: DifficultyLevel): void {
  gameStore.update(s => ({ ...s, setup: { ...s.setup, difficulty: d } }));
}

export function toggleSetupColor(color: AdversaryColor): void {
  gameStore.update(s => ({
    ...s,
    setup: {
      ...s.setup,
      colorToggles: { ...s.setup.colorToggles, [color]: !s.setup.colorToggles[color] },
    },
  }));
}

export function goToBattle(): void {
  gameStore.update(s => ({ ...s, phase: 'battle' }));
}

export function goToSetup(): void {
  gameStore.update(s => ({ ...s, phase: 'setup' }));
}

export function clearAdversaries(): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      units: [],
      activations: [],
      activeActivationIndex: 0,
      selectedUnitId: null,
      selectedAdversaryName: null,
    },
  }));
}

// --- Adversary group management ---

// Add color units for an adversary type; colorToggles filters which colors to add
export async function addAdversaryGroup(
  type: AdversaryType,
  difficulty: DifficultyLevel,
  colorToggles?: Record<AdversaryColor, boolean>
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

  const allColors: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];
  const activeColors = colorToggles
    ? allColors.filter(c => colorToggles[c])
    : allColors;
  if (activeColors.length === 0) return;

  const newUnits: AdversaryUnit[] = activeColors.map(color => ({
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

// --- Turn actions ---

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

      const unit0      = units[0];
      const speciesJson = jsonCache.species[unit0.species]!;
      const classJson   = jsonCache.class[unit0.className]!;
      const speciesCard = speciesJson[speciesIndex];
      const classEntry  = classJson[classIndex];

      for (const unit of units) {
        const classCard  = classEntry.find(c => c.Color === unit.color) ?? classEntry[0];
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
    const firstUnit   = activations[0]?.unit ?? null;
    return {
      ...s,
      turn: {
        ...turn,
        decks,
        activations,
        activeActivationIndex: 0,
        selectedUnitId: firstUnit?.id ?? null,
        selectedAdversaryName: firstUnit?.adversaryName ?? null,
      },
    };
  });
}

function setActivationIndex(index: number): void {
  gameStore.update(s => {
    const { activations } = s.turn;
    const clamped = Math.max(0, Math.min(index, activations.length - 1));
    const unit    = activations[clamped]?.unit ?? null;
    return {
      ...s,
      turn: {
        ...s.turn,
        activeActivationIndex: clamped,
        selectedUnitId: unit?.id ?? null,
        selectedAdversaryName: unit?.adversaryName ?? null,
      },
    };
  });
}

export function nextActivation(): void {
  const { turn } = get(gameStore);
  setActivationIndex(turn.activeActivationIndex + 1);
}

export function prevActivation(): void {
  const { turn } = get(gameStore);
  setActivationIndex(turn.activeActivationIndex - 1);
}

export function endTurn(): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      turnNumber: s.turn.turnNumber + 1,
      activations: [],
      activeActivationIndex: 0,
      selectedUnitId: null,
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
