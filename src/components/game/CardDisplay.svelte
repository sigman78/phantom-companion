<script lang="ts">
  import type { SpeciesCard, ColorCard, SpeciesName, ClassName } from '../../types/game';
  import {
    classCardArtUrl, classCardBackUrl,
    speciesCardArtUrl, speciesCardBackUrl,
  } from '../../lib/assets';

  export let type: 'species' | 'class';
  export let card: SpeciesCard | ColorCard | null;
  export let cardIndex: number | null;
  export let species: SpeciesName | undefined = undefined;
  export let className: ClassName | undefined = undefined;

  $: faceUrl = (() => {
    if (!card || cardIndex === null) return null;
    if (type === 'species' && species) return speciesCardArtUrl(species, cardIndex);
    if (type === 'class'   && className) return classCardArtUrl(className, cardIndex);
    return null;
  })();

  $: backUrl = (() => {
    if (type === 'class'   && className) return classCardBackUrl(className);
    if (type === 'species' && species)   return speciesCardBackUrl(species);
    return '';
  })();
</script>

<div class="card-display">
  <div class="card-label">{type === 'species' ? 'Species' : 'Class'} Card</div>

  {#if card && faceUrl}
    <img src={faceUrl} alt="" class="card-img" />
    <div class="card-info">
      <span class="card-name">{card.Name}</span>
      <span class="card-cost">{card.Cost} AP</span>
    </div>
    <div class="actions">
      {#each card.Actions as step}
        <div class="action">
          <span class="action-name">{step.Action}</span>
          {#if step.Value !== undefined}<span class="action-val">{step.Value}</span>{/if}
          {#if step.Effect}<span class="action-fx">{step.Effect}</span>{/if}
          {#if step.Target}<span class="action-fx">{step.Target}</span>{/if}
        </div>
      {/each}
    </div>
  {:else}
    <img src={backUrl} alt="Card back" class="card-img card-back" />
    <p class="no-card">Draw a turn to reveal</p>
  {/if}
</div>

<style>
  .card-display {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .card-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-dim);
  }

  .card-img {
    width: 100%;
    aspect-ratio: 300 / 420;
    object-fit: cover;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card), var(--shadow-inset);
    border: 1px solid var(--color-border);
  }
  .card-back { opacity: 0.6; }

  .card-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .card-name { font-family: var(--font-heading); font-size: 13px; }
  .card-cost { font-size: 12px; color: var(--color-accent); }

  .actions { display: flex; flex-direction: column; gap: var(--space-1); font-size: 12px; }

  .action {
    display: flex;
    gap: var(--space-2);
    align-items: baseline;
    padding: var(--space-1) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .action:last-child { border-bottom: none; }

  .action-name {
    color: var(--color-text-dim);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }
  .action-val { font-weight: bold; }
  .action-fx  { color: var(--color-text-dim); font-style: italic; }

  .no-card {
    font-size: 11px;
    color: var(--color-text-dim);
    font-style: italic;
    text-align: center;
  }
</style>
