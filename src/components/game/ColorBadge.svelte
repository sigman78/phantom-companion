<script lang="ts">
  import type { AdversaryColor } from '../../types/game';
  export let color: AdversaryColor;

  const COLOR_MAP: Record<AdversaryColor, string> = {
    Red: 'var(--color-red)', Blue: 'var(--color-blue)',
    Cyan: 'var(--color-cyan)', Yellow: 'var(--color-yellow)',
  };
</script>

<span class="badge" style="background: {COLOR_MAP[color]}" title={color}></span>

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
