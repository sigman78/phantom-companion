# Task 11 - Styling Pass and Edge Cases

## Goal

Apply the CSS token system consistently across all components, add skeuomorphic accents,
verify responsive behavior, and close all known edge cases (empty roster guard, deck
reshuffle, trainer_beast_back.png typo, all-dead scenario).

## Depends on

- Tasks 01-10 (all prior tasks complete and functioning)

## Files to create or modify

All previously created component files may receive minor style updates. No new files are
created in this task. The list below focuses on the areas most likely to need attention:

| Path | Concern |
|---|---|
| `src/styles/tokens.css` | Verify all tokens are present and correct |
| `src/styles/global.css` | Verify reset and layout classes are complete |
| `src/components/game/ActivationRow.svelte` | Leather hover tint, selected accent border |
| `src/components/game/CardDisplay.svelte` | Card shadow, warm inner tint |
| `src/components/game/AdversaryDetail.svelte` | Panel header brass border |
| `src/components/shared/BottomBar.svelte` | Disabled state for all-dead scenario |
| `src/stores/gameStore.ts` | All-dead guard in drawTurn |
| `src/lib/deck.ts` | Reshuffle verification |
| `src/lib/assets.ts` | trainer_beast_back.png special case verification |

---

## CSS Token Verification

Confirm all tokens from `tokens.css` are used as designed. The full canonical token set:

```css
/* Colors */
--color-bg:          #0e0c0a;
--color-surface:     #1a1714;
--color-surface-alt: #231f1b;
--color-border:      #3a3028;
--color-text:        #d4c9b8;
--color-text-dim:    #8a7e70;
--color-accent:      #b87333;
--color-accent-dim:  #7a4e22;

/* Unit colors */
--color-red:    #c0392b;
--color-blue:   #2980b9;
--color-cyan:   #16a085;
--color-yellow: #d4ac0d;

/* Texture tints */
--texture-leather: rgba(92, 60, 30, 0.15);
--texture-wood:    rgba(60, 40, 20, 0.12);

/* Layout */
--panel-left-width:  66%;
--panel-right-width: 34%;
--bottom-bar-height: 56px;

/* Typography */
--font-body:    'Segoe UI', system-ui, sans-serif;
--font-heading: Georgia, 'Times New Roman', serif;

/* Spacing */
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
```

Walk each component and replace any hardcoded color/spacing/shadow values with the
appropriate token. Common violations to look for:
- `background: #1a1714` instead of `var(--color-surface)`
- `color: #8a7e70` instead of `var(--color-text-dim)`
- `border-radius: 6px` instead of `var(--radius-md)`
- `padding: 8px` instead of `var(--space-2)`

---

## Skeuomorphic Accent Checklist

Apply these consistently across components:

### Card faces (CardDisplay.svelte)
Add inner shadow to the card art container to suggest depth:
```css
.card-art {
  box-shadow: var(--shadow-card), var(--shadow-inset);
}
```

### Panel headers
Any section header (in `SetupScreen`, `AdversaryDetail`, `PortraitFrame`) should have a
thin top border in accent color to suggest brass trim:
```css
.panel-header, .portrait-frame {
  border-top: 1px solid var(--color-accent);
}
```

### Bottom bar
The top border signals separation from the content panels:
```css
.bottom-bar {
  border-top: 1px solid var(--color-border);
  /* Optional: slightly warm tint */
  background: var(--color-surface-alt);
}
```

### Activation row hover
Use the leather texture tint on hover to suggest a tactile feel:
```css
.activation-row:hover {
  background: var(--texture-leather);
}
```

### Selected activation row
Left accent border + subtle highlight:
```css
.activation-row.selected {
  border-left: 3px solid var(--color-accent);
  background: rgba(184, 115, 51, 0.08);
}
```

### Overlay panel
Top accent border to frame the modal as a prominent UI element:
```css
.overlay-panel {
  border-top: 2px solid var(--color-accent);
}
```

---

## Edge Case: Empty Roster Guard

The "Start Mission" button in `SetupScreen.svelte` is already disabled when `roster.length === 0`.
Verify this works by:
1. Loading the app fresh
2. Clicking "Start Mission" without adding any units
3. Confirming the button is not interactive (disabled attribute set, `opacity: 0.4`)

---

## Edge Case: Deck Reshuffle

Verify `drawCard` in `deck.ts` correctly reshuffles when the deck runs out.

Simulation to run in browser console (after starting a game):

```js
// Import deck functions (or expose on window for testing):
// Each call to drawTurn draws one card per unique type.
// With one adversary type and 10 turns, the deck must reshuffle on turn 11.
// Confirm: turn 11 does not throw, and a valid card index (0-9) is returned.
```

Manual test procedure:
1. Start a mission with exactly one adversary type (e.g., one Grallok Archer, any color)
2. Click "Draw Turn" -> "End Turn" 10 times (exhaust both decks)
3. Click "Draw Turn" an 11th time
4. Expected: activation list populates normally, no console errors, no undefined values

The reshuffle logic in `deck.ts` moves the discard pile back to the draw pile and
re-shuffles before drawing. Verify the discard pile is cleared after reshuffle (it should
be empty, then the drawn card is placed into it).

---

## Edge Case: Trained Beast Card Back

Verify the `trainer_beast_back.png` special case in `assets.ts`:

```ts
// This function must return a URL containing "trainer_beast_back.png":
classCardBackUrl('Trained Beast')
// Expected: "/game-data/art/adv-class-actions/trainer_beast_back.png"
// Wrong:    "/game-data/art/adv-class-actions/trained_beast_back.png"
```

Manual test:
1. Add a Lypran Trained Beast (or Wolf Trained Beast) to the mission
2. Start the mission; do NOT draw a turn yet
3. Select the Trained Beast unit
4. In the detail panel, the class card should show the back image
5. Open browser devtools -> Network tab -> filter by "trained"
6. Confirm the loaded URL is `trainer_beast_back.png`, not `trained_beast_back.png`
7. Confirm the image loads with HTTP 200 (not 404)

If the image 404s, the special case is missing or misspelled in `assets.ts`.

---

## Edge Case: All Units Dead

When every unit in `gameStore.turn.units` has `alive: false`, the "Draw Turn" button
must be disabled with a tooltip.

In `BottomBar.svelte`:
```svelte
$: allDead = $gameStore.phase === 'game' &&
  $gameStore.turn.units.length > 0 &&
  $gameStore.turn.units.every(u => !u.alive);
```

The `length > 0` guard prevents false-triggering during initial load before units exist.

Verify:
1. Start a mission with two units
2. Open "Manage Roster" and mark both units dead
3. Close overlay
4. Confirm "Draw Turn" button is disabled and has tooltip text "All units defeated"
5. Confirm "End Turn" button behavior is unchanged (still works if activations exist)

---

## Viewport Testing

Test at the following viewport sizes (Chrome devtools responsive mode):

| Viewport | Expected behavior |
|---|---|
| 1280x800 | All panels visible, no overflow, activation list scrollable if needed |
| 1440x900 | Same; cards in detail panel not cut off |
| 1920x1080 | Same; picker grid spans more columns |

Check for:
- No horizontal scrollbar on `body`
- Bottom bar always anchored to bottom of viewport
- Right detail panel scrollable if content overflows
- Activation list scrollable within left panel

If layout breaks at smaller viewports, check that `overflow: hidden` is on `html`/`body`
and not propagated incorrectly.

---

## Typography and heading usage

- Section headings (`h2`, `h3`) should use `var(--font-heading)` (Georgia serif)
- Body text, labels, values use `var(--font-body)` (Segoe UI / system)
- Adversary names in headers: `var(--font-heading)`, `var(--color-accent)`
- Stat labels: `var(--font-body)`, uppercase, `var(--color-text-dim)`
- Turn counter: mixed: label in `--color-text-dim`, number in `--color-text)` bold

---

## Final integration checklist

Run through a complete game session end-to-end:

- [ ] App loads, setup screen shows picker and roster
- [ ] Add 3-4 adversary units of different types and colors
- [ ] Set difficulty to Veteran
- [ ] Click "Start Mission" - game layout appears
- [ ] Turn 1: "Draw Turn" - activation list populates with correct order
- [ ] Click each row - detail panel updates with portrait, stats, and card art
- [ ] "End Turn" - counter increments, list clears
- [ ] Turn 2: "Draw Turn" again - new cards drawn
- [ ] Open "Manage Roster" - mark one unit dead
- [ ] Close overlay; dead unit still in activation list for current turn
- [ ] "End Turn" then "Draw Turn" - dead unit absent from new activation list
- [ ] "Manage Roster" - add a new unit type mid-game
- [ ] "End Turn" then "Draw Turn" - new unit appears in activation list
- [ ] After 10 turns with same unit type - deck reshuffles, no errors
- [ ] Mark all units dead - "Draw Turn" disabled
- [ ] Revive one - "Draw Turn" re-enabled

---

## Done criteria

- [ ] All components use CSS tokens exclusively (no hardcoded color/spacing values)
- [ ] Skeuomorphic accents visible: brass top borders, leather hover tints, card shadows
- [ ] "Start Mission" disabled when roster empty (confirmed with fresh page load)
- [ ] Deck reshuffle works at turn 11 (no errors, valid card drawn)
- [ ] Trained Beast class card back loads `trainer_beast_back.png` (HTTP 200)
- [ ] "Draw Turn" disabled when all units are dead; tooltip text visible
- [ ] App functions at 1280x800 without overflow or broken layout
- [ ] Full end-to-end session (listed above) completes without errors or console warnings
