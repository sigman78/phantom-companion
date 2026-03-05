# Task 04 - Svelte Stores

## Goal

Create `src/stores/missionStore.ts` and `src/stores/gameStore.ts` with all state,
derived values, and action functions needed to run the full game loop.

## Depends on

- Task 01 (project scaffold)
- Task 02 (`src/types/game.ts`)
- Task 03 (`src/lib/deck.ts`, `initiative.ts`, `adversaries.ts`, `assets.ts`)

## Files to create or modify

| Path | Role |
|---|---|
| `src/stores/missionStore.ts` | Setup phase state: staged roster + difficulty |
| `src/stores/gameStore.ts` | Runtime game state: turns, decks, activations |

---

## Implementation: missionStore.ts

Holds the player's unit roster and difficulty selection before the game starts.

```ts
import { writable } from 'svelte/store';
import type { AdversaryUnit, DifficultyLevel, MissionConfig } from '../types/game';

interface MissionStore {
  roster: AdversaryUnit[];
  difficulty: DifficultyLevel;
}

const initial: MissionStore = {
  roster: [],
  difficulty: 1,  // Warrior by default
};

export const missionStore = writable<MissionStore>(initial);

export function addUnit(unit: AdversaryUnit): void {
  missionStore.update(s => ({ ...s, roster: [...s.roster, unit] }));
}

export function removeUnit(unitId: string): void {
  missionStore.update(s => ({
    ...s,
    roster: s.roster.filter(u => u.id !== unitId),
  }));
}

export function setDifficulty(level: DifficultyLevel): void {
  missionStore.update(s => ({ ...s, difficulty: level }));
}

export function clearRoster(): void {
  missionStore.update(s => ({ ...s, roster: [] }));
}

// Snapshot for passing to startGame
export function getMissionConfig(): MissionConfig {
  let config: MissionConfig = { units: [], difficulty: 1 };
  missionStore.subscribe(s => {
    config = { units: s.roster, difficulty: s.difficulty };
  })();
  return config;
}
```

---

## Implementation: gameStore.ts

Central runtime store. Owns turn state, deck state, JSON cache, and activation list.

```ts
import { writable, derived, get } from 'svelte/store';
import type {
  AdversaryUnit, AdversaryColor, ClassName, SpeciesName,
  DifficultyLevel, MissionConfig, TurnState, ActivationEntry,
  ColorCard, SpeciesCard, DeckState,
} from '../types/game';
import { createDeck, drawCard, deckKey } from '../lib/deck';
import { calcInitiative, sortActivations, numberActivations } from '../lib/initiative';
import { CLASS_FILE, SPECIES_FILE } from '../lib/adversaries';

// JSON data shape loaded from disk
type ClassDeckJson  = Array<Record<AdversaryColor, ColorCard>>;
type SpeciesDeckJson = SpeciesCard[];

interface GameStore {
  phase: 'setup' | 'game';
  turn: TurnState;
  jsonCache: {
    class:   Partial<Record<ClassName,  ClassDeckJson>>;
    species: Partial<Record<SpeciesName, SpeciesDeckJson>>;
  };
}

const initialTurn: TurnState = {
  turnNumber: 0,
  decks: {},
  activations: [],
  selectedUnitId: null,
  phase: 'setup',
};

const initialState: GameStore = {
  phase: 'setup',
  turn: initialTurn,
  jsonCache: { class: {}, species: {} },
};

export const gameStore = writable<GameStore>(initialState);

// Derived stores
export const activations = derived(gameStore, s => s.turn.activations);
export const currentTurn = derived(gameStore, s => s.turn.turnNumber);
export const selectedUnit = derived(gameStore, s => {
  const { selectedUnitId, activations } = s.turn;
  if (!selectedUnitId) return null;
  const entry = activations.find(e => e.unit.id === selectedUnitId);
  return entry ? entry.unit : null;
});
```

### startGame

Loads all required JSON files for the mission, creates fresh decks, and transitions
to the game phase.

```ts
export async function startGame(config: MissionConfig): Promise<void> {
  const classCache:   Partial<Record<ClassName,   ClassDeckJson>>  = {};
  const speciesCache: Partial<Record<SpeciesName, SpeciesDeckJson>> = {};

  // Collect unique class and species names needed for this mission
  const classNames   = new Set<ClassName>();
  const speciesNames = new Set<SpeciesName>();
  for (const unit of config.units) {
    classNames.add(unit.className);
    speciesNames.add(unit.species);
  }

  // Load class JSON files
  const classLoads = [...classNames].map(async (cn) => {
    const file = CLASS_FILE[cn];
    const res  = await fetch(`/game-data/data/class/${file}`);
    classCache[cn] = await res.json() as ClassDeckJson;
  });

  // Load species JSON files
  const speciesLoads = [...speciesNames].map(async (sn) => {
    const file = SPECIES_FILE[sn];
    const res  = await fetch(`/game-data/data/species/${file}`);
    speciesCache[sn] = await res.json() as SpeciesDeckJson;
  });

  await Promise.all([...classLoads, ...speciesLoads]);

  // Create one deck pair per unique species+class combination
  const decks: Record<string, DeckState> = {};
  for (const unit of config.units) {
    const key = deckKey(unit.species, unit.className);
    if (!decks[key]) {
      decks[key] = createDeck();
    }
  }

  // Set difficulty on all units (config.difficulty is the authoritative source)
  const units: AdversaryUnit[] = config.units.map(u => ({
    ...u,
    difficulty: config.difficulty,
  }));

  gameStore.set({
    phase: 'game',
    turn: {
      turnNumber: 1,
      decks,
      activations: [],
      selectedUnitId: null,
      phase: 'game',
    },
    jsonCache: { class: classCache, species: speciesCache },
  });
}
```

### drawTurn

Groups living units by species:class, draws one card pair per group, computes initiative
for each unit, sorts and numbers activations.

```ts
export function drawTurn(): void {
  gameStore.update(s => {
    const { turn, jsonCache } = s;

    // Find all living units from the activation list or need another source.
    // After startGame, units live in the mission config - store them in turn too.
    // (See note below about unit storage.)
    const livingUnits = turn.units.filter((u: AdversaryUnit) => u.alive);

    // Group living units by deck key
    const groups = new Map<string, AdversaryUnit[]>();
    for (const unit of livingUnits) {
      const key = deckKey(unit.species, unit.className);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(unit);
    }

    let decks = { ...turn.decks };
    const entries: ActivationEntry[] = [];

    for (const [key, units] of groups) {
      // Draw one card pair for the whole group
      const { speciesIndex, classIndex, deck: newDeck } = drawCard(decks[key]);
      decks = { ...decks, [key]: newDeck };

      // Look up card data from cache
      const unit0     = units[0];
      const speciesJson = jsonCache.species[unit0.species]!;
      const classJson   = jsonCache.class[unit0.className]!;
      const speciesCard = speciesJson[speciesIndex];
      const classEntry  = classJson[classIndex];  // Record<AdversaryColor, ColorCard>

      // Create one ActivationEntry per unit in the group
      for (const unit of units) {
        const classCard  = classEntry[unit.color];
        const initiative = calcInitiative(unit, speciesCard, classEntry);
        entries.push({ unit, speciesCard, classCard, initiative, activationOrder: 0 });
      }
    }

    const sorted     = sortActivations(entries);
    const activations = numberActivations(sorted);

    return {
      ...s,
      turn: { ...turn, decks, activations, selectedUnitId: null },
    };
  });
}
```

**Important**: `drawTurn` needs access to all living units. The `TurnState` type needs
a `units` field added (not shown in the original type definition - add it):

```ts
// Add to TurnState in src/types/game.ts:
units: AdversaryUnit[];
```

Update `startGame` to set `turn.units = units` when initializing.

### endTurn, selectUnit, markUnitDead, reviveUnit

```ts
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
  gameStore.update(s => ({
    ...s,
    turn: { ...s.turn, selectedUnitId: id },
  }));
}

export function markUnitDead(id: string): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      units: s.turn.units.map(u => u.id === id ? { ...u, alive: false } : u),
    },
  }));
}

export function reviveUnit(id: string): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      units: s.turn.units.map(u => u.id === id ? { ...u, alive: true } : u),
    },
  }));
}
```

### addUnitMidGame, removeUnitMidGame

```ts
export async function addUnitMidGame(unit: AdversaryUnit): Promise<void> {
  const s = get(gameStore);
  const classCache   = { ...s.jsonCache.class };
  const speciesCache = { ...s.jsonCache.species };

  // Load JSON if not already cached
  if (!classCache[unit.className]) {
    const file = CLASS_FILE[unit.className];
    const res  = await fetch(`/game-data/data/class/${file}`);
    classCache[unit.className] = await res.json();
  }
  if (!speciesCache[unit.species]) {
    const file = SPECIES_FILE[unit.species];
    const res  = await fetch(`/game-data/data/species/${file}`);
    speciesCache[unit.species] = await res.json();
  }

  gameStore.update(s => {
    const key  = deckKey(unit.species, unit.className);
    const decks = s.turn.decks[key]
      ? s.turn.decks
      : { ...s.turn.decks, [key]: createDeck() };

    return {
      ...s,
      turn: { ...s.turn, units: [...s.turn.units, unit], decks },
      jsonCache: { class: classCache, species: speciesCache },
    };
  });
}

export function removeUnitMidGame(id: string): void {
  gameStore.update(s => ({
    ...s,
    turn: {
      ...s.turn,
      units: s.turn.units.filter(u => u.id !== id),
      activations: s.turn.activations.filter(e => e.unit.id !== id),
    },
  }));
}
```

---

## Key rules and constraints

**One deck pair per unique species+class combination**: Two Red Grallok Archers on the
board share one Grallok deck and one Archer deck. `drawTurn` draws once per group and
applies the same card to all units in the group.

**Draw semantics**: "Draw 1 species card + 1 class card per active species/class type"
means one draw per unique `{species}:{class}` key, not one per unit. All units in the
group share the same drawn card, but their initiative differs because class cards have
per-color costs.

**JSON loading**: Only happens at `startGame` (and `addUnitMidGame` for new types).
During play, `drawTurn` reads only from `jsonCache`. No network requests during a turn.

**Phase transition**: `startGame` is the only function that sets `phase = 'game'`.
There is no `endGame` in Phase 1; the player refreshes to start over.

**TurnState.units**: Needs to be added to the `TurnState` interface in
`src/types/game.ts`. This is the authoritative list of all units (alive or dead) in the
current mission.

---

## Done criteria

- [ ] `missionStore` starts with empty roster and difficulty 1
- [ ] `addUnit` / `removeUnit` / `setDifficulty` / `clearRoster` update the store correctly
- [ ] `startGame` fetches all required JSON files and sets `phase = 'game'`
- [ ] After `startGame`, `gameStore` has one deck entry per unique species+class pair
- [ ] `drawTurn` produces a non-empty `activations` array sorted by initiative descending
- [ ] `drawTurn` called with two units of the same species+class pair draws from the
  same deck (not two separate decks)
- [ ] `endTurn` increments `turnNumber` and clears `activations`
- [ ] `markUnitDead` + `reviveUnit` toggle `alive` on the correct unit
- [ ] Dead units are excluded from `drawTurn` groups
- [ ] `addUnitMidGame` loads JSON only if not already cached
- [ ] No TypeScript errors
