# Task 03 - Game Logic Lib Modules

## Goal

Create the four pure-logic modules in `src/lib/`: `deck.ts`, `initiative.ts`,
`adversaries.ts`, and `assets.ts`.

## Depends on

- Task 01 (project scaffold)
- Task 02 (`src/types/game.ts` complete)

## Files to create or modify

| Path | Role |
|---|---|
| `src/lib/deck.ts` | Deck creation, card draw, reshuffle |
| `src/lib/initiative.ts` | Initiative calculation, activation sorting |
| `src/lib/adversaries.ts` | Adversary registry, file/art name mappings |
| `src/lib/assets.ts` | Runtime asset URL construction |

---

## Implementation: deck.ts

```ts
import type { DeckState, SpeciesName, ClassName } from '../types/game';

// Fisher-Yates shuffle of indices 0-9
function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Create a fresh shuffled deck (no cards drawn or discarded)
export function createDeck(): DeckState {
  return {
    speciesIndices: shuffle([0,1,2,3,4,5,6,7,8,9]),
    classIndices:   shuffle([0,1,2,3,4,5,6,7,8,9]),
    speciesDiscard: [],
    classDiscard:   [],
  };
}

// Draw the top species card index. Pure: returns new DeckState.
// If speciesIndices is empty, reshuffles discard back into deck first.
function drawSpecies(deck: DeckState): { index: number; deck: DeckState } {
  let indices = deck.speciesIndices;
  let discard = deck.speciesDiscard;
  if (indices.length === 0) {
    indices = shuffle([...discard]);
    discard = [];
  }
  const [index, ...rest] = indices;
  return {
    index,
    deck: { ...deck, speciesIndices: rest, speciesDiscard: [...discard, index] },
  };
}

// Draw the top class card index. Pure: returns new DeckState.
function drawClass(deck: DeckState): { index: number; deck: DeckState } {
  let indices = deck.classIndices;
  let discard = deck.classDiscard;
  if (indices.length === 0) {
    indices = shuffle([...discard]);
    discard = [];
  }
  const [index, ...rest] = indices;
  return {
    index,
    deck: { ...deck, classIndices: rest, classDiscard: [...discard, index] },
  };
}

// Draw one species card and one class card from the deck. Pure.
export function drawCard(deck: DeckState): {
  speciesIndex: number;
  classIndex: number;
  deck: DeckState;
} {
  const { index: speciesIndex, deck: d1 } = drawSpecies(deck);
  const { index: classIndex,   deck: d2 } = drawClass(d1);
  return { speciesIndex, classIndex, deck: d2 };
}

// Canonical deck key for a species+class pair
export function deckKey(species: SpeciesName, className: ClassName): string {
  return `${species}:${className}`;
}
```

Key rules:
- All functions are pure (no mutation of input).
- `drawCard` draws exactly one species card and one class card per call.
- Reshuffle occurs automatically when the respective index array is empty.
- The drawn card index is moved to the discard pile after drawing.

---

## Implementation: initiative.ts

```ts
import type {
  AdversaryUnit, AdversaryColor, ActivationEntry,
  SpeciesCard, ColorCard
} from '../types/game';

// Color tie-break order: lower index = higher priority (activates first on tie)
const COLOR_ORDER: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

// Calculate initiative for one unit given its drawn cards
export function calcInitiative(
  unit: AdversaryUnit,
  speciesCard: SpeciesCard,
  classCardEntry: Record<AdversaryColor, ColorCard>
): number {
  return speciesCard.Cost + classCardEntry[unit.color].Cost;
}

// Sort activation entries: higher initiative first; tie-break by COLOR_ORDER
export function sortActivations(entries: ActivationEntry[]): ActivationEntry[] {
  return [...entries].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    return COLOR_ORDER.indexOf(a.unit.color) - COLOR_ORDER.indexOf(b.unit.color);
  });
}

// Assign 1-based activationOrder after sorting. Mutates copies, not originals.
export function numberActivations(entries: ActivationEntry[]): ActivationEntry[] {
  return entries.map((e, i) => ({ ...e, activationOrder: i + 1 }));
}
```

Notes:
- `calcInitiative` takes the full multi-color class card entry so it can look up the
  correct color row. The caller passes the raw class JSON entry (the object with Red/Blue/
  Cyan/Yellow keys), not a pre-resolved ColorCard.
- `sortActivations` is stable for same-initiative, same-color units (preserves draw order,
  treated as simultaneous in Phase 1).
- Call order: `sortActivations` first, then `numberActivations`.

---

## Implementation: adversaries.ts

```ts
import type { AdversaryType, ClassName, SpeciesName } from '../types/game';

// All 22 standard adversary types (bosses excluded)
// Bosses excluded: "Mutant Grallok", "Sarhanna", "Lindor"
export const ADVERSARY_TYPES: AdversaryType[] = [
  { name: 'Grallok Archer',        species: 'Grallok', className: 'Archer' },
  { name: 'Grallok Berserker',     species: 'Grallok', className: 'Berserker' },
  { name: 'Grallok Scout',         species: 'Grallok', className: 'Scout' },
  { name: 'Grallok Sentry',        species: 'Grallok', className: 'Sentry' },
  { name: 'Gryllo Scout',          species: 'Gryllo',  className: 'Scout' },
  { name: 'Gryllo Wild Beast',     species: 'Gryllo',  className: 'Wild Beast' },
  { name: 'Human Archer',          species: 'Human',   className: 'Archer' },
  { name: 'Human Berserker',       species: 'Human',   className: 'Berserker' },
  { name: 'Human Scout',           species: 'Human',   className: 'Scout' },
  { name: 'Human Sentry',          species: 'Human',   className: 'Sentry' },
  { name: 'Lypran Archer',         species: 'Lypran',  className: 'Archer' },
  { name: 'Lypran Scout',          species: 'Lypran',  className: 'Scout' },
  { name: 'Lypran Trained Beast',  species: 'Lypran',  className: 'Trained Beast' },
  { name: 'Other Scout',           species: 'Other',   className: 'Scout' },
  { name: 'Slink Scout',           species: 'Slink',   className: 'Scout' },
  { name: 'Slink Sentry',          species: 'Slink',   className: 'Sentry' },
  { name: 'Timeless Archer',       species: 'Timeless',className: 'Archer' },
  { name: 'Timeless Sentry',       species: 'Timeless',className: 'Sentry' },
  { name: 'Wolf Scout',            species: 'Wolf',    className: 'Scout' },
  { name: 'Wolf Trained Beast',    species: 'Wolf',    className: 'Trained Beast' },
  { name: 'Wolf Wild Beast',       species: 'Wolf',    className: 'Wild Beast' },
  { name: 'Wolf Berserker',        species: 'Wolf',    className: 'Berserker' },
];

// Bosses to exclude from the adversary picker
export const BOSS_NAMES = ['Mutant Grallok', 'Sarhanna', 'Lindor'] as const;

// Class JSON filenames (relative to /game-data/data/class/)
export const CLASS_FILE: Record<ClassName, string> = {
  'Archer':       'archer-actions.json',
  'Berserker':    'berserker-actions.json',
  'Scout':        'scout-actions.json',
  'Sentry':       'sentry-actions.json',
  'Trained Beast':'trained-beast-actions.json',
  'Wild Beast':   'wild-beast-actions.json',
};

// Species JSON filenames (relative to /game-data/data/species/)
export const SPECIES_FILE: Record<SpeciesName, string> = {
  'Grallok': 'grallok-actions.json',
  'Gryllo':  'gryllo-actions.json',
  'Human':   'human-actions.json',
  'Lypran':  'lypran-actions.json',
  'Other':   'other-actions.json',
  'Slink':   'slink-actions.json',
  'Timeless':'timeless-actions.json',
  'Wolf':    'wolf-actions.json',
};

// Art filename prefixes for class cards (used in assets.ts)
export const CLASS_ART_PREFIX: Record<ClassName, string> = {
  'Archer':       'archer',
  'Berserker':    'berserker',
  'Scout':        'scout',
  'Sentry':       'sentry',
  'Trained Beast':'trained_beast',
  'Wild Beast':   'wild_beast',
};

// Art filename prefixes for species cards (used in assets.ts)
export const SPECIES_ART_PREFIX: Record<SpeciesName, string> = {
  'Grallok': 'grallok',
  'Gryllo':  'gryllo',
  'Human':   'human',
  'Lypran':  'lypran',
  'Other':   'other',
  'Slink':   'slink',
  'Timeless':'timeless',
  'Wolf':    'wolf',
};
```

Note: The `ADVERSARY_TYPES` list of 22 entries must match the canonical list in
`data/data/adversaries.txt`. If that file has a different count, adjust to match it.
The list above is the expected set based on the data files; verify against the actual
`adversary-stats.json` keys (excluding the 3 bosses).

---

## Implementation: assets.ts

```ts
import type { ClassName, SpeciesName } from '../types/game';
import { CLASS_ART_PREFIX, SPECIES_ART_PREFIX } from './adversaries';

const BASE_CLASS_ART  = '/game-data/art/adv-class-actions';
const BASE_SPECIES_ART = '/game-data/art/adv-species-actions';
const BASE_ICONS      = '/game-data/art/adv-icons';

// Class card face art: e.g. /game-data/art/adv-class-actions/archer_act3.png
export function classCardArtUrl(className: ClassName, cardIndex: number): string {
  const prefix = CLASS_ART_PREFIX[className];
  return `${BASE_CLASS_ART}/${prefix}_act${cardIndex}.png`;
}

// Class card back art.
// SPECIAL CASE: Trained Beast back is "trainer_beast_back.png" (typo in asset folder),
// NOT "trained_beast_back.png". This must be hardcoded.
export function classCardBackUrl(className: ClassName): string {
  if (className === 'Trained Beast') {
    return `${BASE_CLASS_ART}/trainer_beast_back.png`;
  }
  const prefix = CLASS_ART_PREFIX[className];
  return `${BASE_CLASS_ART}/${prefix}_back.png`;
}

// Species card face art: e.g. /game-data/art/adv-species-actions/grallok_act0.png
export function speciesCardArtUrl(species: SpeciesName, cardIndex: number): string {
  const prefix = SPECIES_ART_PREFIX[species];
  return `${BASE_SPECIES_ART}/${prefix}_act${cardIndex}.png`;
}

// Species card back art: e.g. /game-data/art/adv-species-actions/grallok_back.png
export function speciesCardBackUrl(species: SpeciesName): string {
  const prefix = SPECIES_ART_PREFIX[species];
  return `${BASE_SPECIES_ART}/${prefix}_back.png`;
}

// Adversary icon: "Grallok Archer" -> /game-data/art/adv-icons/Grallok_Archer.png
// Rule: replace spaces with underscores. Name is already Title Case.
// Multi-word classes: "Grallok Wild Beast" -> "Grallok_Wild_Beast.png"
export function adversaryIconUrl(adversaryName: string): string {
  const filename = adversaryName.replace(/ /g, '_') + '.png';
  return `${BASE_ICONS}/${filename}`;
}

// Portrait: reuse icon for Phase 1 (no separate portrait art)
export function adversaryPortraitUrl(adversaryName: string): string {
  return adversaryIconUrl(adversaryName);
}
```

Critical notes:
- `trainer_beast_back.png` is the actual filename in `data/art/adv-class-actions/`.
  The regular pattern would produce `trained_beast_back.png`, which does not exist.
  The special case in `classCardBackUrl` must not be removed or generalized away.
- Card indices are 0-9 (matching JSON array indices). Art files are named `_act0.png`
  through `_act9.png`.
- All URLs start with `/game-data/` (served from `public/game-data` symlink).

---

## Done criteria

- [ ] `src/lib/deck.ts` - `createDeck()` returns a DeckState with 10 shuffled indices in
  each pile and empty discards
- [ ] `drawCard` returns new deck state without mutating input; drawn index appears in
  discard of returned state
- [ ] `drawCard` called 11 times on a fresh deck triggers reshuffle (no index out of
  bounds, no undefined returned)
- [ ] `src/lib/initiative.ts` - `calcInitiative` returns `speciesCard.Cost + colorCard.Cost`
- [ ] `sortActivations` orders higher initiative first; same initiative uses Red > Blue >
  Cyan > Yellow order
- [ ] `src/lib/adversaries.ts` - `ADVERSARY_TYPES.length === 22`
- [ ] `CLASS_FILE['Trained Beast'] === 'trained-beast-actions.json'`
- [ ] `CLASS_ART_PREFIX['Wild Beast'] === 'wild_beast'`
- [ ] `src/lib/assets.ts` - `classCardBackUrl('Trained Beast')` returns a URL containing
  `trainer_beast_back.png` (not `trained_beast_back.png`)
- [ ] `adversaryIconUrl('Grallok Wild Beast')` returns `.../Grallok_Wild_Beast.png`
- [ ] No TypeScript errors across all four files
