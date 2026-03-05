<script lang="ts">
  import { activations, gameStore, selectUnit, selectAdversary } from '../../stores/gameStore';
  import { adversaryIconUrl } from '../../lib/assets';
  import ActivationRow from './ActivationRow.svelte';
  import ColorBadge from './ColorBadge.svelte';
  import AddAdversaryModal from './AddAdversaryModal.svelte';
  import type { AdversaryColor, DifficultyLevel } from '../../types/game';

  let addOpen = false;

  const DIFFICULTY_STARS: Record<DifficultyLevel, string> = {
    0: '★', 1: '★★', 2: '★★★', 3: '★★★★',
  };
  const COLORS: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

  $: drawn = $activations.length > 0;
  $: selectedId   = $gameStore.turn.selectedUnitId;
  $: selectedName = $gameStore.turn.selectedAdversaryName;

  // Unique adversary types in the mission (pre-draw view)
  $: adversaryGroups = (() => {
    const seen = new Set<string>();
    const groups: Array<{ name: string; difficulty: DifficultyLevel; units: typeof $gameStore.turn.units }> = [];
    for (const unit of $gameStore.turn.units) {
      if (!seen.has(unit.adversaryName)) {
        seen.add(unit.adversaryName);
        const typeUnits = $gameStore.turn.units.filter(u => u.adversaryName === unit.adversaryName);
        groups.push({ name: unit.adversaryName, difficulty: unit.difficulty, units: typeUnits });
      }
    }
    return groups;
  })();
</script>

<div class="list-panel">
  <div class="list-header">
    <span class="header-title">
      {drawn ? 'Activation Order' : 'Mission Units'}
      {#if $gameStore.turn.units.length > 0}
        <span class="unit-count">{$gameStore.turn.units.filter(u => u.alive).length} active</span>
      {/if}
    </span>
    <button class="add-btn" on:click={() => addOpen = true}>+ Add</button>
  </div>

  <div class="list-body">
    {#if $gameStore.turn.units.length === 0}
      <div class="empty-state">
        <p>No adversaries added.</p>
        <button class="add-btn-large" on:click={() => addOpen = true}>+ Add Adversary</button>
      </div>

    {:else if drawn}
      <!-- Post-draw: sorted flat list, one row per color unit -->
      {#each $activations as entry (entry.unit.id)}
        <ActivationRow
          {entry}
          selected={selectedId === entry.unit.id}
          on:select={e => selectUnit(e.detail)}
        />
      {/each}

    {:else}
      <!-- Pre-draw: one section per adversary type -->
      {#each adversaryGroups as group}
        {@const isSelected = selectedName === group.name}
        <div
          class="group-row"
          class:selected={isSelected}
          on:click={() => selectAdversary(group.name)}
          role="button"
          tabindex="0"
          on:keydown={e => e.key === 'Enter' && selectAdversary(group.name)}
        >
          <img src={adversaryIconUrl(group.name)} alt="" class="group-icon" />
          <div class="group-info">
            <span class="group-name">{group.name}</span>
            <span class="group-diff">{DIFFICULTY_STARS[group.difficulty]}</span>
          </div>
          <div class="group-colors">
            {#each COLORS as color}
              {@const unit = group.units.find(u => u.color === color)}
              <span
                class="color-pip"
                class:dead={unit && !unit.alive}
                style="background: var(--color-{color.toLowerCase()})"
                title="{color}{unit && !unit.alive ? ' (dead)' : ''}"
              ></span>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

{#if addOpen}
  <AddAdversaryModal on:close={() => addOpen = false} />
{/if}

<style>
  .list-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
    flex-shrink: 0;
  }

  .header-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .unit-count {
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 1px var(--space-2);
    font-size: 11px;
  }

  .add-btn {
    padding: var(--space-1) var(--space-3);
    background: none;
    border: 1px solid var(--color-accent-dim);
    color: var(--color-accent);
    border-radius: var(--radius-sm);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
  }
  .add-btn:hover { border-color: var(--color-accent); background: rgba(184,115,51,0.1); }

  .list-body { flex: 1; overflow-y: auto; }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-8);
    color: var(--color-text-dim);
    font-style: italic;
  }

  .add-btn-large {
    padding: var(--space-3) var(--space-6);
    background: var(--color-surface-alt);
    border: 1px dashed var(--color-accent-dim);
    color: var(--color-accent);
    border-radius: var(--radius-md);
    font-size: 14px;
    cursor: pointer;
  }
  .add-btn-large:hover { background: rgba(184,115,51,0.1); border-style: solid; }

  /* Pre-draw group rows */
  .group-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    border-left: 3px solid transparent;
    cursor: pointer;
    transition: background 0.1s;
  }
  .group-row:hover   { background: var(--texture-leather); }
  .group-row.selected {
    border-left-color: var(--color-accent);
    background: rgba(184,115,51,0.08);
  }

  .group-icon { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }

  .group-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .group-name { font-size: 15px; font-weight: 500; }
  .group-diff { font-size: 12px; color: var(--color-accent); letter-spacing: 1px; }

  .group-colors { display: flex; gap: var(--space-1); flex-shrink: 0; }
  .color-pip {
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .color-pip.dead { opacity: 0.2; }
</style>
