<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { gameStore, markUnitDead, reviveUnit, removeAdversaryGroup, adversaryGroups } from '../../stores/gameStore';
  import { adversaryIconUrl } from '../../lib/assets';
  import { ADVERSARY_COLORS, DIFFICULTY_STARS, COLOR_VAR } from '../../lib/constants';

  const dispatch = createEventDispatcher<{ close: void }>();

  const close = () => dispatch('close');
</script>

<div class="overlay-backdrop" on:click|self={close} on:keydown={e => e.key === 'Escape' && close()} role="presentation">
  <div class="panel">
    <div class="overlay-header">
      <h2>Manage Roster</h2>
      <button class="close-btn" on:click={close}>Close</button>
    </div>

    <div class="panel-body">
      {#if $adversaryGroups.length === 0}
        <p class="hint">No adversaries in mission.</p>
      {:else}
        {#each $adversaryGroups as group}
          <div class="group-card">
            <div class="group-head">
              <img src={adversaryIconUrl(group.name)} alt="" class="group-icon" />
              <div class="group-info">
                <span class="group-name">{group.name}</span>
                <span class="group-diff">{DIFFICULTY_STARS[group.difficulty]}</span>
              </div>
              <button class="remove-group-btn" on:click={() => removeAdversaryGroup(group.name)}>
                Remove Group
              </button>
            </div>

            <div class="color-rows">
              {#each ADVERSARY_COLORS as color}
                {@const unit = group.units.find(u => u.color === color)}
                {#if unit}
                  <div class="color-row" class:dead={!unit.alive}>
                    <span class="dot" style="background:{COLOR_VAR[color]}"></span>
                    <span class="color-name">{color}</span>
                    <button
                      class="toggle-btn"
                      on:click={() => unit.alive ? markUnitDead(unit.id) : reviveUnit(unit.id)}
                    >
                      {unit.alive ? 'Mark Dead' : 'Revive'}
                    </button>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 2px solid var(--color-accent);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-panel);
    width: min(560px, 90vw);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  h2 { font-family: var(--font-heading); font-size: 18px; color: var(--color-accent); }

  .close-btn {
    padding: var(--space-1) var(--space-4);
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .close-btn:hover { border-color: var(--color-accent-dim); }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .hint { color: var(--color-text-dim); font-style: italic; font-size: 13px; }

  .group-card {
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .group-head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .group-icon { width: 36px; height: 36px; object-fit: contain; }
  .group-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
  .group-name { font-size: 15px; font-weight: 500; }
  .group-diff { font-size: 12px; color: var(--color-accent); letter-spacing: 1px; }

  .remove-group-btn {
    font-size: 12px;
    padding: var(--space-1) var(--space-3);
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-dim);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .remove-group-btn:hover { border-color: var(--color-red); color: var(--color-red); }

  .color-rows { padding: var(--space-2) var(--space-4); display: flex; flex-direction: column; gap: 2px; }

  .color-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) 0;
  }
  .color-row.dead { opacity: 0.4; }

  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .color-name { flex: 1; font-size: 14px; }

  .toggle-btn {
    font-size: 12px;
    padding: 2px var(--space-2);
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-dim);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .toggle-btn:hover { border-color: var(--color-accent-dim); color: var(--color-text); }
</style>
