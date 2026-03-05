<script lang="ts">
  import { adversaryPortraitUrl } from '../../lib/assets';
  export let adversaryName: string;
  $: url = adversaryPortraitUrl(adversaryName);
</script>

<div class="portrait-frame">
  <img src={url} alt={adversaryName} class="portrait" />
  <span class="name">{adversaryName}</span>
</div>

<style>
  .portrait-frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-6);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    border-top: 1px solid var(--color-accent);
  }

  .portrait {
    width: 96px;
    height: 96px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));
  }

  .name {
    font-family: var(--font-heading);
    font-size: 15px;
    color: var(--color-accent);
    text-align: center;
  }
</style>
