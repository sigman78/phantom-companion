<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ADVERSARY_TYPES } from '../../lib/adversaries';
  import { adversaryIconUrl } from '../../lib/assets';
  import { addAdversaryGroup } from '../../stores/gameStore';
  import type { AdversaryType, DifficultyLevel } from '../../types/game';

  const dispatch = createEventDispatcher<{ close: void }>();

  const DIFFICULTIES: Array<{ level: DifficultyLevel; stars: string }> = [
    { level: 0, stars: '★' },
    { level: 1, stars: '★★' },
    { level: 2, stars: '★★★' },
    { level: 3, stars: '★★★★' },
  ];

  let selected: AdversaryType | null = null;
  let difficulty: DifficultyLevel = 1;
  let adding = false;

  async function handleAdd() {
    if (!selected) return;
    adding = true;
    await addAdversaryGroup(selected, difficulty);
    adding = false;
    dispatch('close');
  }

  const close = () => dispatch('close');
</script>

<div class="backdrop" on:click|self={close} role="dialog" aria-modal="true">
  <div class="modal">
    <div class="modal-header">
      <h2>Add Adversary</h2>
      <button class="close-btn" on:click={close}>x</button>
    </div>

    <div class="modal-body">
      <div class="adv-grid">
        {#each ADVERSARY_TYPES as type}
          <button
            class="adv-cell"
            class:sel={selected?.name === type.name}
            on:click={() => selected = type}
          >
            <img src={adversaryIconUrl(type.name)} alt={type.name} class="adv-icon" />
            <span class="adv-name">{type.name}</span>
          </button>
        {/each}
      </div>

      <div class="footer">
        <div class="diff-row">
          <span class="diff-label">Difficulty</span>
          <div class="diff-btns">
            {#each DIFFICULTIES as d}
              <button
                class="diff-btn"
                class:active={difficulty === d.level}
                on:click={() => difficulty = d.level}
              >
                {d.stars}
              </button>
            {/each}
          </div>
        </div>

        <button
          class="add-btn"
          on:click={handleAdd}
          disabled={!selected || adding}
        >
          {#if adding}Adding...{:else if selected}Add {selected.name}{:else}Select an adversary{/if}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 2px solid var(--color-accent);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-panel);
    width: min(700px, 92vw);
    max-height: 86vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  h2 { font-family: var(--font-heading); font-size: 18px; color: var(--color-accent); }

  .close-btn {
    background: none; border: none;
    color: var(--color-text-dim); font-size: 18px;
    cursor: pointer; padding: 0 var(--space-2); line-height: 1;
  }
  .close-btn:hover { color: var(--color-text); }

  .modal-body {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
  }

  .adv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: var(--space-2);
    padding: var(--space-4);
    overflow-y: auto;
    flex: 1;
  }

  .adv-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.12s;
  }
  .adv-cell:hover { border-color: var(--color-accent-dim); }
  .adv-cell.sel   { border-color: var(--color-accent); background: rgba(184,115,51,0.12); }

  .adv-icon { width: 56px; height: 56px; object-fit: contain; }

  .adv-name {
    font-size: 11px;
    text-align: center;
    color: var(--color-text-dim);
    line-height: 1.3;
  }
  .adv-cell.sel .adv-name { color: var(--color-text); }

  .footer {
    flex-shrink: 0;
    border-top: 1px solid var(--color-border);
    padding: var(--space-4) var(--space-6);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    background: var(--color-surface-alt);
  }

  .diff-row { display: flex; align-items: center; gap: var(--space-3); }
  .diff-label { font-size: 12px; color: var(--color-text-dim); text-transform: uppercase; letter-spacing: 0.06em; }

  .diff-btns { display: flex; gap: var(--space-1); }

  .diff-btn {
    padding: var(--space-1) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-dim);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.12s;
  }
  .diff-btn:hover  { border-color: var(--color-accent-dim); color: var(--color-text); }
  .diff-btn.active { border-color: var(--color-accent); color: var(--color-accent); background: rgba(184,115,51,0.1); }

  .add-btn {
    padding: var(--space-2) var(--space-6);
    background: var(--color-accent-dim);
    color: var(--color-text);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-md);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .add-btn:hover:not(:disabled) { background: var(--color-accent); }
  .add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
