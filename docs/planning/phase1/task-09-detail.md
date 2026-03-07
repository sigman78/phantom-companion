# Task 09 - Adversary Detail Panel

## Goal

Implement the right panel: `PortraitFrame`, `StatsBlock`, `CardDisplay`, and
`AdversaryDetail`. Wire `AdversaryDetail` into the right panel of `AppRoot.svelte`.

## Depends on

- Task 01 (scaffold)
- Task 02 (types: `AdversaryUnit`, `ActivationEntry`, `AdversaryStatBlock`,
  `SpeciesCard`, `ColorCard`, `AdversaryColor`, `ClassName`, `SpeciesName`)
- Task 03 (`assets.ts`: `adversaryPortraitUrl`, `classCardArtUrl`, `classCardBackUrl`,
  `speciesCardArtUrl`, `speciesCardBackUrl`)
- Task 04 (`gameStore`: `activations`, `selectedUnit`)
- Task 07 (game layout in `AppRoot.svelte`)

## Files to create or modify

| Path | Role |
|---|---|
| `src/components/game/PortraitFrame.svelte` | Adversary portrait (icon used in Phase 1) |
| `src/components/game/StatsBlock.svelte` | HP/GUARD/ATTACK/RANGE/CRIT table |
| `src/components/game/CardDisplay.svelte` | One action card face or back |
| `src/components/game/AdversaryDetail.svelte` | Right panel container |
| `src/components/AppRoot.svelte` | Replace right panel stub |

---

## Implementation: PortraitFrame.svelte

In Phase 1, the adversary icon doubles as the portrait.

```svelte
<script lang="ts">
  import { adversaryPortraitUrl } from '../../lib/assets';

  export let adversaryName: string;

  $: url = adversaryPortraitUrl(adversaryName);
</script>

<div class="portrait-frame">
  <img src={url} alt={adversaryName} class="portrait-img" />
</div>

<style>
  .portrait-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    border-top: 1px solid var(--color-accent);
  }

  .portrait-img {
    width: 96px;
    height: 96px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));
  }
</style>
```

---

## Implementation: StatsBlock.svelte

Displays the four numeric stats and CRIT string from the difficulty-adjusted stat block.

```svelte
<script lang="ts">
  import type { AdversaryStatBlock } from '../../types/game';

  export let stats: AdversaryStatBlock;
</script>

<div class="stats-block">
  <div class="stat-row">
    <span class="stat-label">HP</span>
    <span class="stat-value">{stats.HP}</span>
  </div>
  <div class="stat-row">
    <span class="stat-label">GUARD</span>
    <span class="stat-value">{stats.GUARD}</span>
  </div>
  <div class="stat-row">
    <span class="stat-label">ATTACK</span>
    <span class="stat-value">{stats.ATTACK}</span>
  </div>
  <div class="stat-row">
    <span class="stat-label">RANGE</span>
    <span class="stat-value">{stats.RANGE}</span>
  </div>
  <div class="stat-row">
    <span class="stat-label">CRIT</span>
    <span class="stat-value">{stats.CRIT}</span>
  </div>
</div>

<style>
  .stats-block {
    padding: var(--space-4);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: var(--space-1) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .stat-row:last-child {
    border-bottom: none;
  }

  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-dim);
  }

  .stat-value {
    font-size: 15px;
    font-weight: bold;
    color: var(--color-text);
  }
</style>
```

---

## Implementation: CardDisplay.svelte

Shows one action card. When `card` is null, shows the card back image. Handles both
species cards (no color differentiation) and class cards (color-specific name/cost).

```svelte
<script lang="ts">
  import type { SpeciesCard, ColorCard, SpeciesName, ClassName } from '../../types/game';
  import {
    classCardArtUrl, classCardBackUrl,
    speciesCardArtUrl, speciesCardBackUrl,
  } from '../../lib/assets';

  export let type: 'species' | 'class';
  export let card: SpeciesCard | ColorCard | null;
  export let cardIndex: number | null;
  export let species: SpeciesName | undefined = undefined;
  export let className: ClassName | undefined = undefined;

  // Derive art URLs
  $: faceUrl = ((): string | null => {
    if (card === null || cardIndex === null) return null;
    if (type === 'species' && species !== undefined) {
      return speciesCardArtUrl(species, cardIndex);
    }
    if (type === 'class' && className !== undefined) {
      return classCardArtUrl(className, cardIndex);
    }
    return null;
  })();

  $: backUrl = ((): string => {
    if (type === 'class' && className !== undefined) {
      return classCardBackUrl(className);
      // Note: classCardBackUrl special-cases 'Trained Beast' ->
      // 'trainer_beast_back.png' (typo in asset folder).
    }
    if (type === 'species' && species !== undefined) {
      return speciesCardBackUrl(species);
    }
    return '';
  })();

  $: showFace = card !== null && faceUrl !== null;
</script>

<div class="card-display">
  <div class="card-type-label">{type === 'species' ? 'Species' : 'Class'} Card</div>

  {#if showFace && faceUrl}
    <img src={faceUrl} alt="" class="card-art" />
    <div class="card-info">
      <span class="card-name">{card!.Name}</span>
      <span class="card-cost">{card!.Cost} AP</span>
    </div>
    <div class="card-actions">
      {#each card!.Actions as step}
        <div class="action-step">
          <span class="action-name">{step.Action}</span>
          {#if step.Value !== undefined}
            <span class="action-value">{step.Value}</span>
          {/if}
          {#if step.Effect}
            <span class="action-effect">{step.Effect}</span>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <img src={backUrl} alt="Card back" class="card-art card-back" />
    <p class="no-card-hint">Draw a turn to reveal</p>
  {/if}
</div>

<style>
  .card-display {
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .card-type-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-dim);
  }

  .card-art {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
  }

  .card-back {
    opacity: 0.6;
  }

  .card-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .card-name {
    font-family: var(--font-heading);
    font-size: 13px;
  }

  .card-cost {
    font-size: 12px;
    color: var(--color-accent);
  }

  .card-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: 12px;
  }

  .action-step {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-1) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .action-step:last-child {
    border-bottom: none;
  }

  .action-name {
    color: var(--color-text-dim);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .action-value {
    font-weight: bold;
  }

  .action-effect {
    color: var(--color-text-dim);
    font-style: italic;
  }

  .no-card-hint {
    font-size: 11px;
    color: var(--color-text-dim);
    font-style: italic;
    text-align: center;
  }
</style>
```

---

## Implementation: AdversaryDetail.svelte

Right panel container. Reads selected unit and its activation entry from stores;
loads stat block from `adversary-stats.json` (pre-cached in gameStore.jsonCache or
fetched separately here).

```svelte
<script lang="ts">
  import { gameStore, activations } from '../../stores/gameStore';
  import type { AdversaryStatBlock, ActivationEntry } from '../../types/game';
  import PortraitFrame from './PortraitFrame.svelte';
  import StatsBlock from './StatsBlock.svelte';
  import CardDisplay from './CardDisplay.svelte';

  // Adversary stats JSON (loaded once)
  let statsJson: Record<string, AdversaryStatBlock[]> | null = null;
  async function loadStats() {
    const res = await fetch('/game-data/data/adversary-stats.json');
    statsJson = await res.json();
  }
  loadStats();

  $: selectedId   = $gameStore.turn.selectedUnitId;
  $: activation   = $activations.find(e => e.unit.id === selectedId) ?? null;
  $: unit         = activation?.unit ?? null;

  $: stats = (unit && statsJson)
    ? statsJson[unit.adversaryName]?.[unit.difficulty] ?? null
    : null;
</script>

<div class="detail-panel">
  {#if unit && activation}
    <PortraitFrame adversaryName={unit.adversaryName} />

    {#if stats}
      <StatsBlock {stats} />
    {/if}

    <div class="cards-area">
      <CardDisplay
        type="species"
        card={activation.speciesCard}
        cardIndex={activation.speciesCard ? $activations.find(e => e.unit.id === selectedId)?.unit ? 0 : null : null}
        species={unit.species}
      />
      <CardDisplay
        type="class"
        card={activation.classCard}
        cardIndex={0}
        className={unit.className}
      />
    </div>
  {:else}
    <div class="no-selection">
      <p>Select an adversary from the activation list.</p>
    </div>
  {/if}
</div>

<style>
  .detail-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .cards-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    flex: 1;
  }

  .no-selection {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-dim);
    font-style: italic;
    font-size: 13px;
    padding: var(--space-8);
    text-align: center;
  }
</style>
```

**Card index note**: `AdversaryDetail` receives an `ActivationEntry` which stores
`speciesCard` and `classCard` as resolved data objects. The index needed for art URL
construction is the drawn index from the deck state. This requires passing the card
index through `ActivationEntry`.

Add `speciesCardIndex: number` and `classCardIndex: number` fields to `ActivationEntry`
in `src/types/game.ts`, and populate them in `drawTurn` in `gameStore.ts`:

```ts
// In drawTurn, when building ActivationEntry:
entries.push({
  unit,
  speciesCard,
  classCard,
  initiative,
  activationOrder: 0,
  speciesCardIndex: speciesIndex,  // add this
  classCardIndex:   classIndex,    // add this
});
```

Then use them in `AdversaryDetail`:

```svelte
<CardDisplay
  type="species"
  card={activation.speciesCard}
  cardIndex={activation.speciesCardIndex}
  species={unit.species}
/>
<CardDisplay
  type="class"
  card={activation.classCard}
  cardIndex={activation.classCardIndex}
  className={unit.className}
/>
```

---

## Adversary stats data notes

`adversary-stats.json` is at `/game-data/data/adversary-stats.json` (served via the
`public/game-data` symlink to `data/`). The file lives at `data/data/adversary-stats.json`
on disk (double `data/`).

Top-level object keyed by adversary name (e.g., `"Grallok Archer"`). Each value is
an array of 4 stat blocks indexed by difficulty level:
- Index 0: Rookie
- Index 1: Warrior
- Index 2: Veteran
- Index 3: Elite

Bosses (`Mutant Grallok`, `Sarhanna`, `Lindor`) appear as keys but are excluded from
Phase 1 - no stat lookup will occur for them.

---

## Wire into AppRoot.svelte

```svelte
<script lang="ts">
  import AdversaryDetail from './game/AdversaryDetail.svelte';
  // ...
</script>

<div class="panel-right">
  <AdversaryDetail />
</div>
```

---

## Done criteria

- [ ] Selecting an activation row updates the right panel immediately
- [ ] `PortraitFrame` shows the adversary icon (same image used in the picker grid)
- [ ] `StatsBlock` shows correct HP/GUARD/ATTACK/RANGE/CRIT for the unit's difficulty level
- [ ] `CardDisplay` shows species card face art and class card face art for the selected unit
- [ ] Card art URLs resolve correctly (verify in browser network tab that 200 responses
  are returned for both species and class card images)
- [ ] `CardDisplay` for Trained Beast class shows back via `trainer_beast_back.png`
  (not `trained_beast_back.png`) when card is null
- [ ] Right panel shows "Select an adversary" hint when no unit is selected
- [ ] `speciesCardIndex` and `classCardIndex` fields added to `ActivationEntry` type and
  populated in `drawTurn`
- [ ] No TypeScript errors
