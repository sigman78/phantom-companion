# Task 03 - Setup Screen

## Goal

Full-screen adversary setup before entering battle.

## File Created

src/components/game/SetupScreen.svelte

## Layout

- Left panel (40%): added adversary groups list (icon, name, stars, color pips)
- Right top (60%, 40% height): selected type portrait + HP/Guard/Atk/Rng/Crit stats
- Right bottom (60%, 60% height): 22-type grid (tap to select)
- Setup bar: [Diff] [R/B/C/Y toggles] [Add] [Clear] [In battle!]

## Integration

- AppRoot shows SetupScreen when `$gameStore.phase === 'setup'`
- "In battle!" calls `goToBattle()` (disabled if no groups added)
- Add calls `addAdversaryGroup(type, difficulty, colorToggles)`
- Clear calls `clearAdversaries()`

## Status: DONE
