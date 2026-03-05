<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore, activations } from '../../stores/gameStore';
  import type { AdversaryStatBlock, AdversaryColor, DifficultyLevel } from '../../types/game';
  import {
    adversaryPortraitUrl, classCardArtUrl, speciesCardArtUrl,
    classCardBackUrl, speciesCardBackUrl,
  } from '../../lib/assets';
  import ColorBadge from './ColorBadge.svelte';

  const COLORS: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];
  // difficulty 0 = 1 star, 1 = 2 stars, 2 = 3 stars, 3 = 4 stars
  const STARS: Record<DifficultyLevel, string> = { 0: '★', 1: '★★', 2: '★★★', 3: '★★★★' };

  let statsJson: Record<string, AdversaryStatBlock[]> | null = null;
  onMount(() => {
    fetch('/game-data/data/adversary-stats.json').then(r => r.json()).then(d => statsJson = d);
  });

  $: selectedName = $gameStore.turn.selectedAdversaryName;
  $: selectedId   = $gameStore.turn.selectedUnitId;

  $: groupUnits = selectedName
    ? $gameStore.turn.units.filter(u => u.adversaryName === selectedName)
    : [];
  $: difficulty = groupUnits[0]?.difficulty ?? 1 as DifficultyLevel;
  $: stats = (selectedName && statsJson) ? (statsJson[selectedName]?.[difficulty] ?? null) : null;
  $: speciesName = groupUnits[0]?.species;
  $: className   = groupUnits[0]?.className;

  $: activation = selectedId ? ($activations.find(e => e.unit.id === selectedId) ?? null) : null;

  $: fullClassEntry = (activation && className)
    ? ($gameStore.jsonCache.class[className]?.[activation.classCardIndex] ?? null)
    : null;

  // Card image URLs
  $: speciesCardImageUrl = (activation && speciesName)
    ? speciesCardArtUrl(speciesName, activation.speciesCardIndex)
    : null;
  $: classCardImageUrl = (activation && className)
    ? classCardArtUrl(className, activation.classCardIndex)
    : null;

  // Aggregated flat action list: species actions then own-color class actions
  $: ownClassCard = (activation && fullClassEntry)
    ? fullClassEntry[activation.unit.color]
    : null;
</script>

<div class="detail">
  {#if !selectedName}
    <div class="no-sel">
      <p>Select an adversary from the list.</p>
    </div>

  {:else}
    <!-- Combined header: portrait + name + stars + stats -->
    <div class="adv-header">
      <img src={adversaryPortraitUrl(selectedName)} alt={selectedName} class="portrait" />
      <div class="adv-meta">
        <div class="name-row">
          <span class="adv-name">{selectedName}</span>
          <span class="stars">{STARS[difficulty]}</span>
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
    </div>

    <!-- Drawn card images (post-draw, ~2x size) -->
    {#if activation}
      <div class="drawn-cards">
        {#if speciesCardImageUrl}
          <div class="drawn-card-wrap">
            <span class="card-type-label">Species</span>
            <img src={speciesCardImageUrl} alt="Species card" class="drawn-card-img" />
          </div>
        {/if}
        {#if classCardImageUrl}
          <div class="drawn-card-wrap">
            <span class="card-type-label">Class · {activation.unit.color}</span>
            <img src={classCardImageUrl} alt="Class card" class="drawn-card-img" />
          </div>
        {/if}
      </div>
    {:else}
      <!-- Deck stacks pre-draw -->
      <div class="decks-row">
        {#if speciesName}
          <div class="deck-wrap">
            <div class="deck-stack">
              <div class="card c1" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
              <div class="card c2" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
              <div class="card c3" style="background-image:url('{speciesCardBackUrl(speciesName)}')"></div>
            </div>
            <span class="deck-label">Species</span>
          </div>
        {/if}
        {#if className}
          <div class="deck-wrap">
            <div class="deck-stack">
              <div class="card c1" style="background-image:url('{classCardBackUrl(className)}')"></div>
              <div class="card c2" style="background-image:url('{classCardBackUrl(className)}')"></div>
              <div class="card c3" style="background-image:url('{classCardBackUrl(className)}')"></div>
            </div>
            <span class="deck-label">Class</span>
          </div>
        {/if}
        <p class="no-draw-hint">Draw a turn to reveal cards</p>
      </div>
    {/if}

    <!-- Aggregated action list: species then own-color class -->
    {#if activation && ownClassCard}
      <div class="actions-panel">
        <!-- Species -->
        <div class="actions-group-header">
          <span class="ag-name">{activation.speciesCard.Name}</span>
          <span class="ag-ap">{activation.speciesCard.Cost} AP</span>
        </div>
        <div class="actions-list">
          {#each activation.speciesCard.Actions as step}
            <div class="action-row">
              <div class="action-main">
                <span class="action-verb">{step.Action}</span>
                {#if step.Value !== undefined}<span class="action-val">{step.Value > 0 ? '+' : ''}{step.Value}</span>{/if}
                {#if step.Mod}<span class="action-tag mod">{step.Mod}</span>{/if}
                {#if step.Type}<span class="action-tag type">{step.Type}</span>{/if}
                {#if step.Target}<span class="action-target">{step.Target}</span>{/if}
              </div>
              {#if step.Effect}<p class="action-effect">{step.Effect}</p>{/if}
              {#if step.Trigger}<p class="action-trigger">Trigger: {step.Trigger}</p>{/if}
            </div>
          {/each}
        </div>

        <!-- Own-color class -->
        <div class="actions-group-header">
          <span class="ag-name">{ownClassCard.Name}</span>
          <span class="ag-ap">{ownClassCard.Cost} AP</span>
          <ColorBadge color={activation.unit.color} />
        </div>
        <div class="actions-list">
          {#each ownClassCard.Actions as step}
            <div class="action-row">
              <div class="action-main">
                <span class="action-verb">{step.Action}</span>
                {#if step.Value !== undefined}<span class="action-val">{step.Value > 0 ? '+' : ''}{step.Value}</span>{/if}
                {#if step.Mod}<span class="action-tag mod">{step.Mod}</span>{/if}
                {#if step.Type}<span class="action-tag type">{step.Type}</span>{/if}
                {#if step.Target}<span class="action-target">{step.Target}</span>{/if}
              </div>
              {#if step.Effect}<p class="action-effect">{step.Effect}</p>{/if}
              {#if step.Trigger}<p class="action-trigger">Trigger: {step.Trigger}</p>{/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .detail {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .no-sel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dim);
    font-style: italic;
    text-align: center;
    padding: var(--space-8);
  }

  /* Header block: portrait + name/stars + stats in one unit */
  .adv-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    border-top: 1px solid var(--color-accent);
    flex-shrink: 0;
  }

  .portrait {
    width: 72px;
    height: 72px;
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

  .name-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .adv-name {
    font-family: var(--font-heading);
    font-size: 17px;
    color: var(--color-accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stars {
    font-size: 13px;
    color: var(--color-accent);
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  /* Inline stats row inside header */
  .stats-inline {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .si {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 var(--space-3);
  }
  .si:first-child { padding-left: 0; }

  .si-sep {
    width: 1px;
    height: 28px;
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

  .sv { font-size: 20px; font-weight: bold; line-height: 1; }

  .crit-line {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    font-size: 13px;
    color: var(--color-text-dim);
  }

  .crit-lbl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .crit-val { font-size: 13px; color: var(--color-text); font-style: italic; }

  /* Drawn card images */
  .drawn-cards {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-surface-alt);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
    justify-content: center;
  }

  .drawn-card-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .card-type-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }

  .drawn-card-img {
    width: 160px;
    height: 224px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-accent);
    box-shadow: var(--shadow-card);
  }

  /* Deck stacks pre-draw */
  .decks-row {
    display: flex;
    align-items: flex-end;
    gap: var(--space-6);
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-alt);
    flex-shrink: 0;
  }

  .deck-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .deck-stack {
    position: relative;
    width: 72px;
    height: 100px;
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

  .no-draw-hint {
    font-size: 12px;
    color: var(--color-text-dim);
    font-style: italic;
    align-self: center;
    flex: 1;
  }

  /* Aggregated actions panel */
  .actions-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .actions-group-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-4);
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
  }

  .ag-name { font-family: var(--font-heading); font-size: 14px; flex: 1; }
  .ag-ap   { font-size: 17px; font-weight: bold; color: var(--color-accent); flex-shrink: 0; }

  .actions-list {
    padding: var(--space-2) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .action-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: var(--space-1) 0;
  }

  .action-main {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .action-verb {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.05em;
    color: var(--color-text-dim);
    min-width: 52px;
    flex-shrink: 0;
  }
  .action-val {
    font-size: 17px;
    font-weight: bold;
    color: var(--color-text);
    flex-shrink: 0;
    line-height: 1;
  }
  .action-tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-radius: var(--radius-sm);
    padding: 1px var(--space-1);
    flex-shrink: 0;
  }
  .action-tag.mod {
    background: rgba(0,180,216,0.12);
    border: 1px solid rgba(0,180,216,0.3);
    color: var(--color-cyan);
  }
  .action-tag.type {
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    color: var(--color-text-dim);
  }
  .action-target {
    font-size: 11px;
    color: var(--color-text-dim);
    font-style: italic;
  }
  .action-effect {
    margin: 0;
    font-size: 12px;
    color: var(--color-text-dim);
    line-height: 1.45;
    padding-left: 52px;
  }
  .action-trigger {
    margin: 0;
    font-size: 11px;
    color: var(--color-accent);
    font-style: italic;
    padding-left: 52px;
  }
</style>
