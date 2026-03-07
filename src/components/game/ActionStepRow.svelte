<script lang="ts">
  import type { ActionStep } from '../../types/game';
  import { highlight } from '../../lib/highlight';

  export let step: ActionStep;
</script>

<div class="action-row">
  <div class="action-main">
    <span class="action-verb">{step.Action}</span>
    {#if step.Value !== undefined}<span class="action-val">{step.Value > 0 ? '+' : ''}{step.Value}</span>{/if}
    {#if step.Mod}<span class="action-tag mod">{step.Mod}</span>{/if}
    {#if step.Type}<span class="action-tag type">{step.Type}</span>{/if}
    {#if step.Target}<span class="action-target">{step.Target}</span>{/if}
  </div>
  {#if step.Effect}<p class="action-effect">{@html highlight(step.Effect)}</p>{/if}
  {#if step.Trigger}<p class="action-trigger">{@html highlight(step.Trigger)}</p>{/if}
</div>

<style>
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
    font-size: 14px;
    color: var(--color-text-dim);
    line-height: 1.5;
    padding-left: 52px;
  }

  .action-trigger {
    margin: 0;
    font-size: 13px;
    color: var(--color-accent);
    font-style: italic;
    padding-left: 52px;
  }
</style>
