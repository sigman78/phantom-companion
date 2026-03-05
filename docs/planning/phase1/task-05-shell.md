# Task 05 - AppShell + AppRoot + Global CSS

## Goal

Create the global CSS system (tokens + reset), the Astro page entry and layout shell,
and the AppRoot phase router that switches between setup and game views.

## Depends on

- Task 01 (project scaffold, placeholder files exist)
- Task 02 (`src/types/game.ts`)
- Task 04 (`gameStore` exported)

## Files to create or modify

| Path | Role |
|---|---|
| `src/styles/tokens.css` | CSS custom property definitions (colors, spacing, layout) |
| `src/styles/global.css` | Reset, base element styles, layout classes |
| `src/layouts/AppShell.astro` | HTML document shell; links global CSS |
| `src/pages/index.astro` | Single page entry; mounts AppRoot |
| `src/components/AppRoot.svelte` | Phase router: setup vs game layout |

---

## Implementation: tokens.css

```css
:root {
  /* Color palette */
  --color-bg:          #0e0c0a;
  --color-surface:     #1a1714;
  --color-surface-alt: #231f1b;
  --color-border:      #3a3028;
  --color-text:        #d4c9b8;
  --color-text-dim:    #8a7e70;
  --color-accent:      #b87333;   /* copper/brass */
  --color-accent-dim:  #7a4e22;

  /* Unit colors */
  --color-red:    #c0392b;
  --color-blue:   #2980b9;
  --color-cyan:   #16a085;
  --color-yellow: #d4ac0d;

  /* Skeuomorphic texture tints */
  --texture-leather: rgba(92, 60, 30, 0.15);
  --texture-wood:    rgba(60, 40, 20, 0.12);

  /* Layout */
  --panel-left-width:  66%;
  --panel-right-width: 34%;
  --bottom-bar-height: 56px;

  /* Typography */
  --font-body:    'Segoe UI', system-ui, sans-serif;
  --font-heading: Georgia, 'Times New Roman', serif;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius */
  --radius-sm: 3px;
  --radius-md: 6px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-inset: inset 0 1px 3px rgba(0,0,0,0.5);
  --shadow-card:  0 2px 8px rgba(0,0,0,0.6);
  --shadow-panel: 0 0 24px rgba(0,0,0,0.8);
}
```

---

## Implementation: global.css

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
}

#app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Game layout: two panels side by side, above the bottom bar */
.game-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel-left {
  width: var(--panel-left-width);
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
}

.panel-right {
  width: var(--panel-right-width);
  overflow-y: auto;
}
```

---

## Implementation: AppShell.astro

```astro
---
---
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Phantom Epoch Companion</title>
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <div id="app-root">
      <slot />
    </div>
  </body>
</html>
```

Note on CSS linking: Astro processes files in `src/styles/` through Vite, so the import
path `/src/styles/global.css` works in development. Alternatively, import the CSS in
`index.astro` frontmatter with `import '../styles/global.css'` - either approach works.
The frontmatter import is more idiomatic for Astro:

```astro
---
// AppShell.astro frontmatter
import '../styles/global.css';
---
```

---

## Implementation: index.astro

```astro
---
import AppShell from '../layouts/AppShell.astro';
import AppRoot from '../components/AppRoot.svelte';
---

<AppShell>
  <AppRoot client:load />
</AppShell>
```

`client:load` ensures the Svelte component hydrates immediately on page load. All store
subscriptions and data fetching happen client-side.

---

## Implementation: AppRoot.svelte

```svelte
<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import SetupScreen from './setup/SetupScreen.svelte';

  // Game layout components (placeholders until task-07/08/09 complete)
  // import ActivationList from './game/ActivationList.svelte';
  // import AdversaryDetail from './game/AdversaryDetail.svelte';
  // import BottomBar from './shared/BottomBar.svelte';

  $: phase = $gameStore.phase;
</script>

{#if phase === 'setup'}
  <SetupScreen />
{:else}
  <div class="game-layout">
    <div class="panel-left">
      <!-- ActivationList goes here (task-08) -->
      <p style="padding: 1rem; color: var(--color-text-dim);">Activation list placeholder</p>
    </div>
    <div class="panel-right">
      <!-- AdversaryDetail goes here (task-09) -->
      <p style="padding: 1rem; color: var(--color-text-dim);">Detail panel placeholder</p>
    </div>
  </div>
  <!-- BottomBar goes here (task-07) -->
  <p style="padding: 0.5rem 1rem; color: var(--color-text-dim);">Bottom bar placeholder</p>
{/if}
```

The game layout section uses placeholder text until tasks 07-09 implement the actual
components. The `SetupScreen` import is active from this task forward (implemented in
task-06, so `SetupScreen` can be a stub until then).

Create a stub `src/components/setup/SetupScreen.svelte` for now:

```svelte
<p style="padding: 2rem; color: var(--color-text-dim);">SetupScreen placeholder</p>
```

---

## Done criteria

- [ ] `src/styles/tokens.css` contains all CSS custom properties listed above
- [ ] `src/styles/global.css` imports tokens and includes reset + layout classes
- [ ] `src/layouts/AppShell.astro` renders valid HTML5 document with global CSS applied
- [ ] `src/pages/index.astro` mounts AppRoot with `client:load`
- [ ] `src/components/AppRoot.svelte` reads `gameStore.phase` and conditionally renders
  setup or game layout
- [ ] Page loads without errors; background color is `#0e0c0a` (very dark brown-black)
- [ ] Switching `gameStore.phase` in browser console (by calling `startGame`) transitions
  the view from setup to game layout
- [ ] No layout overflow: `html` and `body` are `height: 100%`, `#app-root` is `100vh`
