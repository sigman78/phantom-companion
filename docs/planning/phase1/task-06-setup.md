# Task 06 - Setup Screen

## Goal

Implement the three setup phase components: `AdversaryPicker` (grid of all 22 adversary
types with color selection), `AdversaryRoster` (staged unit list with difficulty selector),
and `SetupScreen` (two-column container with Start Mission button).

## Depends on

- Task 01 (scaffold)
- Task 02 (types)
- Task 03 (`adversaries.ts`, `assets.ts`)
- Task 04 (`missionStore` actions: `addUnit`, `removeUnit`, `setDifficulty`)
- Task 05 (`AppRoot.svelte` renders `SetupScreen`)

## Files to create or modify

| Path | Role |
|---|---|
| `src/components/setup/SetupScreen.svelte` | Two-column layout; Start Mission button |
| `src/components/setup/AdversaryPicker.svelte` | Grid of adversary types; color selector |
| `src/components/setup/AdversaryRoster.svelte` | Staged unit list; difficulty dropdown |

---

## Implementation: AdversaryPicker.svelte

Displays a grid of all 22 standard adversary types. Clicking a cell opens a color
popover; selecting a color adds the unit to the mission roster.

```svelte
<script lang="ts">
  import { missionStore, addUnit } from '../../stores/missionStore';
  import { ADVERSARY_TYPES } from '../../lib/adversaries';
  import { adversaryIconUrl } from '../../lib/assets';
  import type { AdversaryColor, AdversaryUnit } from '../../types/game';

  const COLORS: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

  // Which adversary name has its color popover open (null = none)
  let openPopover: string | null = null;

  function openColorPicker(name: string) {
    openPopover = openPopover === name ? null : name;
  }

  function selectColor(adversaryName: string, color: AdversaryColor) {
    const type = ADVERSARY_TYPES.find(t => t.name === adversaryName)!;
    const unit: AdversaryUnit = {
      id: `${adversaryName}:${color}`,
      adversaryName,
      species: type.species,
      className: type.className,
      color,
      difficulty: $missionStore.difficulty,
      alive: true,
    };
    addUnit(unit);
    openPopover = null;
  }

  // Color mapping to CSS variables
  const COLOR_VAR: Record<AdversaryColor, string> = {
    Red:    'var(--color-red)',
    Blue:   'var(--color-blue)',
    Cyan:   'var(--color-cyan)',
    Yellow: 'var(--color-yellow)',
  };
</script>

<div class="picker-grid">
  {#each ADVERSARY_TYPES as type}
    {@const iconUrl = adversaryIconUrl(type.name)}
    <div class="picker-cell" on:click={() => openColorPicker(type.name)}>
      <img src={iconUrl} alt={type.name} class="adv-icon" />
      <span class="adv-name">{type.name}</span>

      {#if openPopover === type.name}
        <div class="color-popover" on:click|stopPropagation>
          {#each COLORS as color}
            <button
              class="color-btn"
              style="background: {COLOR_VAR[color]}"
              on:click={() => selectColor(type.name, color)}
              title={color}
            >
              {color}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-2);
    padding: var(--space-4);
  }

  .picker-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .picker-cell:hover {
    border-color: var(--color-accent-dim);
  }

  .adv-icon {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .adv-name {
    font-size: 11px;
    text-align: center;
    color: var(--color-text-dim);
    line-height: 1.3;
  }

  .color-popover {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    gap: var(--space-1);
    padding: var(--space-2);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
  }

  .color-btn {
    width: 28px;
    height: 28px;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    cursor: pointer;
    font-size: 0;
  }

  .color-btn:hover {
    border-color: rgba(255,255,255,0.7);
  }
</style>
```

Note: Icons load from `/game-data/art/adv-icons/{Species}_{Class}.png`. If an icon fails
to load (e.g., the file does not exist), the browser shows a broken image. Phase 1 does
not implement fallback images; all 22 standard adversary icons are expected to exist.

---

## Implementation: AdversaryRoster.svelte

Shows staged units with remove buttons, and a difficulty selector that applies to
all future units added (and used at `startGame` time).

```svelte
<script lang="ts">
  import { missionStore, removeUnit, setDifficulty } from '../../stores/missionStore';
  import type { DifficultyLevel } from '../../types/game';

  const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    0: 'Rookie',
    1: 'Warrior',
    2: 'Veteran',
    3: 'Elite',
  };

  const COLOR_VAR: Record<string, string> = {
    Red:    'var(--color-red)',
    Blue:   'var(--color-blue)',
    Cyan:   'var(--color-cyan)',
    Yellow: 'var(--color-yellow)',
  };

  function handleDifficulty(e: Event) {
    const val = Number((e.target as HTMLSelectElement).value) as DifficultyLevel;
    setDifficulty(val);
  }
</script>

<div class="roster">
  <div class="roster-header">
    <h2>Mission Roster</h2>
    <label class="difficulty-label">
      Difficulty
      <select on:change={handleDifficulty} value={$missionStore.difficulty}>
        {#each [0, 1, 2, 3] as level}
          <option value={level}>{DIFFICULTY_LABELS[level as DifficultyLevel]}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if $missionStore.roster.length === 0}
    <p class="empty-hint">Select adversaries from the left panel.</p>
  {:else}
    <ul class="unit-list">
      {#each $missionStore.roster as unit}
        <li class="unit-row">
          <span
            class="color-dot"
            style="background: {COLOR_VAR[unit.color]}"
            title={unit.color}
          ></span>
          <span class="unit-name">{unit.adversaryName}</span>
          <button class="remove-btn" on:click={() => removeUnit(unit.id)}>x</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .roster {
    padding: var(--space-4);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .roster-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-3);
  }

  h2 {
    font-family: var(--font-heading);
    font-size: 16px;
    color: var(--color-accent);
  }

  .difficulty-label {
    font-size: 12px;
    color: var(--color-text-dim);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  select {
    background: var(--color-surface-alt);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    font-size: 12px;
  }

  .empty-hint {
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 12px;
  }

  .unit-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .unit-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .unit-name {
    flex: 1;
    font-size: 13px;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-text-dim);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0 var(--space-1);
  }

  .remove-btn:hover {
    color: var(--color-red);
  }
</style>
```

---

## Implementation: SetupScreen.svelte

```svelte
<script lang="ts">
  import AdversaryPicker from './AdversaryPicker.svelte';
  import AdversaryRoster from './AdversaryRoster.svelte';
  import { missionStore, getMissionConfig } from '../../stores/missionStore';
  import { startGame, drawTurn } from '../../stores/gameStore';

  async function handleStart() {
    const config = getMissionConfig();
    await startGame(config);
    drawTurn();
  }

  $: canStart = $missionStore.roster.length > 0;
</script>

<div class="setup-screen">
  <header class="setup-header">
    <h1>Phantom Epoch - Mission Setup</h1>
    <button
      class="start-btn"
      on:click={handleStart}
      disabled={!canStart}
    >
      Start Mission
    </button>
  </header>

  <div class="setup-panels">
    <div class="picker-panel">
      <AdversaryPicker />
    </div>
    <div class="roster-panel">
      <AdversaryRoster />
    </div>
  </div>
</div>

<style>
  .setup-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .setup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
  }

  h1 {
    font-family: var(--font-heading);
    font-size: 20px;
    color: var(--color-accent);
  }

  .start-btn {
    padding: var(--space-2) var(--space-6);
    background: var(--color-accent-dim);
    color: var(--color-text);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-md);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .start-btn:hover:not(:disabled) {
    background: var(--color-accent);
  }

  .start-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .setup-panels {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .picker-panel {
    flex: 1;
    overflow-y: auto;
    border-right: 1px solid var(--color-border);
  }

  .roster-panel {
    width: 300px;
    flex-shrink: 0;
    overflow-y: auto;
  }
</style>
```

---

## Done criteria

- [ ] All 22 adversary type icons render in the picker grid (verify visually)
- [ ] Clicking a picker cell opens a 4-color popover; clicking elsewhere does not (due to
  the `|stopPropagation` on the popover and setting `openPopover = null` on re-click)
- [ ] Selecting a color adds the unit to `missionStore.roster`
- [ ] `AdversaryRoster` shows all staged units with correct names and color dots
- [ ] Remove button removes the correct unit from the roster
- [ ] Difficulty selector changes `missionStore.difficulty`
- [ ] "Start Mission" button is disabled when roster is empty
- [ ] Clicking "Start Mission" with at least one unit: calls `startGame` then `drawTurn`;
  the view transitions to the game layout in `AppRoot.svelte`
- [ ] No icon load errors in browser console for the 22 standard adversary types
