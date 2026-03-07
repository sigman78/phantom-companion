<script lang="ts">
  import { gameStore, activations, currentTurn, endTurn, nextActivation, prevActivation } from '../../stores/gameStore';

  export let onOpenRoster: () => void = () => {};

  $: drawn   = $activations.length > 0;
  $: idx     = $gameStore.turn.activeActivationIndex;
  $: total   = $activations.length;
  $: isLast  = drawn && idx === total - 1;
</script>

<div class="bottom-bar">
  <!-- Prev -->
  <button
    class="cell nav-btn"
    on:click={prevActivation}
    disabled={!drawn || idx <= 0}
    aria-label="Previous"
  >
    &#8249;
  </button>

  <!-- Turn counter -->
  <div class="cell turn-cell">
    <span class="turn-num">Turn {$currentTurn}</span>
    {#if drawn}
      <span class="turn-sub">{idx + 1} / {total}</span>
    {/if}
  </div>

  <!-- Next -->
  <button
    class="cell nav-btn"
    on:click={nextActivation}
    disabled={!drawn || idx >= total - 1}
    aria-label="Next"
  >
    &#8250;
  </button>

  <!-- Roster -->
  <button class="cell adversaries-btn" on:click={onOpenRoster}>
    Roster
  </button>

  <!-- End Turn -->
  <button
    class="cell end-turn-btn"
    class:highlight={isLast}
    on:click={endTurn}
    disabled={!drawn}
  >
    End Turn
  </button>
</div>

<style>
  .bottom-bar {
    height: var(--bottom-bar-height);
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    background: var(--color-surface-alt);
    border-top: 2px solid var(--color-border);
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: none;
    border-right: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    padding: 0;
    font-family: var(--font-body);
    transition: background 0.12s;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
  }
  .cell:last-child { border-right: none; }
  .cell:disabled   { opacity: 0.3; cursor: not-allowed; }
  .cell:not(:disabled):active { background: rgba(255,255,255,0.06); }

  /* Prev / Next: largest touch targets */
  .nav-btn {
    flex: 2;
    font-size: 38px;
    line-height: 1;
    color: var(--color-accent);
  }
  .nav-btn:not(:disabled):hover { background: rgba(184,115,51,0.12); }

  /* Turn counter: compact center block */
  .turn-cell {
    flex: 0.8;
    gap: 2px;
    cursor: default;
    border-right: 1px solid var(--color-border);
  }
  .turn-num { font-size: 13px; font-weight: 600; color: var(--color-text); }
  .turn-sub { font-size: 11px; color: var(--color-text-dim); }

  /* Adversaries */
  .adversaries-btn {
    flex: 1.5;
    font-size: 14px;
    color: var(--color-accent);
  }
  .adversaries-btn:hover { background: rgba(184,115,51,0.1); }

  /* End Turn */
  .end-turn-btn {
    flex: 1.5;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }
  .end-turn-btn:not(:disabled):hover { background: var(--texture-leather); }
  .end-turn-btn.highlight {
    color: var(--color-accent);
    border-left: 1px solid var(--color-accent-dim);
    background: rgba(184,115,51,0.08);
  }
  .end-turn-btn.highlight:not(:disabled):hover { background: rgba(184,115,51,0.18); }
</style>
