<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import BottomBar from './shared/BottomBar.svelte';
  import ActivationList from './game/ActivationList.svelte';
  import AdversaryDetail from './game/AdversaryDetail.svelte';
  import RosterOverlay from './game/RosterOverlay.svelte';

  let rosterOpen = false;
</script>

<div class="game-layout">
  <div class="panel-left">
    <ActivationList />
  </div>
  <div class="panel-right">
    <AdversaryDetail />
  </div>
</div>
<BottomBar onManageRoster={() => rosterOpen = true} />
{#if rosterOpen}
  <RosterOverlay on:close={() => rosterOpen = false} />
{/if}
