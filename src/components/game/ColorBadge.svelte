<script lang="ts">
  import type { AdversaryColor } from '../../types/game';
  import { COLOR_VAR } from '../../lib/constants';

  export let color: AdversaryColor;
</script>

<span class="badge" style="background: {COLOR_VAR[color]}" title={color}></span>

<style>
  .badge {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.25);
  }
</style>
