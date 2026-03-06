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
    {#if !drawn}
      <!-- Pre-draw: deck stacks + Draw overlay tap target -->
      <div
        class="deck-area pre-draw"
        on:click={drawTurn}
        role="button"
        tabindex="0"
        on:keydown={e => e.key === 'Enter' && drawTurn()}
        aria-label="Draw cards"
      >
        <div class="decks-row">
          {#if speciesName}
            <div class="deck-wrap">
              <div class="deck-stack" style="--stack-h:{stackH(speciesRemaining)}">
                <div class="card c1" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
                <div class="card c2" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
                <div class="card c3" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
              </div>
              <span class="deck-label">Species</span>
              <span class="deck-count">{speciesRemaining} left</span>
            </div>
          {/if}
          {#if className}
            <div class="deck-wrap">
              <div class="deck-stack" style="--stack-h:{stackH(classRemaining)}">
                <div class="card c1" style="background-image:url('{classCardBackUrl(className)}')"></div>
                <div class="card c2" style="background-image:url('{classCardBackUrl(className)}')"></div>
                <div class="card c3" style="background-image:url('{classCardBackUrl(className)}')"></div>
              </div>
              <span class="deck-label">Class</span>
              <span class="deck-count">{classRemaining} left</span>
            </div>
          {/if}
        </div>
        <div class="draw-overlay">
          <span class="draw-label">Draw Cards</span>
        </div>
      </div>

    {:else}
      <!-- Post-draw: card images with reveal animation -->
      <div class="deck-area post-draw">
        <div class="drawn-cards-row">
          {#if speciesCardImageUrl}
            {#key speciesCardImageUrl}
              <div class="drawn-card-wrap">
                <span class="card-type-label">Species</span>
                <img src={speciesCardImageUrl} alt="Species card" class="drawn-card-img card-revealed" />
              </div>
            {/key}
          {/if}
          {#if classCardImageUrl}
            {#key classCardImageUrl}
              <div class="drawn-card-wrap">
                <span class="card-type-label">Class &middot; {activation?.unit.color}</span>
                <img src={classCardImageUrl} alt="Class card" class="drawn-card-img card-revealed" />
              </div>
            {/key}
          {/if}
        </div>
      </div>
    {/if}
  </div>

</div>

<style>
  .detail {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* TOP SECTION: 45% of height */
  .top-section {
    flex: 45;
    min-height: 0;
    display: flex;
    border-bottom: 2px solid var(--color-border);
    overflow: hidden;
  }

  /* Left col: portrait + stats (45% of top width) */
  .top-left {
    width: 45%;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--color-border);
    background: var(--color-surface);
    border-top: 1px solid var(--color-accent);
    overflow: hidden;
  }

  .portrait-wrap {
    display: flex;
    justify-content: center;
    padding: var(--space-3) var(--space-3) var(--space-2);
    flex-shrink: 0;
  }
  .portrait {
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6));
  }

  .adv-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 0 var(--space-3) var(--space-3);
    min-height: 0;
    overflow: hidden;
  }

  .name-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .adv-name {
    font-family: var(--font-heading);
    font-size: 15px;
    color: var(--color-accent);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  }
  .si {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 var(--space-2);
  }
  .si:first-child { padding-left: 0; }
  .si-sep {
    width: 1px;
    height: 24px;
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

  /* BOTTOM SECTION: 55% of height */
  .bottom-section {
    flex: 55;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Deck area - shared */
  .deck-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-surface-alt);
  }

  /* Pre-draw: tappable draw area */
  .deck-area.pre-draw {
    cursor: pointer;
    position: relative;
    justify-content: center;
    align-items: center;
    gap: var(--space-4);
    user-select: none;
  }
  .deck-area.pre-draw:hover .draw-overlay { background: rgba(184,115,51,0.18); }
  .deck-area.pre-draw:active .draw-overlay { background: rgba(184,115,51,0.28); }

  .decks-row {
    display: flex;
    gap: var(--space-8);
    align-items: flex-end;
    justify-content: center;
    padding: var(--space-4) var(--space-4) 0;
    z-index: 1;
  }

  .deck-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .deck-stack {
    position: relative;
    width: 80px;
    height: var(--stack-h, 88px);
  }

  .card {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background-size: cover;
    background-position: center;
    box-shadow: var(--shadow-card);
  }
  .c1 { transform: rotate(-3deg) translate(-3px, 4px); }
  .c2 { transform: rotate(-1.5deg) translate(-1px, 2px); }
  .c3 { transform: none; }

  .deck-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }
  .deck-count {
    font-size: 10px;
    color: var(--color-text-dim);
    opacity: 0.6;
  }

  .draw-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: var(--space-6);
    background: rgba(14,12,10,0.35);
    transition: background 0.15s;
    z-index: 2;
  }

  .draw-label {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--color-accent);
    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  }

  /* Post-draw: card images */
  .deck-area.post-draw {
    justify-content: center;
    align-items: center;
  }

  .drawn-cards-row {
    display: flex;
    gap: var(--space-6);
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    height: 100%;
  }

  .drawn-card-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    height: 100%;
    justify-content: center;
  }

  .card-type-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
    flex-shrink: 0;
  }

  .drawn-card-img {
    flex: 1;
    min-height: 0;
    max-width: 140px;
    width: 100%;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-accent);
    box-shadow: var(--shadow-card);
  }
</style>
