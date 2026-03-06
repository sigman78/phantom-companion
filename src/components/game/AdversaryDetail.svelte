<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore, activations, adversaryGroups, drawTurn } from '../../stores/gameStore';
  import type { AdversaryStatBlock, DifficultyLevel } from '../../types/game';
  import {
    adversaryPortraitUrl, classCardArtUrl, speciesCardArtUrl,
    classCardBackUrl, speciesCardBackUrl,
  } from '../../lib/assets';
  import { deckKey } from '../../lib/deck';
  import ColorBadge from './ColorBadge.svelte';
  import ActionStepRow from './ActionStepRow.svelte';
  import { DIFFICULTY_STARS } from '../../lib/constants';

  let statsJson: Record<string, AdversaryStatBlock[]> | null = null;
  onMount(() => {
    fetch('/game-data/data/adversary-stats.json').then(r => r.json()).then(d => statsJson = d);
  });

  // Current activation (post-draw)
  $: activeIdx  = $gameStore.turn.activeActivationIndex;
  $: activation = $activations[activeIdx] ?? null;

  // Which adversary to display (post-draw: active unit; pre-draw: first group)
  $: displayName = activation?.unit.adversaryName
    ?? $gameStore.turn.selectedAdversaryName
    ?? $adversaryGroups[0]?.name
    ?? null;
  $: displayUnit = displayName
    ? $gameStore.turn.units.find(u => u.adversaryName === displayName) ?? null
    : null;
  $: difficulty = (displayUnit?.difficulty ?? 1) as DifficultyLevel;
  $: stats = (displayName && statsJson) ? (statsJson[displayName]?.[difficulty] ?? null) : null;
  $: speciesName = displayUnit?.species;
  $: className   = displayUnit?.className;

  // Deck state for stack height
  $: dk          = (speciesName && className) ? deckKey(speciesName, className) : null;
  $: deckState   = dk ? $gameStore.turn.decks[dk] : null;
  $: speciesRemaining = deckState?.speciesIndices.length ?? 10;
  $: classRemaining   = deckState?.classIndices.length ?? 10;

  // Post-draw card data
  $: drawn = $activations.length > 0;
  $: fullClassEntry = (activation && className)
    ? ($gameStore.jsonCache.class[className]?.[activation.classCardIndex] ?? null)
    : null;
  $: ownClassCard = (activation && fullClassEntry)
    ? (fullClassEntry.find(c => c.Color === activation.unit.color) ?? fullClassEntry[0])
    : null;
  $: speciesCardImageUrl = (activation && speciesName)
    ? speciesCardArtUrl(speciesName, activation.speciesCardIndex)
    : null;
  $: classCardImageUrl = (activation && className)
    ? classCardArtUrl(className, activation.classCardIndex)
    : null;

  function stackH(remaining: number): string {
    return `${Math.max(28, Math.round(remaining / 10 * 110))}px`;
  }
</script>

<div class="detail">

  <!-- TOP: portrait+stats | action text -->
  <div class="top-section">

    <!-- Left col: portrait, name, stars, stats, crit -->
    <div class="top-left">
      {#if displayName}
        <div class="portrait-wrap">
          <img src={adversaryPortraitUrl(displayName)} alt={displayName} class="portrait" />
        </div>
        <div class="adv-meta">
          <div class="name-row">
            <span class="adv-name">{displayName}</span>
            <span class="stars">{DIFFICULTY_STARS[difficulty]}</span>
          </div>
          {#if stats}
            <div class="stats-inline">
              <span class="si"><span class="sl">HP</span><span class="sv">{stats.HP}</span></span>
              <span class="si-sep"></span>
              <span class="si"><span class="sl">Guard</span><span class="sv">{stats.GUARD}</span></span>
              <span class="si-sep"></span>
              <span class="si"><span class="sl">Atk</span><span class="sv">{stats.ATTACK}</span></span>
              <span class="si-sep"></span>
              <span class="si"><span class="sl">Rng</span><span class="sv">{stats.RANGE}</span></span>
            </div>
            <div class="crit-line">
              <span class="crit-lbl">Crit</span>
              <span class="crit-val">{stats.CRIT}</span>
            </div>
          {/if}
        </div>
      {:else}
        <div class="no-sel">Select an adversary.</div>
      {/if}
    </div>

    <!-- Right col: drawn card action text -->
    <div class="top-right">
      {#if activation && ownClassCard}
        <div class="actions-group-header">
          <span class="ag-name">{activation.speciesCard.Name}</span>
          <span class="ag-ap">{activation.speciesCard.Cost} AP</span>
        </div>
        <div class="actions-list">
          {#each activation.speciesCard.Actions as step}
            <ActionStepRow {step} />
          {/each}
        </div>

        <div class="actions-group-header">
          <span class="ag-name">{ownClassCard.Name}</span>
          <span class="ag-ap">{ownClassCard.Cost} AP</span>
          <ColorBadge color={activation.unit.color} />
        </div>
        <div class="actions-list">
          {#each ownClassCard.Actions as step}
            <ActionStepRow {step} />
          {/each}
        </div>
      {:else}
        <div class="no-actions">
          {#if drawn}
            No actions for this unit.
          {:else if displayName}
            Draw cards to see actions.
          {:else}
            Add adversaries to begin.
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- BOTTOM: deck area -->
  <div class="bottom-section">
    <div
      class="deck-area"
      class:pre-draw={!drawn}
      on:click={!drawn ? drawTurn : undefined}
      role={!drawn ? 'button' : undefined}
      tabindex={!drawn ? 0 : undefined}
      on:keydown={!drawn ? (e => e.key === 'Enter' && drawTurn()) : undefined}
      aria-label={!drawn ? 'Draw cards' : undefined}
    >
      {#if speciesName}
        <div class="deck-unit">
          <div class="deck-stack">
            <div class="card c1" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
            <div class="card c2" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
            <div class="card c3" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
            {#if drawn && speciesCardImageUrl}
              {#key speciesCardImageUrl}
                <div
                  class="card face-up card-revealed"
                  style="background-image:url('{speciesCardImageUrl}')"
                ></div>
              {/key}
            {/if}
          </div>
          <span class="deck-label">Species</span>
        </div>
      {/if}
      {#if className}
        <div class="deck-unit">
          <div class="deck-stack">
            <div class="card c1" style="background-image:url('{classCardBackUrl(className)}')"></div>
            <div class="card c2" style="background-image:url('{classCardBackUrl(className)}')"></div>
            <div class="card c3" style="background-image:url('{classCardBackUrl(className)}')"></div>
            {#if drawn && classCardImageUrl}
              {#key classCardImageUrl}
                <div
                  class="card face-up card-revealed"
                  style="background-image:url('{classCardImageUrl}')"
                ></div>
              {/key}
            {/if}
          </div>
          <span class="deck-label">{activation ? `Class \u00b7 ${activation.unit.color}` : 'Class'}</span>
        </div>
      {/if}
      {#if !drawn && (speciesName || className)}
        <div class="draw-prompt">Tap to draw</div>
      {/if}
    </div>
  </div>

</div>

<style>
  .detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* TOP SECTION: auto-height by content */
  .top-section {
    flex-shrink: 0;
    display: flex;
    border-bottom: 2px solid var(--color-border);
  }

  /* Left col: portrait + stats (30% of top width) */
  .top-left {
    width: 30%;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid var(--color-border);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
  }

  .portrait-wrap {
    display: flex;
    justify-content: center;
    padding: var(--space-3) var(--space-3) var(--space-2);
    flex-shrink: 0;
  }
  .portrait {
    width: 72px;
    height: 72px;
    object-fit: contain;
    filter: drop-shadow(0 3px 8px rgba(0,0,0,0.8));
  }

  .adv-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: 0 var(--space-3) var(--space-3);
    text-align: center;
    width: 100%;
  }

  .name-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }
  .adv-name {
    font-family: var(--font-heading);
    font-size: 15px;
    color: var(--color-accent);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
  .stars {
    font-size: 12px;
    color: var(--color-accent);
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  .stats-inline {
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: nowrap;
    justify-content: center;
  }
  .si {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 8px;
  }
  .si:first-child { padding-left: 0; }
  .si-sep {
    width: 1px;
    height: 20px;
    background: var(--color-border);
    flex-shrink: 0;
  }
  .sl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-dim);
    margin-bottom: 1px;
  }
  .sv { font-size: 18px; font-weight: bold; line-height: 1; }

  .crit-line {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    justify-content: center;
    text-align: center;
  }
  .crit-lbl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-dim);
  }
  .crit-val { font-size: 12px; color: var(--color-text); font-style: italic; }

  .no-sel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    padding: var(--space-4);
    text-align: center;
  }

  /* Right col: action text (55% of top width) */
  .top-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    border-top: 1px solid var(--color-accent);
    background: var(--color-surface);
  }

  .no-actions {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    padding: var(--space-4);
    text-align: center;
  }

  .actions-group-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    background: var(--color-surface-alt);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }
  .ag-name { font-family: var(--font-heading); font-size: 13px; flex: 1; }
  .ag-ap   { font-size: 16px; font-weight: bold; color: var(--color-accent); flex-shrink: 0; }

  .actions-list {
    padding: var(--space-1) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: 0;
    flex-shrink: 0;
  }

  /* BOTTOM SECTION: fills remaining space */
  .bottom-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Deck area - unified physical card design */
  .deck-area {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--space-8);
    padding: 24px;
    background: var(--color-surface-alt);
    flex-wrap: wrap;
  }

  .deck-area.pre-draw {
    cursor: pointer;
    user-select: none;
    outline: 1px solid rgba(184,115,51,0.0);
    animation: deck-pulse 2.5s ease-in-out infinite;
  }
  .deck-area.pre-draw:hover .c1,
  .deck-area.pre-draw:hover .c2,
  .deck-area.pre-draw:hover .c3 {
    filter: brightness(0.9);
  }

  .deck-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  /* Fixed 5:7 ratio (110x154) matches 300x420 art */
  .deck-stack {
    position: relative;
    width: 110px;
    height: 154px;
  }

  .card {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background-size: cover;
    background-position: center;
  }
  .c1 {
    transform: rotate(-2.5deg) translate(-3px, 4px);
    z-index: 1;
    filter: brightness(0.75);
    box-shadow: 1px 3px 6px rgba(0,0,0,0.7);
  }
  .c2 {
    transform: rotate(-1.2deg) translate(-1.5px, 2px);
    z-index: 2;
    filter: brightness(0.75);
    box-shadow: 1px 3px 6px rgba(0,0,0,0.7);
  }
  .c3 {
    transform: none;
    z-index: 3;
    filter: brightness(0.75);
    box-shadow: 1px 3px 6px rgba(0,0,0,0.7);
  }
  .face-up {
    z-index: 5;
    filter: none;
    box-shadow: 4px 8px 18px rgba(0,0,0,0.95), 0 0 0 2px var(--color-accent);
  }

  .deck-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }

  .draw-prompt {
    width: 100%;
    text-align: center;
    font-size: 13px;
    color: var(--color-accent);
    opacity: 0.7;
    letter-spacing: 0.04em;
  }
</style>
