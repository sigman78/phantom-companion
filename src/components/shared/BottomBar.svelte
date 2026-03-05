<script lang="ts">
  import { gameStore, activations, currentTurn, drawTurn, endTurn, nextActivation, prevActivation } from '../../stores/gameStore';

  export let onManageRoster: () => void = () => {};

  $: drawn     = $activations.length > 0;
  $: idx       = $gameStore.turn.activeActivationIndex;
  $: total     = $activations.length;
  $: allDead   = $gameStore.turn.units.length > 0
               && $gameStore.turn.units.every(u => !u.alive);
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

  <!-- Draw Turn -->
  <button
    class="cell action-btn"
    on:click={drawTurn}
    disabled={drawn || allDead}
  >
    Draw
  </button>

  <!-- End Turn -->
  <button
    class="cell action-btn"
    on:click={endTurn}
    disabled={!drawn}
  >
    End Turn
  </button>

  <!-- Roster -->
  <button class="cell roster-btn" on:click={onManageRoster}>
    Roster
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
  }
  .cell:last-child { border-right: none; }
  .cell:disabled   { opacity: 0.3; cursor: not-allowed; }
  .cell:not(:disabled):active { background: rgba(255,255,255,0.06); }

  /* Prev / Next: prominent touch targets */
  .nav-btn {
    flex: 1.6;
    font-size: 38px;
    line-height: 1;
    color: var(--color-accent);
  }
  .nav-btn:not(:disabled):hover { background: rgba(184,115,51,0.12); }

  /* Turn counter: compact center block */
  .turn-cell {
    flex: 0.7;
    gap: 2px;
    cursor: default;
    border-right: 1px solid var(--color-border);
  }
  .turn-num { font-size: 13px; font-weight: 600; color: var(--color-text); }
  .turn-sub { font-size: 11px; color: var(--color-text-dim); }

  /* Action buttons */
  .action-btn {
    flex: 1.4;
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text);
  }
  .action-btn:not(:disabled):hover { background: var(--texture-leather); }

  /* Roster */
  .roster-btn {
    flex: 1;
    font-size: 13px;
    color: var(--color-accent);
  }
  .roster-btn:hover { background: rgba(184,115,51,0.1); }
</style>
