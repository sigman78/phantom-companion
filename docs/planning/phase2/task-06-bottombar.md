# Task 06 - Bottom Bar Redesign

## Goal

Remove Draw button, replace Roster with Adversaries, add End Turn highlight.

## Changes

### src/components/shared/BottomBar.svelte

- Removed: Draw button
- Removed: Roster button
- Added: Adversaries button (flex: 1.5, calls onOpenRoster prop)
- Added: End Turn highlight (accent color + background) when isLast (last activation and drawn)
- BottomBar prop changed from onManageRoster to onOpenRoster
- Nav buttons: flex: 2 (was 1.6)
- Turn cell: flex: 0.8 (was 0.7)
- min-height: 44px on all cells for touch targets

## Status: DONE
