<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ActivationEntry } from '../../types/game';
  import { adversaryIconUrl } from '../../lib/assets';

  export let entry: ActivationEntry;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher<{ select: string }>();
  const handleClick = () => dispatch('select', entry.unit.id);

  const COLOR_BG: Record<string, string> = {
    Red:    'rgba(192, 57,  43,  0.15)',
    Blue:   'rgba(41,  128, 185, 0.15)',
    Cyan:   'rgba(0,   180, 216, 0.12)',
    Yellow: 'rgba(212, 172, 13,  0.15)',
  };
  const COLOR_ACCENT: Record<string, string> = {
    Red:    'var(--color-red)',
    Blue:   'var(--color-blue)',
    Cyan:   'var(--color-cyan)',
    Yellow: 'var(--color-yellow)',
  };
</script>

<div
  class="row"
  class:selected
  class:dead={!entry.unit.alive}
  style="--row-color-bg:{COLOR_BG[entry.unit.color]}; --row-color-accent:{COLOR_ACCENT[entry.unit.color]}"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={e => e.key === 'Enter' && handleClick()}
>
  <span class="order">{entry.activationOrder}</span>
  <img src={adversaryIconUrl(entry.unit.adversaryName)} alt="" class="icon" />
  <div class="info">
    <span class="name">{entry.unit.adversaryName}</span>
    <span class="color-tag" style="color:var(--row-color-accent); border-color:var(--row-color-accent)">{entry.unit.color}</span>
  </div>
  <span class="init">{entry.initiative}</span>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    border-left: 4px solid var(--row-color-accent);
    background: var(--row-color-bg);
    cursor: pointer;
    transition: filter 0.1s;
  }
  .row:hover   { filter: brightness(1.15); }
  .row.selected {
    outline: 1px solid var(--row-color-accent);
    outline-offset: -1px;
    filter: brightness(1.2);
  }
  .row.dead { opacity: 0.35; }

  .order {
    width: 22px;
    text-align: right;
    font-size: 13px;
    color: var(--color-text-dim);
    flex-shrink: 0;
  }
  .icon { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }

  .info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .name { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .color-tag {
    display: inline-block;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 600;
    border: 1px solid;
    border-radius: var(--radius-sm);
    padding: 0 4px;
    align-self: flex-start;
  }

  .init {
    font-size: 20px;
    font-weight: bold;
    color: var(--color-accent);
    min-width: 32px;
    text-align: right;
    flex-shrink: 0;
  }
</style>
