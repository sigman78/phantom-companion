<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import {
    gameStore, adversaryGroups,
    setSetupType, setSetupDifficulty, toggleSetupColor,
    addAdversaryGroup, removeAdversaryGroup,
    markUnitDead, reviveUnit,
  } from '../../stores/gameStore';
  import { ADVERSARY_TYPES } from '../../lib/adversaries';
  import { adversaryIconUrl, adversaryPortraitUrl } from '../../lib/assets';
  import { DIFFICULTY_STARS, ADVERSARY_COLORS, COLOR_VAR } from '../../lib/constants';
  import type { AdversaryStatBlock, DifficultyLevel } from '../../types/game';

  const dispatch = createEventDispatcher<{ close: void }>();
  const LEVELS: DifficultyLevel[] = [0, 1, 2, 3];

  let statsJson: Record<string, AdversaryStatBlock[]> | null = null;
  onMount(() => {
    fetch('/game-data/data/adversary-stats.json').then(r => r.json()).then(d => statsJson = d);
  });

  // Reuse setup state for the add-type picker
  $: setup        = $gameStore.setup;
  $: selectedType = ADVERSARY_TYPES.find(t => t.name === setup.selectedTypeName) ?? null;
  $: difficulty   = setup.difficulty;
  $: colorToggles = setup.colorToggles;
  $: groups       = $adversaryGroups;

  // Selected EXISTING group (for detail display)
  let selectedGroupName: string | null = null;
  $: selectedGroup = groups.find(g => g.name === selectedGroupName) ?? null;
  $: displayName   = selectedGroupName ?? null;
  $: displayUnit   = displayName
    ? $gameStore.turn.units.find(u => u.adversaryName === displayName) ?? null
    : null;
  $: groupDifficulty = (selectedGroup?.difficulty ?? 1) as DifficultyLevel;
  $: groupStats = (displayName && statsJson)
    ? (statsJson[displayName]?.[groupDifficulty] ?? null)
    : null;

  $: canAdd = !!selectedType && ADVERSARY_COLORS.some(c => colorToggles[c]);

  let adding = false;
  async function handleAdd() {
    if (!selectedType || adding) return;
    adding = true;
    await addAdversaryGroup(selectedType, difficulty, colorToggles);
    adding = false;
  }

  function handleRemove() {
    if (!selectedGroupName) return;
    removeAdversaryGroup(selectedGroupName);
    selectedGroupName = null;
  }
</script>

<div class="roster-layout">
  <!-- Left: existing groups with alive/dead toggles -->
  <div class="panel-left">
    <div class="list-header">
      <span class="header-title">
        Battle Roster
        {#if groups.length > 0}
          <span class="count-badge">{groups.length}</span>
        {/if}
      </span>
    </div>
    <div class="list-body">
      {#if groups.length === 0}
        <div class="empty-state">No adversaries in mission.</div>
      {:else}
        {#each groups as group}
          <div
            class="group-card"
            class:sel={selectedGroupName === group.name}
            on:click={() => selectedGroupName = group.name}
            role="button"
            tabindex="0"
            on:keydown={e => e.key === 'Enter' && (selectedGroupName = group.name)}
          >
            <div class="group-head">
              <img src={adversaryIconUrl(group.name)} alt="" class="group-icon" />
              <div class="group-info">
                <span class="group-name">{group.name}</span>
                <span class="group-diff">{DIFFICULTY_STARS[group.difficulty]}</span>
              </div>
            </div>
            <div class="color-rows">
              {#each ADVERSARY_COLORS as color}
                {@const unit = group.units.find(u => u.color === color)}
                {#if unit}
                  <div class="color-row" class:dead={!unit.alive}>
                    <span class="color-dot" style="background:{COLOR_VAR[color]}"></span>
                    <span class="color-name">{color}</span>
                    <button
                      class="toggle-btn"
                      on:click|stopPropagation={() => unit.alive ? markUnitDead(unit.id) : reviveUnit(unit.id)}
                    >
                      {unit.alive ? 'Mark Dead' : 'Revive'}
                    </button>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Right: detail top + type picker bottom -->
  <div class="panel-right">
    <!-- Top: selected group detail (portrait + stats) -->
    <div class="right-top">
      {#if selectedGroup && groupStats}
        <div class="adv-header">
          <img src={adversaryPortraitUrl(selectedGroup.name)} alt={selectedGroup.name} class="portrait" />
          <div class="adv-meta">
            <div class="name-row">
              <span class="adv-name">{selectedGroup.name}</span>
              <span class="stars">{DIFFICULTY_STARS[groupDifficulty]}</span>
            </div>
            <div class="stats-inline">
              <span class="si"><span class="sl">HP</span><span class="sv">{groupStats.HP}</span></span>
              <span class="si-sep"></span>
              <span class="si"><span class="sl">Guard</span><span class="sv">{groupStats.GUARD}</span></span>
              <span class="si-sep"></span>
              <span class="si"><span class="sl">Atk</span><span class="sv">{groupStats.ATTACK}</span></span>
              <span class="si-sep"></span>
              <span class="si"><span class="sl">Rng</span><span class="sv">{groupStats.RANGE}</span></span>
            </div>
            <div class="crit-line">
              <span class="crit-lbl">Crit</span>
              <span class="crit-val">{groupStats.CRIT}</span>
            </div>
          </div>
        </div>
      {:else}
        <div class="no-sel">
          {selectedGroup ? 'Loading stats...' : 'Select a group from the left to view details.'}
        </div>
      {/if}
    </div>

    <!-- Bottom: type picker to add more -->
    <div class="right-bottom">
      <div class="picker-header">Add new type</div>
      <div class="type-grid">
        {#each ADVERSARY_TYPES as type}
          <button
            class="type-cell"
            class:sel={setup.selectedTypeName === type.name}
            on:click={() => setSetupType(type.name)}
          >
            <img src={adversaryIconUrl(type.name)} alt={type.name} class="type-icon" />
            <span class="type-name">{type.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Roster bottom bar -->
<div class="roster-bar">
  <!-- Difficulty -->
  <div class="bar-group">
    <span class="bar-label">Diff</span>
    <div class="diff-btns">
      {#each LEVELS as level}
        <button
          class="diff-btn"
          class:active={difficulty === level}
          on:click={() => setSetupDifficulty(level)}
        >
          {DIFFICULTY_STARS[level]}
        </button>
      {/each}
    </div>
  </div>

  <div class="bar-sep"></div>

  <!-- Color toggles -->
  <div class="bar-group">
    <span class="bar-label">Colors</span>
    <div class="color-btns">
      {#each ADVERSARY_COLORS as color}
        <button
          class="color-btn"
          class:active={colorToggles[color]}
          style="--c:{COLOR_VAR[color]}"
          on:click={() => toggleSetupColor(color)}
          title={color}
        >
          {color[0]}
        </button>
      {/each}
    </div>
  </div>

  <div class="bar-sep"></div>

  <button
    class="bar-btn add-btn"
    on:click={handleAdd}
    disabled={!canAdd || adding}
  >
    {adding ? 'Adding...' : 'Add'}
  </button>

  <button
    class="bar-btn remove-btn"
    on:click={handleRemove}
    disabled={!selectedGroupName}
  >
    Remove Group
  </button>

  <button class="bar-btn back-btn" on:click={() => dispatch('close')}>
    Back to Battle
  </button>
</div>

<style>
  .roster-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Left panel */
  .panel-left {
    width: var(--panel-left-width);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    align-items: center;
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
  .count-badge {
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 0 var(--space-2);
    font-size: 11px;
  }

  .list-body { flex: 1; overflow-y: auto; padding: var(--space-2); display: flex; flex-direction: column; gap: var(--space-2); }

  .empty-state {
    padding: var(--space-8) var(--space-4);
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    text-align: center;
  }

  .group-card {
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.1s;
  }
  .group-card:hover { border-color: var(--color-accent-dim); }
  .group-card.sel   { border-color: var(--color-accent); }

  .group-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }
  .group-icon  { width: 32px; height: 32px; object-fit: contain; }
  .group-info  { flex: 1; display: flex; flex-direction: column; gap: 1px; }
  .group-name  { font-size: 14px; font-weight: 500; }
  .group-diff  { font-size: 11px; color: var(--color-accent); letter-spacing: 1px; }

  .color-rows { padding: var(--space-1) var(--space-3); display: flex; flex-direction: column; }
  .color-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 3px 0;
  }
  .color-row.dead { opacity: 0.4; }
  .color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .color-name { flex: 1; font-size: 13px; }
  .toggle-btn {
    font-size: 11px;
    padding: 2px var(--space-2);
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-dim);
    border-radius: var(--radius-sm);
    cursor: pointer;
    min-height: 28px;
  }
  .toggle-btn:hover { border-color: var(--color-accent-dim); color: var(--color-text); }

  /* Right panel */
  .panel-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Top: selected group detail */
  .right-top {
    flex: 35;
    min-height: 0;
    border-bottom: 2px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .adv-header {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
    flex: 1;
  }
  .portrait { width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6)); flex-shrink: 0; }
  .adv-meta { flex: 1; display: flex; flex-direction: column; gap: var(--space-2); min-width: 0; }
  .name-row { display: flex; align-items: baseline; gap: var(--space-2); }
  .adv-name { font-family: var(--font-heading); font-size: 17px; color: var(--color-accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stars { font-size: 13px; color: var(--color-accent); letter-spacing: 1px; flex-shrink: 0; }
  .stats-inline { display: flex; align-items: center; }
  .si { display: flex; flex-direction: column; align-items: center; padding: 0 var(--space-3); }
  .si:first-child { padding-left: 0; }
  .si-sep { width: 1px; height: 28px; background: var(--color-border); flex-shrink: 0; }
  .sl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-dim); margin-bottom: 1px; }
  .sv { font-size: 20px; font-weight: bold; line-height: 1; }
  .crit-line { display: flex; align-items: baseline; gap: var(--space-2); }
  .crit-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-dim); }
  .crit-val { font-size: 13px; color: var(--color-text); font-style: italic; }

  .no-sel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    padding: var(--space-6);
    text-align: center;
    border-top: 1px solid var(--color-accent);
    background: var(--color-surface);
  }

  /* Bottom: type picker */
  .right-bottom {
    flex: 65;
    min-height: 0;
    overflow-y: auto;
    background: var(--color-surface-alt);
    display: flex;
    flex-direction: column;
  }
  .picker-header {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-dim);
    padding: var(--space-2) var(--space-3) 0;
    flex-shrink: 0;
  }
  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3) var(--space-3);
  }
  .type-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: var(--space-1) var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.12s;
    min-height: 44px;
  }
  .type-cell:hover { border-color: var(--color-accent-dim); }
  .type-cell.sel   { border-color: var(--color-accent); background: rgba(184,115,51,0.12); }
  .type-icon { width: 44px; height: 44px; object-fit: contain; }
  .type-name { font-size: 9px; text-align: center; color: var(--color-text-dim); line-height: 1.3; }
  .type-cell.sel .type-name { color: var(--color-text); }

  /* Roster bottom bar */
  .roster-bar {
    height: var(--bottom-bar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    background: var(--color-surface-alt);
    border-top: 2px solid var(--color-border);
  }

  .bar-group { display: flex; align-items: center; gap: var(--space-2); }
  .bar-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-dim); }
  .bar-sep { width: 1px; height: 28px; background: var(--color-border); flex-shrink: 0; }
  .diff-btns, .color-btns { display: flex; gap: 3px; }

  .diff-btn {
    padding: 2px var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-dim);
    font-size: 11px;
    cursor: pointer;
    min-height: 28px;
  }
  .diff-btn:hover  { border-color: var(--color-accent-dim); color: var(--color-text); }
  .diff-btn.active { border-color: var(--color-accent); color: var(--color-accent); background: rgba(184,115,51,0.1); }

  .color-btn {
    width: 28px;
    height: 28px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-dim);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }
  .color-btn:hover  { border-color: var(--c); }
  .color-btn.active { border-color: var(--c); color: var(--c); background: color-mix(in srgb, var(--c) 15%, transparent); }

  .bar-btn {
    padding: 0 var(--space-3);
    height: 36px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.12s;
    white-space: nowrap;
    min-height: 44px;
  }
  .bar-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .add-btn {
    background: var(--color-accent-dim);
    color: var(--color-text);
    border: 1px solid var(--color-accent);
  }
  .add-btn:hover:not(:disabled) { background: var(--color-accent); }

  .remove-btn {
    background: none;
    color: var(--color-text-dim);
    border: 1px solid var(--color-border);
  }
  .remove-btn:hover:not(:disabled) { border-color: var(--color-red); color: var(--color-red); }

  .back-btn {
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    font-weight: 700;
    margin-left: auto;
    padding: 0 var(--space-4);
  }
  .back-btn:hover { filter: brightness(1.15); }
</style>
