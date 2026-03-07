# Task 07 - Bottom Bar and Game Layout Shell

## Goal

Implement `BottomBar.svelte` with turn controls (Draw Turn, End Turn, Manage Roster),
and wire the full game layout in `AppRoot.svelte` with the two content panels and
bottom bar in their final positions.

## Depends on

- Task 01 (scaffold)
- Task 02 (types)
- Task 04 (`gameStore` actions: `drawTurn`, `endTurn`)
- Task 05 (`AppRoot.svelte` phase router, global CSS layout classes)

## Files to create or modify

| Path | Role |
|---|---|
| `src/components/shared/BottomBar.svelte` | Turn counter + Draw/End/Manage buttons |
| `src/components/AppRoot.svelte` | Wire game layout with BottomBar + panel slots |

---

## Implementation: BottomBar.svelte

```svelte
<script lang="ts">
  import { gameStore, drawTurn, endTurn } from '../../stores/gameStore';
  import { activations, currentTurn } from '../../stores/gameStore';

  // Roster overlay open state (task-10 wires this to the actual overlay)
  export let onManageRoster: () => void = () => {};

  $: hasActivations = $activations.length > 0;
  $: canDraw        = !hasActivations;
  $: canEnd         = hasActivations;

  // Check if all living units are dead (disable Draw if no one left)
  $: allDead = $gameStore.phase === 'game' &&
    $gameStore.turn.units.every(u => !u.alive);
</script>

<div class="bottom-bar">
  <span class="turn-label">Turn <strong>{$currentTurn}</strong></span>

  <div class="controls">
    <button
      class="ctrl-btn"
      on:click={drawTurn}
      disabled={!canDraw || allDead}
      title={allDead ? 'All units defeated' : undefined}
    >
      Draw Turn
    </button>

    <button
      class="ctrl-btn"
      on:click={endTurn}
      disabled={!canEnd}
    >
      End Turn
    </button>

    <button
      class="ctrl-btn ctrl-secondary"
      on:click={onManageRoster}
    >
      Manage Roster
    </button>
  </div>
</div>

<style>
  .bottom-bar {
    height: var(--bottom-bar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    background: var(--color-surface-alt);
    border-top: 1px solid var(--color-border);
  }

  .turn-label {
    font-size: 15px;
    color: var(--color-text-dim);
  }

  .turn-label strong {
    color: var(--color-text);
    font-size: 17px;
  }

  .controls {
    display: flex;
    gap: var(--space-3);
  }

  .ctrl-btn {
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .ctrl-btn:hover:not(:disabled) {
    background: var(--color-surface-alt);
    border-color: var(--color-accent-dim);
  }

  .ctrl-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .ctrl-secondary {
    border-color: var(--color-accent-dim);
    color: var(--color-accent);
  }

  .ctrl-secondary:hover {
    border-color: var(--color-accent);
    background: var(--color-surface-alt);
  }
</style>
```

---

## Implementation: AppRoot.svelte (updated)

Replace the placeholder game layout section with the real panel structure and BottomBar.
The content components (ActivationList, AdversaryDetail) remain as stubs until tasks
08 and 09 are complete.

```svelte
<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import SetupScreen from './setup/SetupScreen.svelte';
  import BottomBar from './shared/BottomBar.svelte';

  // Will be replaced by real imports in tasks 08 and 09:
  // import ActivationList from './game/ActivationList.svelte';
  // import AdversaryDetail from './game/AdversaryDetail.svelte';

  // Roster overlay (task-10)
  let rosterOpen = false;

  $: phase = $gameStore.phase;
</script>

{#if phase === 'setup'}
  <SetupScreen />
{:else}
  <div class="game-layout">
    <div class="panel-left">
      <!-- ActivationList (task-08) -->
      <p style="padding: 1rem; color: var(--color-text-dim);">Activation list - coming in task-08</p>
    </div>
    <div class="panel-right">
      <!-- AdversaryDetail (task-09) -->
      <p style="padding: 1rem; color: var(--color-text-dim);">Detail panel - coming in task-09</p>
    </div>
  </div>

  <BottomBar onManageRoster={() => rosterOpen = true} />

  {#if rosterOpen}
    <!-- RosterOverlay (task-10) -->
    <div
      class="overlay-backdrop"
      on:click={() => rosterOpen = false}
    >
      <p style="color: var(--color-text-dim);">Roster overlay - coming in task-10</p>
    </div>
  {/if}
{/if}

<style>
  .overlay-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
</style>
```

Note: The `game-layout` class is defined in `global.css` (from task-05) as a flex
container. `AppRoot.svelte` itself does not need to re-declare it.

---

## Layout structure overview

After this task, the full page structure in game phase is:

```
#app-root (flex column, 100vh)
  .game-layout (flex row, flex: 1, overflow: hidden)
    .panel-left  (66%, scrollable)
      [ActivationList placeholder -> real in task-08]
    .panel-right (34%, scrollable)
      [AdversaryDetail placeholder -> real in task-09]
  BottomBar (56px fixed height, flex-shrink: 0)
  [RosterOverlay overlay, position: fixed -> real in task-10]
```

The bottom bar does not scroll with content; it is always visible at the bottom.

---

## Done criteria

- [ ] `BottomBar.svelte` renders in game phase at bottom of screen
- [ ] "Draw Turn" button calls `drawTurn` and becomes disabled after clicking (activations
  are now populated)
- [ ] "End Turn" button calls `endTurn` and becomes disabled before drawing (activations
  empty)
- [ ] Turn counter increments by 1 after each "End Turn" click
- [ ] "Manage Roster" button is visible and styled distinctly from other controls
- [ ] When all units are marked dead, "Draw Turn" is disabled with `title` tooltip
- [ ] `AppRoot.svelte` game layout: two panels and bottom bar visible simultaneously
  without overflow
- [ ] Clicking the overlay backdrop closes it (sets `rosterOpen = false`)
- [ ] No TypeScript errors
