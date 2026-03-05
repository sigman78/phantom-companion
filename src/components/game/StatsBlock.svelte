<script lang="ts">
  import type { AdversaryStatBlock } from '../../types/game';
  export let stats: AdversaryStatBlock;
</script>

<div class="stats-block">
  {#each [['HP', stats.HP], ['GUARD', stats.GUARD], ['ATTACK', stats.ATTACK], ['RANGE', stats.RANGE], ['CRIT', stats.CRIT]] as [label, val]}
    <div class="stat-row">
      <span class="label">{label}</span>
      <span class="value">{val}</span>
    </div>
  {/each}
</div>

<style>
  .stats-block {
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: var(--space-1) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .stat-row:last-child { border-bottom: none; }

  .label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }
  .value { font-size: 15px; font-weight: bold; }
</style>
