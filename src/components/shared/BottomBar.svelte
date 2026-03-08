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
    border-top: 3px solid;
    border-image-source: var(--brass-border-h);
    border-image-slice: 1;
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
    /* Ensure text baseline does not pull content off-center */
    line-height: 1;
    transition: background 0.25s;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
  }
  .cell:last-child { border-right: none; }
  .cell:disabled   { opacity: 0.3; cursor: not-allowed; }
  .cell:not(:disabled):active { background: rgba(255,255,255,0.06); }

  /* Prev / Next: largest touch targets */
  .nav-btn {
    flex: 2;
    font-size: clamp(40px, 4.5vw, 58px);
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
    line-height: 1.2;
  }
  .turn-num { font-size: clamp(18px, 1.9vw, 23px); font-weight: 600; color: var(--color-text); }
  .turn-sub { font-size: clamp(14px, 1.5vw, 19px); color: var(--color-text-dim); }

  /* Adversaries */
  .adversaries-btn {
    flex: 1.5;
    font-size: clamp(18px, 2vw, 25px);
    color: var(--color-accent);
  }
  .adversaries-btn:hover { background: rgba(184,115,51,0.1); }

  /* End Turn */
  .end-turn-btn {
    flex: 1.5;
    font-size: clamp(18px, 2vw, 25px);
    font-weight: 500;
    color: var(--color-text);
  }
  .end-turn-btn:not(:disabled):hover { background: var(--texture-leather); }
  .end-turn-btn.highlight {
    color: var(--color-accent);
    border-left: 1px solid var(--color-accent-dim);
    background: rgba(184,115,51,0.08);
    animation: end-turn-glow 2.4s ease-in-out infinite;
  }
  .end-turn-btn.highlight:not(:disabled):hover { background: rgba(184,115,51,0.18); }

  @keyframes end-turn-glow {
    0%, 100% { box-shadow: inset 0 0 6px  rgba(184,115,51,0.15), 0 0 0   transparent; }
    50%       { box-shadow: inset 0 0 20px rgba(184,115,51,0.45), 0 0 10px rgba(184,115,51,0.28); }
  }
</style>
