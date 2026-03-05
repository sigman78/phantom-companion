<script lang="ts">
  import { gameStore, activations, currentTurn, drawTurn, endTurn } from '../../stores/gameStore';

  export let onManageRoster: () => void = () => {};

  $: hasActivations = $activations.length > 0;
  $: allDead = $gameStore.phase === 'game'
    && $gameStore.turn.units.length > 0
    && $gameStore.turn.units.every(u => !u.alive);
</script>

<div class="bottom-bar">
  <span class="turn-label">Turn <strong>{$currentTurn}</strong></span>
  <div class="controls">
    <button
      class="ctrl-btn"
      on:click={drawTurn}
      disabled={hasActivations || allDead}
      title={allDead ? 'All units defeated' : undefined}
    >
      Draw Turn
    </button>
    <button class="ctrl-btn" on:click={endTurn} disabled={!hasActivations}>
      End Turn
    </button>
    <button class="ctrl-btn ctrl-secondary" on:click={onManageRoster}>
      Manage Roster
    </button>
  </div>
</div>

<style>
  .bottom-bar {
    height: var(--bottom-bar-height);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    background: var(--color-surface-alt);
    border-top: 1px solid var(--color-border);
  }

  .turn-label { font-size: 14px; color: var(--color-text-dim); }
  .turn-label strong { color: var(--color-text); font-size: 17px; }

  .controls { display: flex; gap: var(--space-3); }

  .ctrl-btn {
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .ctrl-btn:hover:not(:disabled) { border-color: var(--color-accent-dim); }
  .ctrl-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .ctrl-secondary { border-color: var(--color-accent-dim); color: var(--color-accent); }
  .ctrl-secondary:hover { border-color: var(--color-accent); }
</style>
