<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { gameStore, restoreFromSave } from '../stores/gameStore';
  import { loadSavedState, clearSavedState, enableAutosave } from '../lib/persistence';
  import type { SavedState } from '../lib/persistence';
  import BottomBar from './shared/BottomBar.svelte';
  import ActivationList from './game/ActivationList.svelte';
  import AdversaryDetail from './game/AdversaryDetail.svelte';
  import SetupScreen from './game/SetupScreen.svelte';
  import BattleRosterScreen from './game/BattleRosterScreen.svelte';

  $: phase = $gameStore.phase;
  let rosterOpen = false;

  let savedState: SavedState | null = null;
  let restoring = false;

  onMount(() => {
    const found = loadSavedState();
    if (found && found.turn.units.length > 0) {
      savedState = found;
    } else {
      // Nothing to restore — enable auto-save immediately
      enableAutosave();
    }
  });

  async function handleResume() {
    if (!savedState || restoring) return;
    restoring = true;
    enableAutosave();
    await restoreFromSave(savedState);
    savedState = null;
    restoring = false;
  }

  function handleNewGame() {
    clearSavedState();
    savedState = null;
    enableAutosave();
  }

  $: groupCount = savedState
    ? new Set(savedState.turn.units.map(u => u.adversaryName)).size
    : 0;
</script>

{#if savedState}
  <div class="restore-backdrop" transition:fade={{ duration: 100 }}>
    <div class="restore-dialog">
      <h2 class="restore-title">Resume saved game?</h2>
      <p class="restore-info">
        {savedState.phase === 'battle'
          ? `Turn ${savedState.turn.turnNumber}`
          : 'Setup in progress'}
        &mdash;
        {groupCount} {groupCount === 1 ? 'adversary group' : 'adversary groups'}
      </p>
      <div class="restore-btns">
        <button class="r-btn r-resume" on:click={handleResume} disabled={restoring}>
          {restoring ? 'Loading...' : 'Resume'}
        </button>
        <button class="r-btn r-new" on:click={handleNewGame} disabled={restoring}>
          New Game
        </button>
      </div>
    </div>
  </div>
{/if}

{#if phase === 'setup'}
  <div transition:fade={{ duration: 120 }} style="display:contents">
    <SetupScreen />
  </div>

{:else if rosterOpen}
  <BattleRosterScreen on:close={() => rosterOpen = false} />

{:else}
  <!-- Battle screen -->
  <div transition:fade={{ duration: 120 }} style="display:contents">
    <div class="game-layout">
      <div class="panel-left">
        <ActivationList />
      </div>
      <div class="panel-right">
        <AdversaryDetail />
      </div>
    </div>
    <BottomBar onOpenRoster={() => rosterOpen = true} />
  </div>
{/if}

<style>
  .restore-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .restore-dialog {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 3px solid var(--color-accent);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    min-width: 300px;
    box-shadow: var(--shadow-panel);
  }

  .restore-title {
    font-family: var(--font-heading);
    font-size: 22px;
    color: var(--color-accent);
    text-align: center;
    font-weight: normal;
  }

  .restore-info {
    font-size: 14px;
    color: var(--color-text-dim);
    text-align: center;
  }

  .restore-btns {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }

  .r-btn {
    padding: 0 var(--space-6);
    min-height: 44px;
    border-radius: var(--radius-md);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.12s, background 0.12s;
  }
  .r-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .r-resume {
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
  }
  .r-resume:hover:not(:disabled) { filter: brightness(1.15); }

  .r-new {
    background: none;
    color: var(--color-text-dim);
    border: 1px solid var(--color-border);
  }
  .r-new:hover:not(:disabled) { border-color: var(--color-text-dim); color: var(--color-text); }
</style>
