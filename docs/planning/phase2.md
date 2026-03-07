# Phase 2 Implementation Plan

## Goal

Redesign the UI based on playtesting feedback (see data/UI-LAYOUT.md).
Key changes from Phase 1:

- Proper setup screen before battle (was a small overlay modal)
- Reversed panel proportions: left 40%, right 60% (was 62%/38%)
- Right panel split: top has portrait+stats | action text; bottom has deck area
- Activation list is display-only (navigation via Prev/Next only)
- Draw interaction moves to deck area in the right panel
- Mid-battle adversary management as a dedicated full screen
- Card draw CSS animation, no dimmed adversary colors

## Task Files

- task-01-cleanup.md     - Delete unused components, create planning docs
- task-02-types.md       - Add AppPhase, SetupState; update store
- task-03-setup.md       - SetupScreen component
- task-04-detail.md      - AdversaryDetail redesign
- task-05-list.md        - ActivationList non-interactive + panel proportions
- task-06-bottombar.md   - BottomBar redesign (no Draw, add Adversaries)
- task-07-roster.md      - BattleRosterScreen + AppRoot routing
- task-08-polish.md      - Tokens, animation, keyword palette

## Completion Checklist

- [x] npm run build passes, no TS errors
- [x] npm test: all 64 tests pass
- [x] Setup screen shown on app open
- [x] Add adversaries with difficulty and color toggles
- [x] In battle! transitions to game screen
- [x] Deck area shows Draw Cards; tap triggers drawTurn
- [x] Card reveal animation plays
- [x] Prev/Next navigate activations
- [x] Adversaries button opens BattleRosterScreen
- [x] Add/Remove/Toggle dead in roster
- [x] Back to battle returns to game screen
- [x] End Turn resets to pre-draw

## File Changes Summary

### Deleted
- src/components/game/ActivationRow.svelte
- src/components/game/CardDeck.svelte
- src/components/game/CardDisplay.svelte
- src/components/game/PortraitFrame.svelte
- src/components/game/StatsBlock.svelte
- src/components/game/AddAdversaryModal.svelte
- src/components/game/RosterOverlay.svelte

### Created
- src/components/game/SetupScreen.svelte
- src/components/game/BattleRosterScreen.svelte
- docs/planning/phase2.md
- docs/planning/phase2/task-01..08.md

### Modified
- src/types/game.ts
- src/stores/gameStore.ts
- src/stores/gameStore.test.ts
- src/components/AppRoot.svelte
- src/components/game/ActivationList.svelte
- src/components/game/AdversaryDetail.svelte
- src/components/shared/BottomBar.svelte
- src/styles/tokens.css
- src/styles/global.css
