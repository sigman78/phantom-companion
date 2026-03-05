<script lang="ts">
  import { activations, gameStore, selectAdversary } from '../../stores/gameStore';
  import { adversaryIconUrl } from '../../lib/assets';
  import AddAdversaryModal from './AddAdversaryModal.svelte';
  import type { AdversaryColor, DifficultyLevel } from '../../types/game';

  let addOpen = false;

  const DIFFICULTY_STARS: Record<DifficultyLevel, string> = {
    0: '★', 1: '★★', 2: '★★★', 3: '★★★★',
  };
  const COLORS: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

  const COLOR_BG: Record<AdversaryColor, string> = {
    Red:    'rgba(192,57,43,0.15)',
    Blue:   'rgba(41,128,185,0.15)',
    Cyan:   'rgba(0,180,216,0.12)',
    Yellow: 'rgba(212,172,13,0.15)',
  };

  $: drawn = $activations.length > 0;
  $: selectedName = $gameStore.turn.selectedAdversaryName;
  $: activeIdx    = $gameStore.turn.activeActivationIndex;

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
        <span class="unit-count">{$gameStore.turn.units.filter(u => u.alive).length}</span>
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
      <!-- Post-draw: sorted list, styled by position relative to active index -->
      {#each $activations as entry, i (entry.unit.id)}
        {@const state = i < activeIdx ? 'past' : i === activeIdx ? 'current' : 'future'}
        {@const colorBg = COLOR_BG[entry.unit.color]}
        {@const colorAccent = `var(--color-${entry.unit.color.toLowerCase()})`}
        <div
          class="act-row"
          class:past={state === 'past'}
          class:current={state === 'current'}
          class:future={state === 'future'}
          class:dead={!entry.unit.alive}
          style="--row-bg:{colorBg}; --row-accent:{colorAccent}"
        >
          <span class="order">{entry.activationOrder}</span>
          <div class="icon-crop">
            <img src={adversaryIconUrl(entry.unit.adversaryName)} alt="" class="icon-img" />
          </div>
          <div class="info">
            <span class="name">{entry.unit.adversaryName}</span>
            <span class="color-tag" style="color:{colorAccent}; border-color:{colorAccent}">{entry.unit.color}</span>
          </div>
          <span class="init">{entry.initiative}</span>
        </div>
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
                style="background:var(--color-{color.toLowerCase()})"
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
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
    flex-shrink: 0;
  }

  .header-title {
    font-size: 11px;
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
    padding: 0 var(--space-2);
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

  /* --- Post-draw activation rows --- */
  .act-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    border-left: 3px solid var(--row-accent);
    background: var(--row-bg);
    transition: opacity 0.15s;
  }
  .act-row.dead { opacity: 0.25; }

  /* Past: small, dimmed -- icon 3x=72px, crop to middle 50% => 36px tall */
  .act-row.past {
    --icon-sz: 72px;
    padding: 4px var(--space-3);
    opacity: 0.35;
    filter: grayscale(0.6);
  }
  .act-row.past .order { font-size: 11px; width: 18px; }
  .act-row.past .name  { font-size: 12px; }
  .act-row.past .color-tag { display: none; }
  .act-row.past .init  { font-size: 14px; }

  /* Current: prominent -- icon 3x=120px, crop to middle 50% => 60px tall */
  .act-row.current {
    --icon-sz: 120px;
    padding: var(--space-3) var(--space-3);
    border-left-width: 5px;
    filter: brightness(1.15);
  }
  .act-row.current .order { font-size: 13px; width: 22px; }
  .act-row.current .name  { font-size: 17px; font-weight: 600; }
  .act-row.current .init  { font-size: 24px; }

  /* Future: compact -- icon 3x=84px, crop to middle 50% => 42px tall */
  .act-row.future {
    --icon-sz: 84px;
    padding: 6px var(--space-3);
  }
  .act-row.future .order { font-size: 12px; width: 20px; }
  .act-row.future .name  { font-size: 13px; }
  .act-row.future .init  { font-size: 16px; }

  .order {
    text-align: right;
    color: var(--color-text-dim);
    flex-shrink: 0;
  }
  /* Cropped hex portrait: show middle 50% vertically, 92% horizontally */
  .icon-crop {
    flex-shrink: 0;
    width: calc(var(--icon-sz) * 0.76);
    height: calc(var(--icon-sz) * 0.5);
    overflow: hidden;
  }
  .icon-img {
    display: block;
    width: var(--icon-sz);
    height: var(--icon-sz);
    object-fit: contain;
    transform: translateY(-25%) translateX(-12%);
  }

  .info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .color-tag {
    display: inline-block;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 600;
    border: 1px solid;
    border-radius: var(--radius-sm);
    padding: 0 3px;
    align-self: flex-start;
  }

  .init {
    font-weight: bold;
    color: var(--color-accent);
    min-width: 28px;
    text-align: right;
    flex-shrink: 0;
  }

  /* --- Pre-draw group rows --- */
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
  .group-row:hover    { background: var(--texture-leather); }
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
