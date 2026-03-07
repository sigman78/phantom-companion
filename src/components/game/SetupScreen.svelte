<script lang="ts">
  import { onMount } from 'svelte';
  import {
    gameStore, adversaryGroups,
    setSetupType, setSetupDifficulty, toggleSetupColor,
    addAdversaryGroup, clearAdversaries, goToBattle,
  } from '../../stores/gameStore';
  import { ADVERSARY_TYPES } from '../../lib/adversaries';
  import { adversaryIconUrl, adversaryPortraitUrl } from '../../lib/assets';
  import { DIFFICULTY_STARS, ADVERSARY_COLORS, COLOR_VAR } from '../../lib/constants';
  import type { AdversaryStatBlock, AdversaryType, DifficultyLevel } from '../../types/game';

  const LEVELS: DifficultyLevel[] = [0, 1, 2, 3];

  let statsJson: Record<string, AdversaryStatBlock[]> | null = null;
  onMount(() => {
    fetch('/game-data/data/adversary-stats.json').then(r => r.json()).then(d => statsJson = d);
  });

  $: setup       = $gameStore.setup;
  $: selectedType = ADVERSARY_TYPES.find(t => t.name === setup.selectedTypeName) ?? null;
  $: difficulty  = setup.difficulty;
  $: colorToggles = setup.colorToggles;
  $: groups      = $adversaryGroups;

  $: selectedStats = (selectedType && statsJson)
    ? (statsJson[selectedType.name]?.[difficulty] ?? null)
    : null;

  $: addedNames = new Set(groups.map(g => g.name));
  $: canAdd    = !!selectedType && ADVERSARY_COLORS.some(c => colorToggles[c]);
  $: canBattle = groups.length > 0;

  let adding = false;
  async function handleAdd() {
    if (!selectedType || adding) return;
    adding = true;
    await addAdversaryGroup(selectedType, difficulty, colorToggles);
    adding = false;
  }

  function handleBattle() {
    if (!canBattle) return;
    goToBattle();
  }
</script>

<div class="setup-layout">
  <div class="panel-left">
    <!-- Added adversary groups list -->
    <div class="list-header">
      <span class="header-title">
        Mission Roster
        {#if groups.length > 0}
          <span class="count-badge">{groups.length}</span>
        {/if}
      </span>
    </div>
    <div class="list-body">
      {#if groups.length === 0}
        <div class="empty-state">
          <p>No adversaries added yet.</p>
          <p class="hint">Select a type from the right, then tap Add.</p>
        </div>
      {:else}
        {#each groups as group}
          <div class="group-row">
            <img src={adversaryIconUrl(group.name)} alt="" class="group-icon" />
            <div class="group-info">
              <span class="group-name">{group.name}</span>
              <span class="group-diff">{DIFFICULTY_STARS[group.difficulty]}</span>
            </div>
            <div class="group-colors">
              {#each ADVERSARY_COLORS as color}
                {@const unit = group.units.find(u => u.color === color)}
                {#if unit}
                  <span
                    class="color-pip"
                    style="background:{COLOR_VAR[color]}"
                    title={color}
                  ></span>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div class="panel-right">
    <!-- Top: selected type detail -->
    <div class="right-top">
      {#if selectedType}
        <div class="adv-header">
          <img src={adversaryPortraitUrl(selectedType.name)} alt={selectedType.name} class="portrait" />
          <div class="adv-meta">
            <div class="name-row">
              <span class="adv-name">{selectedType.name}</span>
              <span class="stars">{DIFFICULTY_STARS[difficulty]}</span>
            </div>
            {#if selectedStats}
              <div class="stats-inline">
                <span class="si"><span class="sl">HP</span><span class="sv">{selectedStats.HP}</span></span>
                <span class="si-sep"></span>
                <span class="si"><span class="sl">Guard</span><span class="sv">{selectedStats.GUARD}</span></span>
                <span class="si-sep"></span>
                <span class="si"><span class="sl">Atk</span><span class="sv">{selectedStats.ATTACK}</span></span>
                <span class="si-sep"></span>
                <span class="si"><span class="sl">Rng</span><span class="sv">{selectedStats.RANGE}</span></span>
              </div>
              <div class="crit-line">
                <span class="crit-lbl">Crit</span>
                <span class="crit-val">{selectedStats.CRIT}</span>
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="no-sel">Select an adversary type below.</div>
      {/if}
    </div>

    <!-- Bottom: 22-type picker grid -->
    <div class="right-bottom">
      <div class="type-grid">
        {#each ADVERSARY_TYPES as type}
          <button
            class="type-cell"
            class:sel={setup.selectedTypeName === type.name}
            class:added={addedNames.has(type.name)}
            disabled={addedNames.has(type.name)}
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

<!-- Setup bottom bar -->
<div class="setup-bar">
  <!-- Difficulty -->
  <div class="bar-group diff-group">
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
  <div class="bar-group color-group">
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

  <!-- Actions -->
  <button
    class="bar-btn add-btn"
    on:click={handleAdd}
    disabled={!canAdd || adding}
  >
    {adding ? 'Adding...' : 'Add'}
  </button>

  <button
    class="bar-btn clear-btn"
    on:click={clearAdversaries}
    disabled={groups.length === 0}
  >
    Clear
  </button>

  <button
    class="bar-btn battle-btn"
    on:click={handleBattle}
    disabled={!canBattle}
  >
    In battle!
  </button>
</div>

<style>
  .setup-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Left panel - same width as game screen */
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

  .list-body { flex: 1; overflow-y: auto; }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-8) var(--space-4);
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    text-align: center;
  }
  .hint { font-size: 11px; }

  .group-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }
  .group-icon { width: 48px; height: 48px; object-fit: contain; flex-shrink: 0; }
  .group-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .group-name { font-size: 17px; font-weight: 500; }
  .group-diff { font-size: 13px; color: var(--color-accent); letter-spacing: 1px; }
  .group-colors { display: flex; gap: var(--space-1); flex-shrink: 0; }
  .color-pip {
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
  }

  /* Right panel */
  .panel-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Top: selected type detail (auto-height by content) */
  .right-top {
    flex-shrink: 0;
    border-bottom: 2px solid var(--color-border);
    display: flex;
    flex-direction: column;
  }

  .adv-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
  }
  .portrait {
    width: 56px;
    height: 56px;
    object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));
    flex-shrink: 0;
  }
  .adv-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }
  .name-row { display: flex; align-items: baseline; gap: var(--space-2); }
  .adv-name {
    font-family: var(--font-heading);
    font-size: 18px;
    color: var(--color-accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .stars { font-size: 13px; color: var(--color-accent); letter-spacing: 1px; flex-shrink: 0; }

  .stats-inline { display: flex; align-items: center; }
  .si { display: flex; flex-direction: column; align-items: center; padding: 0 var(--space-3); }
  .si:first-child { padding-left: 0; }
  .si-sep { width: 1px; height: 28px; background: var(--color-border); flex-shrink: 0; }
  .sl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-dim); margin-bottom: 1px; }
  .sv { font-size: 20px; font-weight: bold; line-height: 1; }
  .crit-line { display: flex; align-items: baseline; gap: var(--space-2); font-size: 13px; }
  .crit-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-dim); }
  .crit-val { font-size: 13px; color: var(--color-text); font-style: italic; }

  .no-sel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dim);
    font-style: italic;
    padding: var(--space-8);
    border-top: 1px solid var(--color-accent);
    background: var(--color-surface);
  }

  /* Bottom: type picker grid (fills remaining space) */
  .right-bottom {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    background: var(--color-surface-alt);
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .type-cell {
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
    transition: border-color 0.12s;
    min-height: 44px;
  }
  .type-cell:hover { border-color: var(--color-accent-dim); }
  .type-cell.sel   { border-color: var(--color-accent); background: rgba(184,115,51,0.12); }
  .type-cell:disabled,
  .type-cell.added {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }
  .type-cell.added::after {
    content: 'Added';
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-positive);
    background: rgba(58, 122, 74, 0.18);
    border: 1px solid rgba(58, 122, 74, 0.4);
    border-radius: var(--radius-sm);
    padding: 1px 3px;
    line-height: 1.4;
  }
  .type-icon { width: 68px; height: 68px; object-fit: contain; }
  .type-name {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    color: var(--color-text);
    line-height: 1.3;
  }

  /* Setup bottom bar */
  .setup-bar {
    height: var(--bottom-bar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3);
    background: var(--color-surface-alt);
    border-top: 3px solid;
    border-image-source: var(--brass-border-h);
    border-image-slice: 1;
  }

  .bar-group { display: flex; align-items: center; gap: var(--space-2); }
  .bar-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-dim);
  }
  .bar-sep { width: 1px; height: 36px; background: var(--color-border); flex-shrink: 0; }

  .diff-btns, .color-btns { display: flex; gap: 3px; }

  .diff-btn {
    padding: 2px var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-dim);
    font-size: 13px;
    cursor: pointer;
    min-height: 40px;
    transition: all 0.1s;
  }
  .diff-btn:hover  { border-color: var(--color-accent-dim); color: var(--color-text); }
  .diff-btn.active { border-color: var(--color-accent); color: var(--color-accent); background: rgba(184,115,51,0.1); }

  .color-btn {
    width: 36px;
    height: 36px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-dim);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.1s;
  }
  .color-btn:hover  { border-color: var(--c); }
  .color-btn.active { border-color: var(--c); color: var(--c); background: color-mix(in srgb, var(--c) 15%, transparent); }

  /* Action buttons */
  .bar-btn {
    padding: 0 var(--space-3);
    border-radius: var(--radius-md);
    font-size: 15px;
    font-weight: 600;
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

  .clear-btn {
    background: none;
    color: var(--color-text-dim);
    border: 1px solid var(--color-border);
  }
  .clear-btn:hover:not(:disabled) { border-color: var(--color-red); color: var(--color-red); }

  .battle-btn {
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-left: auto;
    padding: 0 var(--space-4);
  }
  .battle-btn:hover:not(:disabled) { filter: brightness(1.15); }
</style>
