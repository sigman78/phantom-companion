<script lang="ts">
  import { onMount } from 'svelte';
  import {
    gameStore,
    setSetupDifficulty, toggleSetupType, startBattle,
  } from '../../stores/gameStore';
  import { ADVERSARY_TYPES } from '../../lib/adversaries';
  import { adversaryIconUrl, adversaryPortraitUrl } from '../../lib/assets';
  import { DIFFICULTY_STARS } from '../../lib/constants';
  import type { AdversaryStatBlock, DifficultyLevel } from '../../types/game';

  const LEVELS: DifficultyLevel[] = [0, 1, 2, 3];

  let statsJson: Record<string, AdversaryStatBlock[]> | null = null;
  onMount(() => {
    fetch('/game-data/data/adversary-stats.json').then(r => r.json()).then(d => statsJson = d);
  });

  $: setup          = $gameStore.setup;
  $: difficulty     = setup.difficulty;
  $: selectedTypes  = new Set(setup.selectedTypes);
  $: focusedName    = setup.selectedTypeName;
  $: focusedStats   = (focusedName && statsJson)
    ? (statsJson[focusedName]?.[difficulty] ?? null)
    : null;
  $: canBattle = setup.selectedTypes.length > 0;

  let starting = false;
  async function handleBattle() {
    if (!canBattle || starting) return;
    starting = true;
    await startBattle();
    starting = false;
  }
</script>

<div class="setup-screen">

  <!-- Top strip: difficulty selector + focused type stats preview -->
  <div class="top-strip">
    <div class="diff-group">
      <span class="strip-label">Difficulty</span>
      <div class="diff-btns">
        {#each LEVELS as level}
          <button
            class="diff-btn"
            class:active={difficulty === level}
            on:click={() => setSetupDifficulty(level)}
          >{DIFFICULTY_STARS[level]}</button>
        {/each}
      </div>
    </div>

    <div class="strip-sep"></div>

    {#if focusedName && focusedStats}
      <div class="stats-preview">
        <img src={adversaryPortraitUrl(focusedName)} alt={focusedName} class="preview-portrait" width="40" height="40" />
        <span class="preview-name">{focusedName}</span>
        <div class="preview-stats">
          <span class="ps"><span class="pl">HP</span><span class="pv">{focusedStats.HP}</span></span>
          <span class="ps-sep"></span>
          <span class="ps"><span class="pl">Guard</span><span class="pv">{focusedStats.GUARD}</span></span>
          <span class="ps-sep"></span>
          <span class="ps"><span class="pl">Atk</span><span class="pv">{focusedStats.ATTACK}</span></span>
          <span class="ps-sep"></span>
          <span class="ps"><span class="pl">Rng</span><span class="pv">{focusedStats.RANGE}</span></span>
          <span class="ps-sep"></span>
          <span class="ps"><span class="pl">Crit</span><span class="pv pv-crit">{focusedStats.CRIT}</span></span>
        </div>
      </div>
    {:else}
      <div class="strip-hint">Click a type to preview stats</div>
    {/if}
  </div>

  <!-- Type picker grid — full width, click to toggle in/out of mission -->
  <div class="grid-area">
    <div class="type-grid">
      {#each ADVERSARY_TYPES as type}
        <button
          class="type-cell"
          class:active={selectedTypes.has(type.name)}
          class:focused={focusedName === type.name}
          on:click={() => toggleSetupType(type.name)}
        >
          <img src={adversaryIconUrl(type.name)} alt={type.name} class="type-icon" width="72" height="72" />
          <span class="type-name">{type.name}</span>
          {#if selectedTypes.has(type.name)}
            <span class="in-play-dot"></span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

</div>

<!-- Setup bottom bar -->
<div class="setup-bar">
  <span class="sel-count">
    {#if setup.selectedTypes.length > 0}
      {setup.selectedTypes.length} {setup.selectedTypes.length === 1 ? 'type' : 'types'} in mission
    {:else}
      Select adversary types to begin
    {/if}
  </span>
  <button
    class="battle-btn"
    on:click={handleBattle}
    disabled={!canBattle || starting}
  >
    {starting ? 'Starting...' : 'In Battle!'}
  </button>
</div>

<style>
  .setup-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Top strip */
  .top-strip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    border-top: 2px solid;
    border-image-source: var(--brass-border-h);
    border-image-slice: 1;
    min-height: 64px;
  }

  .diff-group { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }
  .strip-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }
  .diff-btns { display: flex; gap: 3px; }
  .diff-btn {
    padding: 2px var(--space-2);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-dim);
    font-size: 14px;
    cursor: pointer;
    min-height: 40px;
    transition: all 0.1s;
  }
  .diff-btn:hover  { border-color: var(--color-accent-dim); color: var(--color-text); }
  .diff-btn.active { border-color: var(--color-accent); color: var(--color-accent); background: rgba(184,115,51,0.1); }

  .strip-sep { width: 1px; height: 40px; background: var(--color-border); flex-shrink: 0; }

  /* Stats preview */
  .stats-preview {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }
  .preview-portrait {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.7));
    flex-shrink: 0;
  }
  .preview-name {
    font-family: var(--font-heading);
    font-size: 16px;
    color: var(--color-accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .preview-stats {
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: nowrap;
  }
  .ps { display: flex; flex-direction: column; align-items: center; padding: 0 var(--space-2); }
  .ps-sep { width: 1px; height: 24px; background: var(--color-border); flex-shrink: 0; }
  .pl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--color-text-dim); margin-bottom: 1px; }
  .pv { font-size: 18px; font-weight: bold; line-height: 1; }
  .pv-crit { font-size: 13px; font-style: italic; font-weight: normal; }

  .strip-hint {
    flex: 1;
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    padding-left: var(--space-2);
  }

  /* Type grid */
  .grid-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-gutter: stable;
    background: var(--color-surface-alt);
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .type-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.12s, opacity 0.12s;
    opacity: 0.45;
    min-height: 44px;
  }
  .type-cell:hover { border-color: var(--color-accent-dim); opacity: 0.75; }

  /* In play — full presence */
  .type-cell.active {
    border-color: var(--color-accent);
    background: rgba(184, 115, 51, 0.1);
    opacity: 1;
  }
  /* Last-clicked — preview focus ring (works on both active and inactive) */
  .type-cell.focused {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  .type-icon { width: 72px; height: 72px; object-fit: contain; }
  .type-name {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    color: var(--color-text);
    line-height: 1.3;
  }

  /* Small dot indicator at bottom of cell when in play */
  .in-play-dot {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
    box-shadow: 0 0 4px var(--color-accent);
  }

  /* Setup bottom bar */
  .setup-bar {
    height: var(--bottom-bar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-4);
    background: var(--color-surface-alt);
    border-top: 3px solid;
    border-image-source: var(--brass-border-h);
    border-image-slice: 1;
  }

  .sel-count {
    font-size: 13px;
    color: var(--color-text-dim);
    font-style: italic;
  }

  .battle-btn {
    padding: 0 var(--space-6);
    min-height: 44px;
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    border-radius: var(--radius-md);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: filter 0.12s;
  }
  .battle-btn:hover:not(:disabled) { filter: brightness(1.15); }
  .battle-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
