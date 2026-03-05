# Phase 1 Implementation Plan - Phantom Epoch Companion App

## Overview

Single-page web app built with Astro + Svelte + TypeScript. Core value: automated
adversary initiative calculation and activation ordering, eliminating manual bookkeeping
during play.

Target: fullscreen dark-themed SPA for laptop/tablet browsers.

---

## 1. Project Scaffold

### Commands

```bash
npm create astro@latest phantom-companion -- --template minimal --typescript strict --no-install
cd phantom-companion
npx astro add svelte
npm install
```

### Directory structure after scaffold

```
phantom-companion/
  astro.config.mjs
  tsconfig.json
  package.json
  public/
    game-data -> ../data          # symlink (see Asset Integration)
  src/
    pages/
      index.astro                 # single page entry
    layouts/
      AppShell.astro              # <html>, global CSS link, slot
    components/
      AppRoot.svelte              # phase router (setup vs game)
      setup/
        SetupScreen.svelte
        AdversaryPicker.svelte
        AdversaryRoster.svelte
      game/
        ActivationList.svelte
        ActivationRow.svelte
        ColorBadge.svelte
        AdversaryDetail.svelte
        PortraitFrame.svelte
        StatsBlock.svelte
        CardDisplay.svelte
      shared/
        BottomBar.svelte
    stores/
      missionStore.ts
      gameStore.ts
    lib/
      deck.ts
      initiative.ts
      adversaries.ts
      assets.ts
    types/
      game.ts
    styles/
      global.css
      tokens.css
```

### astro.config.mjs

```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [svelte()],
  vite: {
    resolve: {
      alias: {
        '$data': '/public/game-data/data',
        '$art':  '/public/game-data/art',
      }
    }
  }
});
```

### tsconfig.json additions

```json
{
  "compilerOptions": {
    "paths": {
      "$data/*": ["./public/game-data/data/*"],
      "$art/*":  ["./public/game-data/art/*"]
    }
  }
}
```

---

## 2. Data File Locations

All paths relative to project root:

| Asset | Path |
|---|---|
| Adversary stats | `data/data/adversary-stats.json` |
| Class decks | `data/data/class/{class-name}-actions.json` |
| Species decks | `data/data/species/{species-name}-actions.json` |
| Class card art | `data/art/adv-class-actions/{class}_act{n}.png` |
| Class card backs | `data/art/adv-class-actions/{class}_back.png` |
| Species card art | `data/art/adv-species-actions/{species}_act{n}.png` |
| Species card backs | `data/art/adv-species-actions/{species}_back.png` |
| Adversary icons | `data/art/adv-icons/{Species}_{Class}.png` |

### File name key mappings

Class JSON filenames and art prefixes:

| Class name | JSON file | Art prefix |
|---|---|---|
| Archer | `archer-actions.json` | `archer` |
| Berserker | `berserker-actions.json` | `berserker` |
| Scout | `scout-actions.json` | `scout` |
| Sentry | `sentry-actions.json` | `sentry` |
| Trained Beast | `trained-beast-actions.json` | `trained_beast` |
| Wild Beast | `wild-beast-actions.json` | `wild_beast` |

Species JSON filenames and art prefixes:

| Species name | JSON file | Art prefix |
|---|---|---|
| Grallok | `grallok-actions.json` | `grallok` |
| Gryllo | `gryllo-actions.json` | `gryllo` |
| Human | `human-actions.json` | `human` |
| Lypran | `lypran-actions.json` | `lypran` |
| Other | `other-actions.json` | `other` |
| Slink | `slink-actions.json` | `slink` |
| Timeless | `timeless-actions.json` | `timeless` |
| Wolf | `wolf-actions.json` | `wolf` |

Icon file naming: `{Species}_{Class}.png` with Title_Case and underscores.
Examples: `Grallok_Archer.png`, `Gryllo_Wild_Beast.png`, `Wolf_Trained_Beast.png`.

### Known data quirks

1. **trainer_beast_back.png typo**: The class card back for Trained Beast is named
   `trainer_beast_back.png`, not `trained_beast_back.png`. The `assets.ts` module must
   hardcode this exception.

2. **Boss exclusions**: `Mutant Grallok`, `Sarhanna`, and `Lindor` appear in
   `adversary-stats.json` but have no class or species card decks. They must be excluded
   from the adversary picker in Phase 1.

3. **adversary-stats.json location**: The file lives at `data/data/adversary-stats.json`,
   not `data/adversary-stats.json`.

4. **22 standard adversaries**: The canonical list from `data/data/adversaries.txt` is the
   authoritative source. It excludes the 3 bosses.

---

## 3. JSON Data Schemas

### adversary-stats.json

Top-level object keyed by adversary name (`"Grallok Archer"`, etc.). Each value is an
array of 4 stat blocks, one per difficulty level (index 0 = easiest).

```ts
interface AdversaryStatBlock {
  HP: number;
  GUARD: number;
  ATTACK: number;
  RANGE: number;
  CRIT: string;
}
// adversary-stats.json root: Record<string, AdversaryStatBlock[]>
```

### Class card JSON (`{class}-actions.json`)

Array of card entries (10 cards per deck). Each entry is an object keyed by color
(`"Red"`, `"Blue"`, `"Cyan"`, `"Yellow"`). The same card index has different names,
costs, and actions per color.

```ts
interface ActionStep {
  Action: string;       // "Attack", "Move", "Guard", etc.
  Value?: number;
  Type?: string;        // "Round" for round-duration effects
  Effect?: string;      // supplemental text
  Target?: string;      // targeting clarification
}

interface ColorCard {
  Name: string;
  Cost: number;         // this color's AP contribution to initiative
  Actions: ActionStep[];
}

// class card entry: Record<"Red"|"Blue"|"Cyan"|"Yellow", ColorCard>
// class deck: Array of 10 such entries
```

### Species card JSON (`{species}-actions.json`)

Array of card entries (10 cards per deck). Each entry is flat - no color differentiation.
Species cards apply equally regardless of unit color; only their Cost contributes to
initiative.

```ts
interface SpeciesCard {
  Name: string;
  Cost: number;         // AP contribution to initiative (all colors)
  Actions: ActionStep[];
}
// species deck: SpeciesCard[] (length 10)
```

---

## 4. TypeScript Domain Types (`src/types/game.ts`)

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

---

## 5. Game Logic Modules (`src/lib/`)

### `deck.ts` - Deck management

```ts
// Create a new shuffled deck (indices 0-9 in random order)
export function createDeck(): DeckState

// Draw the top card index; reshuffle discard if deck is empty
export function drawCard(deck: DeckState): { index: number; deck: DeckState }

// Deck key for a species+class pair (used as key in TurnState.decks)
export function deckKey(species: SpeciesName, className: ClassName): string
```

Implementation notes:
- Shuffle uses Fisher-Yates.
- `drawCard` is pure: returns new `DeckState` without mutating input.
- When `speciesIndices` is empty, move `speciesDiscard` back to `speciesIndices`,
  re-shuffle, then draw. Same for class.

### `initiative.ts` - Initiative and activation sorting

```ts
// Calculate initiative for a unit given its drawn cards
export function calcInitiative(
  unit: AdversaryUnit,
  speciesCard: SpeciesCard,
  classCardEntry: Record<AdversaryColor, ColorCard>
): number

// Sort activation entries by initiative descending, tie-break by color order
export function sortActivations(entries: ActivationEntry[]): ActivationEntry[]

// Assign activationOrder (1-based) after sorting
export function numberActivations(entries: ActivationEntry[]): ActivationEntry[]
```

Initiative formula: `speciesCard.Cost + classCardEntry[unit.color].Cost`

Color tie-break order (lower index = higher priority):
`['Red', 'Blue', 'Cyan', 'Yellow']`

If two units have the same initiative AND the same color, they activate simultaneously
(preserve insertion order in Phase 1 - true simultaneous resolution is out of scope).

### `adversaries.ts` - Adversary registry

```ts
// All 22 standard adversary types (bosses excluded)
export const ADVERSARY_TYPES: AdversaryType[]

// Map class name to JSON file path (relative to $data/class/)
export const CLASS_FILE: Record<ClassName, string>

// Map species name to JSON file path (relative to $data/species/)
export const SPECIES_FILE: Record<SpeciesName, string>

// Map class name to art prefix for card images
export const CLASS_ART_PREFIX: Record<ClassName, string>

// Map species name to art prefix for card images
export const SPECIES_ART_PREFIX: Record<SpeciesName, string>

// Bosses to exclude from picker
export const BOSS_NAMES = ['Mutant Grallok', 'Sarhanna', 'Lindor'] as const
```

The `CLASS_FILE` and `CLASS_ART_PREFIX` maps must hardcode `"Trained Beast"` ->
`"trained-beast-actions.json"` / `"trained_beast"` (and the back art exception is
handled in `assets.ts`).

### `assets.ts` - Asset URL construction

```ts
// Card art URL (served from /game-data/art/...)
export function classCardArtUrl(className: ClassName, cardIndex: number): string
export function classCardBackUrl(className: ClassName): string
export function speciesCardArtUrl(species: SpeciesName, cardIndex: number): string
export function speciesCardBackUrl(species: SpeciesName): string
export function adversaryIconUrl(adversaryName: string): string

// Portrait: use icon as stand-in for Phase 1 (no separate portrait art)
export function adversaryPortraitUrl(adversaryName: string): string
```

`classCardBackUrl` must special-case `"Trained Beast"` to return
`/game-data/art/adv-class-actions/trainer_beast_back.png`.

All other classes and species follow the regular pattern:
`/game-data/art/adv-class-actions/{prefix}_back.png`

Icon URL: `adversaryIconUrl` converts `"Grallok Archer"` ->
`/game-data/art/adv-icons/Grallok_Archer.png` by replacing spaces with `_`.

---

## 6. Svelte Stores (`src/stores/`)

### `missionStore.ts`

Holds setup configuration before a game starts.

```ts
interface MissionStore {
  roster: AdversaryUnit[];     // units staged by player
  difficulty: DifficultyLevel;
}

// Exported store
export const missionStore: Writable<MissionStore>

// Actions (exported functions, not methods)
export function addUnit(unit: AdversaryUnit): void
export function removeUnit(unitId: string): void
export function setDifficulty(level: DifficultyLevel): void
export function clearRoster(): void
```

### `gameStore.ts`

Central runtime store. Derived from missionStore data at game start; owns all turn state.

```ts
interface GameStore {
  phase: 'setup' | 'game';
  turn: TurnState;
  jsonCache: {
    class: Partial<Record<ClassName, Array<Record<AdversaryColor, ColorCard>>>>;
    species: Partial<Record<SpeciesName, SpeciesCard[]>>;
  };
}

export const gameStore: Writable<GameStore>

// Derived
export const activations: Readable<ActivationEntry[]>
export const selectedUnit: Readable<AdversaryUnit | null>
export const currentTurn: Readable<number>

// Actions
export async function startGame(config: MissionConfig): Promise<void>
export function drawTurn(): void         // draw cards for all units, compute activations
export function endTurn(): void          // increment turn counter, clear activations
export function selectUnit(id: string): void
export function markUnitDead(id: string): void
export function reviveUnit(id: string): void
export function addUnitMidGame(unit: AdversaryUnit): Promise<void>
export function removeUnitMidGame(id: string): void
```

`startGame` loads all required JSON files asynchronously, populates `jsonCache`, creates
fresh decks for each unique species+class combination, then sets `phase = 'game'`.

`drawTurn` iterates living units, draws one species card and one class card per unique
species+class deck pair, looks up card data from cache, computes initiative, and populates
`activations` via `sortActivations` + `numberActivations`.

Each unique species+class combination shares one pair of decks (not one deck per unit).
For example: if two Red Grallok Archers are on the board, they share the Grallok and
Archer decks. Both draw from the same deck sequentially.

Wait - re-reading the rules: "draw 1 species card + 1 class card per active species/class
type" means one draw per unique type present, not per unit. The same drawn card applies
to all units of that type for initiative that turn.

So: group living units by `{species}:{class}`. For each group, draw one species card and
one class card. All units in the group share the same drawn cards (and same initiative
base), differentiated only by color (which affects which color row of the class card is
used).

### JSON loading strategy

Load JSON at `startGame` time using `fetch('/game-data/data/class/{file}')` and
`fetch('/game-data/data/species/{file}')`. Cache results in `gameStore.jsonCache`.
Only load files needed for units in the current mission. Subsequent `drawTurn` calls
read from cache (no network requests during play).

---

## 7. Component Breakdown

### `AppRoot.svelte`

Reads `gameStore.phase`. Renders `<SetupScreen>` or the game layout (split view). No
props needed; derives phase from store.

### Setup Phase Components

**`SetupScreen.svelte`**
- Contains `AdversaryPicker` (left) and `AdversaryRoster` (right)
- "Start Mission" button: calls `startGame`, then `drawTurn`
- Disabled until roster has at least one unit

**`AdversaryPicker.svelte`**
- Renders a grid of all 22 standard adversary types
- Each cell shows the adversary icon and name
- Clicking opens a color selector popover (Red / Blue / Cyan / Yellow)
- After color selection, creates an `AdversaryUnit` and calls `addUnit`
- Props: none (reads `missionStore.roster` to indicate already-added units)

**`AdversaryRoster.svelte`**
- List of staged units with remove button
- Difficulty selector (Rookie / Warrior / Veteran / Elite) affects `missionStore.difficulty`
- Props: none (reads `missionStore`)

### Game Phase Components

**`ActivationList.svelte`**
- Renders sorted `activations` list
- Highlights selected unit
- Props: `activations: ActivationEntry[]`, `selectedId: string | null`
- Emits: `select(unitId: string)`

**`ActivationRow.svelte`**
- Single row in the activation list
- Shows: activation number, adversary icon, name, color badge, initiative value
- Props: `entry: ActivationEntry`, `selected: boolean`
- Emits: `select`

**`ColorBadge.svelte`**
- Small colored circle/pill showing unit color
- Props: `color: AdversaryColor`

**`AdversaryDetail.svelte`**
- Right panel: portrait, stats, drawn cards
- Props: `unit: AdversaryUnit | null`, `activation: ActivationEntry | null`
- Contains `PortraitFrame`, `StatsBlock`, `CardDisplay` x2

**`PortraitFrame.svelte`**
- Shows adversary icon (used as portrait in Phase 1)
- Props: `adversaryName: string`

**`StatsBlock.svelte`**
- HP / GUARD / ATTACK / RANGE / CRIT in a readable table
- Props: `stats: AdversaryStatBlock`

**`CardDisplay.svelte`**
- Shows one action card (species or class)
- Card face: art image + name + Cost + actions list
- Card back shown when no card drawn yet
- Props: `type: 'species'|'class'`, `card: SpeciesCard | ColorCard | null`,
  `cardIndex: number | null`, `species?: SpeciesName`, `className?: ClassName`,
  `color?: AdversaryColor`

**`BottomBar.svelte`**
- Turn counter display
- "Draw Turn" button (enabled when activations is empty)
- "End Turn" button (enabled when activations exist)
- "Manage Roster" button (opens mid-mission overlay)
- Props: none (reads gameStore)

### Shared

**`AppShell.astro`** (layout)
- `<html lang="en">`, `<head>` with meta/title, global CSS link
- Dark background `<body>` with `<slot />`

---

## 8. Page Structure (`src/pages/index.astro`)

```astro
---
import AppShell from '../layouts/AppShell.astro';
import AppRoot from '../components/AppRoot.svelte';
---

<AppShell>
  <AppRoot client:load />
</AppShell>
```

`client:load` hydrates immediately on page load. No SSR data fetching - all data is
loaded client-side via fetch from the `/game-data/` public path.

---

## 9. Asset Integration

### Public symlink

Create once, tracked in version control:

```bash
# Windows (run as admin or with developer mode enabled):
cd public
mklink /D game-data ..\data

# Or use junction (no admin required):
mklink /J game-data ..\data
```

Add `public/game-data` to `.gitignore` if the symlink is machine-local, or commit it
if it works cross-platform. On Linux/macOS:

```bash
cd public && ln -s ../data game-data
```

This makes all art available at runtime URLs like:
- `/game-data/art/adv-icons/Grallok_Archer.png`
- `/game-data/data/class/berserker-actions.json`
- `/game-data/art/adv-class-actions/berserker_act3.png`

No file copying needed; the 115 MB data folder stays in one place.

---

## 10. CSS Design System (`src/styles/`)

### tokens.css

```css
:root {
  /* Color palette */
  --color-bg:          #0e0c0a;
  --color-surface:     #1a1714;
  --color-surface-alt: #231f1b;
  --color-border:      #3a3028;
  --color-text:        #d4c9b8;
  --color-text-dim:    #8a7e70;
  --color-accent:      #b87333;   /* copper/brass */
  --color-accent-dim:  #7a4e22;

  /* Unit colors */
  --color-red:    #c0392b;
  --color-blue:   #2980b9;
  --color-cyan:   #16a085;
  --color-yellow: #d4ac0d;

  /* Skeuomorphic texture tints */
  --texture-leather: rgba(92, 60, 30, 0.15);
  --texture-wood:    rgba(60, 40, 20, 0.12);

  /* Layout */
  --panel-left-width:  66%;
  --panel-right-width: 34%;
  --bottom-bar-height: 56px;

  /* Typography */
  --font-body:    'Segoe UI', system-ui, sans-serif;
  --font-heading: Georgia, 'Times New Roman', serif;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius */
  --radius-sm: 3px;
  --radius-md: 6px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-inset: inset 0 1px 3px rgba(0,0,0,0.5);
  --shadow-card:  0 2px 8px rgba(0,0,0,0.6);
  --shadow-panel: 0 0 24px rgba(0,0,0,0.8);
}
```

### global.css

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
}

#app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.game-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel-left {
  width: var(--panel-left-width);
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
}

.panel-right {
  width: var(--panel-right-width);
  overflow-y: auto;
}
```

### Skeuomorphic accent strategy

Use CSS `background-image` linear-gradient overlays and box-shadow rather than real
textures. Key areas:

- **Card faces**: subtle inner shadow + slight warm tint
- **Panel headers**: thin 1px `var(--color-accent)` top border to suggest brass trim
- **Bottom bar**: `background: var(--color-surface-alt)` with top border
- **Activation rows**: hover state adds a leather-tint background via `var(--texture-leather)`
- **Selected row**: left border 3px `var(--color-accent)` + slight highlight

---

## 11. Ordered Implementation Steps

### Step 1: Project scaffold

```bash
npm create astro@latest . -- --template minimal --typescript strict
npx astro add svelte
```

Set up `astro.config.mjs` with Svelte integration and Vite aliases. Create public
symlink to `../data`. Verify `/game-data/data/adversary-stats.json` is reachable in
browser devtools.

### Step 2: Types and data layer

Create `src/types/game.ts` with all interfaces from Section 4.

Create `src/lib/adversaries.ts` with the full `ADVERSARY_TYPES` array (22 entries),
all file mapping records, and boss exclusion list.

Create `src/lib/assets.ts` with URL construction functions. Include the
`trainer_beast_back.png` special case.

Create `src/lib/deck.ts` with `createDeck`, `drawCard`, `deckKey`.

Create `src/lib/initiative.ts` with `calcInitiative`, `sortActivations`,
`numberActivations`.

### Step 3: Svelte stores

Create `src/stores/missionStore.ts`.

Create `src/stores/gameStore.ts` with all action functions. Test `startGame` in browser
console by importing and calling with a minimal config.

### Step 4: AppShell + AppRoot + global CSS

Create `src/styles/tokens.css` and `src/styles/global.css`.

Create `src/layouts/AppShell.astro` linking global CSS.

Create `src/pages/index.astro` using the shell and mounting `<AppRoot client:load />`.

Create `src/components/AppRoot.svelte` as a phase router. Initially just show a
placeholder for each phase to verify hydration works.

### Step 5: Setup screen

Implement `AdversaryPicker.svelte` - the adversary grid is the most data-intensive
component. Verify icon images load correctly for all 22 types.

Implement `AdversaryRoster.svelte` with unit list and difficulty selector.

Implement `SetupScreen.svelte` as the two-column container.

### Step 6: Bottom bar and navigation shell

Implement `BottomBar.svelte` with "Draw Turn" / "End Turn" / "Manage Roster" buttons.

Wire game layout in `AppRoot.svelte`: two panels + bottom bar.

### Step 7: Activation list

Implement `ColorBadge.svelte`, `ActivationRow.svelte`, `ActivationList.svelte`.

Connect to `gameStore.activations`. Test with a real mission start + draw.

### Step 8: Adversary detail panel

Implement `PortraitFrame.svelte`, `StatsBlock.svelte`, `CardDisplay.svelte`,
`AdversaryDetail.svelte`.

Verify card art loads at correct indices for both species and class cards.

### Step 9: Mid-mission roster management

Add an overlay/modal triggered by "Manage Roster" button.

Overlay allows: marking units dead/alive, adding new units (with JSON reload for new
types), removing units.

Keep this minimal for Phase 1: a simple list with toggle and add button.

### Step 10: Styling pass

Apply CSS custom properties throughout all components.

Ensure skeuomorphic accents (brass borders, leather hover tints, card shadows) are
consistent.

Test at 1280x800, 1440x900, and 1920x1080 viewports. Verify no content overflow.

### Step 11: Edge cases and polish

- Empty mission guard: disable "Start Mission" when roster is empty
- Deck reshuffle: verify `drawCard` reshuffles correctly when deck runs out (every 10
  turns for a single species/class combination)
- `trainer_beast_back.png` typo: confirm the special case in `assets.ts` is exercised
  by adding a Trained Beast unit and verifying the back image loads
- All-dead scenario: if all units are marked dead, "Draw Turn" should show a message
  or be disabled

---

## 12. Derived Value Notes

**Active units**: `gameStore.turn.units.filter(u => u.alive)`

**Unique deck keys for a mission**: extract `new Set(activeUnits.map(u => deckKey(u.species, u.className)))`. One deck pair per unique species+class combination.

**Draw sequence**: For each unique deck key, draw one card from each deck. All units
sharing that key get the same drawn cards for the turn.

**Initiative for unit of color C**: `speciesCard.Cost + classCards[cardIndex][C].Cost`
where `cardIndex` is the drawn class card index for that type.

**Class card data access**: `classJson[cardIndex][color]` returns a `ColorCard` with
the color-specific name, cost, and actions.

**Species card data access**: `speciesJson[cardIndex]` returns a `SpeciesCard` directly.

---

## 13. Missing Icon Handling

`Mutant Grallok` does not have an entry in `adv-icons/`. Since it is excluded from Phase
1, this is not a concern. `Sarhanna` and `Lindor` icons do exist (`Sarhanna.png`,
`Lindor.png`) but are unused in Phase 1.

For the `Other` species (used in `Other Scout`), the icon is `Other_Scout.png` which
exists. The species art prefix is `other` (lowercase), so `other_act0.png` through
`other_act9.png` are used for card art.

---

## 14. Implementation Checklist

- [ ] Project scaffolded and Vite dev server running
- [ ] Public symlink to `../data` working (verify in browser)
- [ ] `src/types/game.ts` complete with all interfaces
- [ ] `src/lib/adversaries.ts` - all 22 adversary types, file mappings correct
- [ ] `src/lib/assets.ts` - URL functions, `trainer_beast_back.png` special case
- [ ] `src/lib/deck.ts` - shuffle, draw, reshuffle
- [ ] `src/lib/initiative.ts` - calcInitiative, sort, number
- [ ] `missionStore.ts` - setup state and actions
- [ ] `gameStore.ts` - game state, startGame (async JSON load), drawTurn, endTurn
- [ ] `AppShell.astro` + `index.astro` - page entry
- [ ] Global CSS with tokens
- [ ] `AppRoot.svelte` - phase routing
- [ ] `SetupScreen.svelte` with picker and roster
- [ ] `BottomBar.svelte` with turn controls
- [ ] `ActivationList.svelte` + `ActivationRow.svelte` + `ColorBadge.svelte`
- [ ] `AdversaryDetail.svelte` with portrait, stats, cards
- [ ] Mid-mission roster overlay
- [ ] Styling pass complete
- [ ] Edge cases tested (empty roster, deck reshuffle, all dead)
