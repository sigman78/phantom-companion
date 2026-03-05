<script lang="ts">
  export let backUrl: string;
  export let label: string;
  export let hasCard: boolean = false; // true when a card has been drawn this turn
</script>

<div class="deck-wrap">
  <div class="deck-stack">
    <div class="card c1" style="background-image: url('{backUrl}')"></div>
    <div class="card c2" style="background-image: url('{backUrl}')"></div>
    <div class="card c3" style="background-image: url('{backUrl}')">
      {#if hasCard}
        <div class="drawn-indicator" title="Card drawn this turn"></div>
      {/if}
    </div>
  </div>
  <span class="label">{label}</span>
</div>

<style>
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

  .drawn-indicator {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-sm);
    border: 2px solid var(--color-accent);
    opacity: 0.7;
  }

  .label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }
</style>
