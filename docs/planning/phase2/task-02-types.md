# Task 02 - Store + Types: Setup Phase

## Goal

Add setup phase state to types and store. Drive screen routing from store.phase.

## Changes

### src/types/game.ts

- Added: `export type AppPhase = 'setup' | 'battle'`
- Added: `export interface SetupState { selectedTypeName, difficulty, colorToggles }`
- Kept: `TurnState.phase: 'game'` (unchanged for test compatibility)

### src/stores/gameStore.ts

- `GameStore.phase` changed from `'game'` to `AppPhase`
- Added `GameStore.setup: SetupState`
- Initial phase is `'setup'`
- New actions: `setSetupType`, `setSetupDifficulty`, `toggleSetupColor`
- New actions: `goToBattle`, `goToSetup`, `clearAdversaries`
- `addAdversaryGroup` gains optional `colorToggles` parameter

### src/stores/gameStore.test.ts

- CLEAN_STATE updated: outer phase `'setup'`, added `setup` field

## Status: DONE
