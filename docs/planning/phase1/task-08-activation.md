# Task 08 - Activation List

## Goal

Implement the three activation list components: `ColorBadge`, `ActivationRow`, and
`ActivationList`. Wire `ActivationList` into the left panel of `AppRoot.svelte`.

## Depends on

- Task 01 (scaffold)
- Task 02 (types: `AdversaryColor`, `ActivationEntry`)
- Task 03 (`assets.ts`: `adversaryIconUrl`)
- Task 04 (`gameStore` derived: `activations`, `selectUnit`)
- Task 07 (game layout wired in `AppRoot.svelte`)

## Files to create or modify

| Path | Role |
|---|---|
| `src/components/game/ColorBadge.svelte` | Colored circle showing unit color |
| `src/components/game/ActivationRow.svelte` | Single row in the activation list |
| `src/components/game/ActivationList.svelte` | Full sorted list; dispatches selection |
| `src/components/AppRoot.svelte` | Replace left panel stub with real `ActivationList` |

---

## Implementation: ColorBadge.svelte

```svelte
<script lang="ts">
  import type { AdversaryColor } from '../../types/game';

  export let color: AdversaryColor;

  const COLOR_MAP: Record<AdversaryColor, string> = {
    Red:    'var(--color-red)',
    Blue:   'var(--color-blue)',
    Cyan:   'var(--color-cyan)',
    Yellow: 'var(--color-yellow)',
  };
</script>

<span
  class="badge"
  style="background: {COLOR_MAP[color]}"
  title={color}
></span>

<style>
  .badge {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.25);
  }
</style>
```

---

## Implementation: ActivationRow.svelte

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ActivationEntry } from '../../types/game';
  import { adversaryIconUrl } from '../../lib/assets';
  import ColorBadge from './ColorBadge.svelte';

  export let entry: ActivationEntry;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher<{ select: string }>();

  function handleClick() {
    dispatch('select', entry.unit.id);
  }

  $: iconUrl = adversaryIconUrl(entry.unit.adversaryName);
</script>

<div
  class="activation-row"
  class:selected
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={e => e.key === 'Enter' && handleClick()}
>
  <span class="order-num">{entry.activationOrder}</span>

  <img src={iconUrl} alt="" class="adv-icon" aria-hidden="true" />

  <span class="adv-name">{entry.unit.adversaryName}</span>

  <ColorBadge color={entry.unit.color} />

  <span class="initiative">{entry.initiative}</span>
</div>

<style>
  .activation-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background 0.1s;
  }

  .activation-row:hover {
    background: var(--texture-leather);
  }

  .activation-row.selected {
    border-left: 3px solid var(--color-accent);
    padding-left: calc(var(--space-4) - 3px);
    background: rgba(184, 115, 51, 0.08);
  }

  .order-num {
    width: 20px;
    text-align: right;
    font-size: 12px;
    color: var(--color-text-dim);
    flex-shrink: 0;
  }

  .adv-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .adv-name {
    flex: 1;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .initiative {
    font-size: 14px;
    font-weight: bold;
    color: var(--color-accent);
    flex-shrink: 0;
    min-width: 24px;
    text-align: right;
  }
</style>
```

---

## Implementation: ActivationList.svelte

```svelte
<script lang="ts">
  import { activations, selectUnit, gameStore } from '../../stores/gameStore';
  import ActivationRow from './ActivationRow.svelte';

  $: selectedId = $gameStore.turn.selectedUnitId;

  function handleSelect(e: CustomEvent<string>) {
    selectUnit(e.detail);
  }
</script>

<div class="activation-list">
  {#if $activations.length === 0}
    <p class="empty-msg">Press "Draw Turn" to begin.</p>
  {:else}
    <div class="list-header">
      <span>Order</span>
      <span></span>
      <span>Adversary</span>
      <span>Color</span>
      <span>Init</span>
    </div>
    {#each $activations as entry (entry.unit.id)}
      <ActivationRow
        {entry}
        selected={selectedId === entry.unit.id}
        on:select={handleSelect}
      />
    {/each}
  {/if}
</div>

<style>
  .activation-list {
    height: 100%;
  }

  .empty-msg {
    padding: var(--space-6);
    color: var(--color-text-dim);
    font-style: italic;
  }

  .list-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    font-size: 11px;
    color: var(--color-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--color-surface);
    /* Match column layout of ActivationRow */
    /* order-num: 20px | icon: 32px | name: flex | badge: 10px | init: 24px */
  }

  .list-header span:nth-child(1) { width: 20px; text-align: right; }
  .list-header span:nth-child(2) { width: 32px; }
  .list-header span:nth-child(3) { flex: 1; }
  .list-header span:nth-child(4) { width: 10px; }
  .list-header span:nth-child(5) { min-width: 24px; text-align: right; }
</style>
```

---

## Wire into AppRoot.svelte

In `src/components/AppRoot.svelte`, replace the left panel placeholder:

```svelte
<script lang="ts">
  // Add this import:
  import ActivationList from './game/ActivationList.svelte';
  // ...existing imports
</script>

<!-- Replace the panel-left contents: -->
<div class="panel-left">
  <ActivationList />
</div>
```

No props are needed - `ActivationList` reads directly from `gameStore` via derived stores.

---

## Activation data access notes

`ActivationEntry` contains:
- `unit: AdversaryUnit` - full unit data (color, name, species, class)
- `speciesCard: SpeciesCard` - the drawn species card
- `classCard: ColorCard` - the color-resolved class card for this unit
- `initiative: number` - pre-computed sum
- `activationOrder: number` - 1-based display position

The list is already sorted by `drawTurn` using `sortActivations` + `numberActivations`
before being stored. No re-sorting is needed in the component.

Initiative display: shows the pre-computed `entry.initiative` value (integer). This is
the sum `speciesCard.Cost + classCard.Cost` where `classCard` is color-resolved.

---

## Done criteria

- [ ] `ColorBadge` renders a colored circle for each of the four colors
- [ ] `ActivationRow` shows: order number, icon, adversary name, color badge, initiative
- [ ] Clicking a row calls `selectUnit` with the unit ID
- [ ] Selected row has a left accent border and slightly highlighted background
- [ ] `ActivationList` shows "Press Draw Turn to begin" when `activations` is empty
- [ ] After `drawTurn`, all living units appear in the list, sorted by initiative descending
- [ ] Two units with same initiative appear with higher-priority color first (Red > Blue >
  Cyan > Yellow)
- [ ] `ActivationList` is mounted in the left panel of `AppRoot.svelte`
- [ ] No icon load errors for the adversary types used in the test mission
