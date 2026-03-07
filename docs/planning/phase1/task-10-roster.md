# Task 10 - Mid-Mission Roster Overlay

## Goal

Implement a minimal overlay/modal triggered by the "Manage Roster" button in the bottom
bar. The overlay allows marking units dead or alive, adding new adversary units mid-game,
and removing units from the mission.

## Depends on

- Task 01 (scaffold)
- Task 02 (types: `AdversaryUnit`, `AdversaryColor`, `DifficultyLevel`)
- Task 03 (`adversaries.ts`: `ADVERSARY_TYPES`; `assets.ts`: `adversaryIconUrl`)
- Task 04 (`gameStore` actions: `markUnitDead`, `reviveUnit`, `addUnitMidGame`,
  `removeUnitMidGame`)
- Task 07 (`AppRoot.svelte` has `rosterOpen` state and overlay backdrop)

## Files to create or modify

| Path | Role |
|---|---|
| `src/components/game/RosterOverlay.svelte` | Modal overlay for mid-game roster management |
| `src/components/AppRoot.svelte` | Replace overlay placeholder with real component |

---

## Implementation: RosterOverlay.svelte

The overlay is a floating panel centered over the game layout. It has three sections:
1. Current units list (toggle alive/dead, remove)
2. Add unit section (picker + color selector)
3. Close button

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { gameStore, markUnitDead, reviveUnit, addUnitMidGame, removeUnitMidGame }
    from '../../stores/gameStore';
  import { ADVERSARY_TYPES } from '../../lib/adversaries';
  import { adversaryIconUrl } from '../../lib/assets';
  import type { AdversaryColor, AdversaryUnit } from '../../types/game';

  const dispatch = createEventDispatcher<{ close: void }>();

  const COLORS: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

  const COLOR_VAR: Record<AdversaryColor, string> = {
    Red:    'var(--color-red)',
    Blue:   'var(--color-blue)',
    Cyan:   'var(--color-cyan)',
    Yellow: 'var(--color-yellow)',
  };

  // Add unit panel state
  let addPickerOpen = false;
  let addSelectedName: string | null = null;
  let addSelectedColor: AdversaryColor | null = null;

  $: units = $gameStore.turn.units;

  async function handleAdd() {
    if (!addSelectedName || !addSelectedColor) return;
    const type = ADVERSARY_TYPES.find(t => t.name === addSelectedName)!;
    const unit: AdversaryUnit = {
      id: `${addSelectedName}:${addSelectedColor}`,
      adversaryName: addSelectedName,
      species: type.species,
      className: type.className,
      color: addSelectedColor,
      difficulty: $gameStore.turn.units[0]?.difficulty ?? 1,
      alive: true,
    };
    await addUnitMidGame(unit);
    addSelectedName  = null;
    addSelectedColor = null;
    addPickerOpen    = false;
  }

  function close() {
    dispatch('close');
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="overlay-backdrop" on:click|self={close}>
  <div class="overlay-panel">
    <div class="overlay-header">
      <h2>Manage Roster</h2>
      <button class="close-btn" on:click={close}>Close</button>
    </div>

    <!-- Current units -->
    <section class="section">
      <h3>Active Mission Units</h3>
      {#if units.length === 0}
        <p class="hint">No units in mission.</p>
      {:else}
        <ul class="unit-list">
          {#each units as unit}
            <li class="unit-item" class:dead={!unit.alive}>
              <img
                src={adversaryIconUrl(unit.adversaryName)}
                alt=""
                class="unit-icon"
                aria-hidden="true"
              />
              <span
                class="color-dot"
                style="background: {COLOR_VAR[unit.color]}"
              ></span>
              <span class="unit-name">{unit.adversaryName}</span>

              <button
                class="toggle-btn"
                on:click={() => unit.alive ? markUnitDead(unit.id) : reviveUnit(unit.id)}
              >
                {unit.alive ? 'Mark Dead' : 'Revive'}
              </button>
              <button
                class="remove-btn"
                on:click={() => removeUnitMidGame(unit.id)}
              >
                Remove
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <!-- Add unit -->
    <section class="section">
      <h3>Add Unit</h3>
      <button class="ctrl-btn" on:click={() => addPickerOpen = !addPickerOpen}>
        {addPickerOpen ? 'Cancel' : 'Choose Adversary'}
      </button>

      {#if addPickerOpen}
        <div class="add-form">
          <div class="add-picker-grid">
            {#each ADVERSARY_TYPES as type}
              <button
                class="pick-cell"
                class:selected={addSelectedName === type.name}
                on:click={() => addSelectedName = type.name}
              >
                <img src={adversaryIconUrl(type.name)} alt={type.name} class="pick-icon" />
                <span>{type.name}</span>
              </button>
            {/each}
          </div>

          {#if addSelectedName}
            <div class="color-row">
              <span>Color:</span>
              {#each COLORS as color}
                <button
                  class="color-btn"
                  class:selected={addSelectedColor === color}
                  style="background: {COLOR_VAR[color]}"
                  on:click={() => addSelectedColor = color}
                  title={color}
                ></button>
              {/each}
            </div>
          {/if}

          {#if addSelectedName && addSelectedColor}
            <button class="ctrl-btn primary" on:click={handleAdd}>
              Add {addSelectedName} ({addSelectedColor})
            </button>
          {/if}
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  .overlay-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .overlay-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 2px solid var(--color-accent);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-panel);
    width: min(720px, 90vw);
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .overlay-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    background: var(--color-surface);
    z-index: 1;
  }

  h2 {
    font-family: var(--font-heading);
    font-size: 18px;
    color: var(--color-accent);
  }

  h3 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
    margin-bottom: var(--space-3);
  }

  .close-btn {
    padding: var(--space-1) var(--space-4);
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .close-btn:hover {
    border-color: var(--color-accent-dim);
  }

  .section {
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  .hint {
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

  .unit-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-alt);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .unit-item.dead {
    opacity: 0.45;
    border-style: dashed;
  }

  .unit-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  .color-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .unit-name {
    flex: 1;
    font-size: 13px;
  }

  .toggle-btn, .remove-btn {
    font-size: 11px;
    padding: var(--space-1) var(--space-2);
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-dim);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .toggle-btn:hover { border-color: var(--color-accent-dim); color: var(--color-text); }
  .remove-btn:hover  { border-color: var(--color-red); color: var(--color-red); }

  .ctrl-btn {
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface-alt);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 13px;
    cursor: pointer;
    margin-bottom: var(--space-3);
  }

  .ctrl-btn.primary {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .ctrl-btn:hover:not(:disabled) {
    border-color: var(--color-accent-dim);
  }

  .add-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .add-picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-1);
    max-height: 200px;
    overflow-y: auto;
    padding: var(--space-2);
    background: var(--color-surface-alt);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .pick-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-dim);
    font-size: 10px;
    text-align: center;
  }

  .pick-cell:hover   { border-color: var(--color-border); color: var(--color-text); }
  .pick-cell.selected { border-color: var(--color-accent); color: var(--color-text); }

  .pick-icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 13px;
    color: var(--color-text-dim);
  }

  .color-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .color-btn:hover   { border-color: rgba(255,255,255,0.5); }
  .color-btn.selected { border-color: white; }
</style>
```

---

## Wire into AppRoot.svelte

Replace the overlay placeholder in `AppRoot.svelte`:

```svelte
<script lang="ts">
  import RosterOverlay from './game/RosterOverlay.svelte';
  // ...existing imports
</script>

<!-- Inside the game phase block, after BottomBar: -->
{#if rosterOpen}
  <RosterOverlay on:close={() => rosterOpen = false} />
{/if}
```

Remove the inline overlay-backdrop `div` that was the placeholder from task-07.

---

## Behavior notes

**Difficulty for added units**: When adding a unit mid-game, the difficulty is inferred
from `$gameStore.turn.units[0]?.difficulty ?? 1`. Phase 1 does not support per-unit
difficulty. If the mission has no units yet (edge case), it defaults to Warrior (1).

**Duplicate ID guard**: If the player tries to add a unit with an ID that already exists
(same adversary name + same color), `addUnitMidGame` will add a duplicate. The overlay
does not currently prevent this. For Phase 1, this is acceptable; a guard can be added
in task-11 polish if desired.

**Activation list after changes**: `markUnitDead` and `reviveUnit` update `turn.units`
but do not modify the current turn's `activations`. If a unit is marked dead mid-turn,
it remains in the activation list for that turn. On the next `drawTurn`, dead units are
excluded. This is the intended behavior.

**`removeUnitMidGame`**: Removes the unit from `turn.units` AND from `turn.activations`
immediately (both are updated in the store action). The activation list re-renders.

---

## Done criteria

- [ ] "Manage Roster" button opens the overlay
- [ ] Clicking the backdrop (outside the panel) closes the overlay
- [ ] "Close" button closes the overlay
- [ ] Each unit row shows: icon, color dot, name, "Mark Dead" / "Revive" toggle, "Remove"
- [ ] Dead units appear visually distinct (dimmed / dashed border)
- [ ] "Mark Dead" changes the unit to dead state; "Revive" restores it
- [ ] "Remove" removes the unit from `gameStore.turn.units` and `activations`
- [ ] "Add Unit" flow: choose adversary type, choose color, click "Add" -> unit appears
  in the current unit list
- [ ] Added unit's JSON is loaded if not already cached (verify via network tab: only
  new types trigger a fetch)
- [ ] After adding a unit and ending/drawing the next turn, the new unit appears in the
  activation list
- [ ] No TypeScript errors
