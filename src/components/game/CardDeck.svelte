<script lang="ts">
  export let backUrl: string;
  export let drawnUrl: string | null = null;
  export let remaining: number = 10;
</script>

<div class="deck-unit">
  <div class="deck-stack" class:has-drawn={!!drawnUrl} style="--rem:{remaining}">
    {#if remaining >= 3}
      <div class="card c1" style="background-image:url('{backUrl}')"></div>
    {/if}
    {#if remaining >= 2}
      <div class="card c2" style="background-image:url('{backUrl}')"></div>
    {/if}
    {#if remaining >= 1}
      <div class="card c3" style="background-image:url('{backUrl}')"></div>
    {/if}
    {#if drawnUrl}
      <div class="card face-up" style="background-image:url('{drawnUrl}')"></div>
    {/if}
  </div>
</div>

<style>
  .deck-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .deck-stack {
    position: relative;
    width: clamp(175px, 24vw, 275px);
    aspect-ratio: 5 / 7;
  }

  .card {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    background-size: cover;
    background-position: center;
  }

  .c1 {
    z-index: 1;
    filter: brightness(0.7);
    box-shadow: 1px 3px 8px rgba(0,0,0,0.7);
    transform: rotate(calc(var(--rem) * -0.22deg))
               translate(calc(var(--rem) * -0.45px), calc(var(--rem) * 0.65px));
  }
  .c2 {
    z-index: 2;
    filter: brightness(0.7);
    box-shadow: 1px 3px 8px rgba(0,0,0,0.7);
    transform: rotate(calc(var(--rem) * -0.11deg))
               translate(calc(var(--rem) * -0.22px), calc(var(--rem) * 0.32px));
  }
  .c3 {
    z-index: 3;
    filter: brightness(0.7);
    box-shadow: 1px 3px 8px rgba(0,0,0,0.7);
    transform: none;
  }

  /* In drawn mode: shift backs down so the face-up card stays at the anchor position.
     Decorative backs may clip at the bottom — that is intentional. */
  .has-drawn .c3 { transform: translate(-10px, 28px); }
  .has-drawn .c2 { transform: rotate(-1.5deg) translate(-14px, 38px); }
  .has-drawn .c1 { transform: rotate(-2.5deg) translate(-18px, 48px); }

  .face-up {
    z-index: 5;
    filter: none;
    /* Anchored at inset:0 — no upward offset, always within container bounds. */
    transform: translate(12px, 0);
    box-shadow: 4px 10px 20px rgba(0,0,0,0.95), 0 0 0 2px var(--color-accent);
  }

</style>
