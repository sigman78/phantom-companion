# Task 07 - Battle Roster Screen

## Goal

Replace RosterOverlay with a full-screen BattleRosterScreen for mid-battle management.

## Files Created

src/components/game/BattleRosterScreen.svelte

## Layout

- Left panel (40%): existing groups as cards with per-color alive/dead toggles
  - Click group card to select (shows detail in right top)
- Right top (35%): selected group portrait + stats
- Right bottom (65%): 22-type picker grid (same as SetupScreen) + Add controls
- Roster bar: [Diff] [color toggles] [Add] [Remove Group] [Back to Battle]

## Integration

- AppRoot local state: `let rosterOpen = false`
- "Adversaries" button in BottomBar sets rosterOpen = true
- BattleRosterScreen emits 'close' event -> rosterOpen = false
- Reuses gameStore.setup state for the type picker (difficulty, colorToggles)

## Status: DONE
