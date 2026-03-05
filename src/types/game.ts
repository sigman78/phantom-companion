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
  name: string;
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
  id: string;             // "{name}:{color}" e.g. "Grallok Archer:Red"
  adversaryName: string;  // key into adversary-stats
  species: SpeciesName;
  className: ClassName;
  color: AdversaryColor;
  difficulty: DifficultyLevel;
  alive: boolean;
}

// One entry in the active deck: shuffled index arrays into the source JSON
export interface DeckState {
  speciesIndices: number[];   // shuffled 0-9, head = top of deck
  classIndices: number[];
  speciesDiscard: number[];
  classDiscard: number[];
}

export interface ActionStep {
  Action: string;
  Value?: number;
  Type?: string;     // "Round" | "Reaction"
  Mod?: string;      // e.g. "Pierce 3", "Range 4", "Target 3"
  Effect?: string;   // free-text effect description
  Target?: string;   // e.g. "Self", "Primary target", "All attacks"
  Trigger?: string;  // condition text for Reaction-type actions
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

// Activation entry computed for the turn
export interface ActivationEntry {
  unit: AdversaryUnit;
  speciesCard: SpeciesCard;
  classCard: ColorCard;       // color-resolved for this unit
  initiative: number;         // speciesCard.Cost + classCard.Cost
  activationOrder: number;    // 1-based after sorting
  speciesCardIndex: number;   // drawn index for art URL
  classCardIndex: number;     // drawn index for art URL
}

// Runtime turn state
export interface TurnState {
  turnNumber: number;
  units: AdversaryUnit[];                  // all units (alive and dead)
  decks: Record<string, DeckState>;        // key: "{species}:{class}"
  activations: ActivationEntry[];          // sorted, populated after draw
  activeActivationIndex: number;           // which activation is "current" (Next/Prev)
  selectedUnitId: string | null;           // mirrors activations[activeActivationIndex].unit.id
  selectedAdversaryName: string | null;    // adversary type (pre-draw or group context)
  phase: 'game';
}
