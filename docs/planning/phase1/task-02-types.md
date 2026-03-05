# Task 02 - TypeScript Domain Types

## Goal

Create `src/types/game.ts` containing all domain interfaces and type aliases used
throughout the app.

## Depends on

- Task 01 (project scaffold, `src/types/` directory exists)

## Files to create or modify

| Path | Role |
|---|---|
| `src/types/game.ts` | All domain types; imported by lib, stores, and components |

## Implementation

Create `src/types/game.ts` with the following content verbatim. No other files are
modified in this task.

```ts
export type AdversaryColor = 'Red' | 'Blue' | 'Cyan' | 'Yellow';

export type ClassName =
  | 'Archer' | 'Berserker' | 'Scout' | 'Sentry'
  | 'Trained Beast' | 'Wild Beast';

export type SpeciesName =
  | 'Grallok' | 'Gryllo' | 'Human' | 'Lypran'
  | 'Other' | 'Slink' | 'Timeless' | 'Wolf';

// Difficulty: 0 = Rookie, 1 = Warrior, 2 = Veteran, 3 = Elite
export type DifficultyLevel = 0 | 1 | 2 | 3;

export interface AdversaryType {
  name: string;           // e.g. "Grallok Archer"
  species: SpeciesName;
  className: ClassName;
}

export interface AdversaryStatBlock {
  HP: number;
  GUARD: number;
  ATTACK: number;
  RANGE: number;
  CRIT: string;
}

// A unit on the board: one adversary group instance with a color
export interface AdversaryUnit {
  id: string;             // stable id: "{name}:{color}" e.g. "Grallok Archer:Red"
  adversaryName: string;  // key into adversary-stats
  species: SpeciesName;
  className: ClassName;
  color: AdversaryColor;
  difficulty: DifficultyLevel;
  alive: boolean;
}

// One entry in the active deck: shuffled index array into the source JSON
export interface DeckState {
  speciesIndices: number[];   // shuffled indices 0-9, head = top of deck
  classIndices: number[];
  speciesDiscard: number[];
  classDiscard: number[];
}

export interface ActionStep {
  Action: string;
  Value?: number;
  Type?: string;
  Effect?: string;
  Target?: string;
}

export interface ColorCard {
  Name: string;
  Cost: number;
  Actions: ActionStep[];
}

export interface SpeciesCard {
  Name: string;
  Cost: number;
  Actions: ActionStep[];
}

// Resolved cards for a unit after drawing for the turn
export interface DrawnCards {
  speciesCardIndex: number;
  classCardIndex: number;
}

// Activation entry computed for the turn
export interface ActivationEntry {
  unit: AdversaryUnit;
  speciesCard: SpeciesCard;
  classCard: ColorCard;
  initiative: number;       // species.Cost + classCard[color].Cost
  activationOrder: number;  // 1-based, determined after sorting
}

// Full mission configuration (setup phase output)
export interface MissionConfig {
  units: AdversaryUnit[];
  difficulty: DifficultyLevel;
}

// Runtime turn state
export interface TurnState {
  turnNumber: number;
  decks: Record<string, DeckState>;   // key: "{species}:{class}"
  activations: ActivationEntry[];     // sorted, populated after draw
  selectedUnitId: string | null;
  phase: 'setup' | 'game';
}
```

## Notes on key design decisions

**AdversaryUnit.id**: The string `"{adversaryName}:{color}"` gives each unit a stable,
human-readable identifier. Example: `"Grallok Archer:Red"`. Multiple units of the same
adversary type must have different colors - this is enforced by the picker UI in task-06.

**DeckState.speciesIndices / classIndices**: These hold shuffled indices (0-9) into the
source JSON array, not card data directly. The actual card objects are looked up at draw
time from the JSON cache in the game store. This keeps deck state serializable and small.

**ActivationEntry.classCard**: This is the color-specific `ColorCard` resolved for the
unit's color at draw time, not the raw multi-color entry. It already has the correct Name,
Cost, and Actions for that unit's color.

**TurnState.decks**: Keyed by `"{species}:{class}"` (e.g., `"Grallok:Archer"`). One deck
pair is shared across all units of the same species+class combination. See `deck.ts`
(task-03) for the `deckKey` function that produces this key.

**ColorCard vs SpeciesCard**: Class cards are color-differentiated (the same card index
has different Name/Cost/Actions per color). Species cards are not (same data for all
colors). This difference is reflected in the JSON schemas and in how `drawTurn` accesses
card data.

## Done criteria

- [ ] `src/types/game.ts` exists and contains all exported types above
- [ ] No TypeScript errors when importing from this file in another module
- [ ] All 8 species names are present in `SpeciesName`
- [ ] All 6 class names are present in `ClassName`
- [ ] All 4 colors are present in `AdversaryColor`
- [ ] `DifficultyLevel` is `0 | 1 | 2 | 3` (not a string enum)
