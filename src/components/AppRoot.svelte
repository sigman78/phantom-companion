<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import BottomBar from './shared/BottomBar.svelte';
  import ActivationList from './game/ActivationList.svelte';
  import AdversaryDetail from './game/AdversaryDetail.svelte';
  import SetupScreen from './game/SetupScreen.svelte';
  import BattleRosterScreen from './game/BattleRosterScreen.svelte';

  $: phase = $gameStore.phase;
  let rosterOpen = false;
</script>

{#if phase === 'setup'}
  <SetupScreen />

{:else if rosterOpen}
  <BattleRosterScreen on:close={() => rosterOpen = false} />

{:else}
  <!-- Battle screen -->
  <div class="game-layout">
    <div class="panel-left">
      <ActivationList />
    </div>
    <div class="panel-right">
      <AdversaryDetail />
    </div>
  </div>
  <BottomBar onOpenRoster={() => rosterOpen = true} />
{/if}
