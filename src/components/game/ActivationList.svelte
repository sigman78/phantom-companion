<script lang="ts">
  import { activations, gameStore, adversaryGroups } from '../../stores/gameStore';
  import { adversaryIconUrl } from '../../lib/assets';
  import { ADVERSARY_COLORS, DIFFICULTY_STARS, COLOR_BG, COLOR_VAR } from '../../lib/constants';

  $: drawn    = $activations.length > 0;
  $: activeIdx = $gameStore.turn.activeActivationIndex;
</script>

<div class="list-panel">
  <div class="list-body">
    {#if $gameStore.turn.units.length === 0}
      <div class="empty-state">
        <p>No adversaries added.</p>
        <p class="hint">Use the Setup screen to add adversaries before battle.</p>
      </div>

    {:else if drawn}
      <!-- Post-draw: sorted activation list, display-only -->
      {#each $activations as entry, i (entry.unit.id)}
        {@const state = i < activeIdx ? 'past' : i === activeIdx ? 'current' : 'future'}
        {@const colorBg = COLOR_BG[entry.unit.color]}
        {@const colorAccent = COLOR_VAR[entry.unit.color]}
        <div
          class="act-row"
          class:past={state === 'past'}
          class:current={state === 'current'}
          class:future={state === 'future'}
          class:dead={!entry.unit.alive}
          style="--row-accent:{colorAccent}"
        >
          <span class="order">{entry.activationOrder}</span>
          <div class="icon-crop">
            <img src={adversaryIconUrl(entry.unit.adversaryName)} alt="" class="icon-img" />
          </div>
          <div class="info">
            <span class="name">{entry.unit.adversaryName}</span>
            <span class="color-tag" style="color:{colorAccent}; border-color:{colorAccent}">{entry.unit.color}</span>
          </div>
          <div class="init-badge">
            <span class="init-num">{entry.initiative}</span>
          </div>
        </div>
      {/each}

    {:else}
      <!-- Pre-draw: group list, display-only -->
      {#each $adversaryGroups as group}
        <div class="group-row">
          <img src={adversaryIconUrl(group.name)} alt="" class="group-icon" />
          <div class="group-info">
            <span class="group-name">{group.name}</span>
            <span class="group-diff">{DIFFICULTY_STARS[group.difficulty]}</span>
          </div>
          <div class="group-colors">
            {#each ADVERSARY_COLORS as color}
              {@const unit = group.units.find(u => u.color === color)}
              {#if unit}
                <span
                  class="color-pip"
                  class:dead={!unit.alive}
                  style="background:{COLOR_VAR[color]}"
                  title="{color}{!unit.alive ? ' (dead)' : ''}"
                ></span>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .list-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .list-body { flex: 1; overflow-y: auto; }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-4);
    color: var(--color-text-dim);
    font-style: italic;
    text-align: center;
  }
  .hint { font-size: 12px; }

  /* --- Post-draw activation rows --- */
  .act-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    border-left: 6px solid var(--row-accent);
    background: var(--color-surface);
  }
  .act-row.dead { opacity: 0.25; }

  .act-row.past {
    --icon-sz: 56px;
    padding: 4px var(--space-3);
    opacity: 0.35;
    filter: grayscale(0.6);
  }
  .act-row.past .order { font-size: 11px; width: 18px; }
  .act-row.past .name  { font-size: 12px; }
  .act-row.past .color-tag { display: none; }
  .act-row.past .init-num  { font-size: 18px; }

  .act-row.current {
    --icon-sz: 88px;
    padding: var(--space-3) var(--space-3);
    border-left-width: 8px;
    filter: brightness(1.15);
  }
  .act-row.current .order { font-size: 13px; width: 22px; }
  .act-row.current .name  { font-size: 17px; font-weight: 600; }
  .act-row.current .init-num  { font-size: 31px; }

  .act-row.future {
    --icon-sz: 68px;
    padding: 6px var(--space-3);
  }
  .act-row.future .order { font-size: 12px; width: 20px; }
  .act-row.future .name  { font-size: 13px; }
  .act-row.future .init-num  { font-size: 21px; }

  .order {
    text-align: right;
    color: var(--color-text-dim);
    flex-shrink: 0;
  }
  .icon-crop {
    flex-shrink: 0;
    width: calc(var(--icon-sz) * 0.76);
    height: calc(var(--icon-sz) * 0.5);
    overflow: hidden;
  }
  .icon-img {
    display: block;
    width: var(--icon-sz);
    height: var(--icon-sz);
    object-fit: contain;
    transform: translateY(-25%) translateX(-12%);
  }

  .info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .color-tag {
    display: inline-block;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 600;
    border: 1px solid;
    border-radius: var(--radius-sm);
    padding: 0 3px;
    align-self: flex-start;
  }

  /* Initiative badge — accent-colored fill, dark text for contrast */
  .init-badge {
    flex-shrink: 0;
    background: var(--color-accent);
    border-radius: var(--radius-sm);
    padding: 3px 7px;
    min-width: 32px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  }
  .init-num {
    display: block;
    font-weight: 900;
    line-height: 1;
    color: var(--color-bg);
  }

  /* --- Pre-draw group rows (display-only) --- */
  .group-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    border-left: 3px solid transparent;
  }

  .group-icon { width: 40px; height: 40px; object-fit: contain; flex-shrink: 0; }

  .group-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .group-name { font-size: 15px; font-weight: 500; }
  .group-diff { font-size: 12px; color: var(--color-accent); letter-spacing: 1px; }

  .group-colors { display: flex; gap: var(--space-1); flex-shrink: 0; }
  .color-pip {
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .color-pip.dead { opacity: 0.2; }
</style>
