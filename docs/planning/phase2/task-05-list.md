# Task 05 - Activation List Update

## Goal

Make activation list display-only; update panel proportions.

## Changes

### src/styles/tokens.css

- --panel-left-width: 40% (was 62%)
- --panel-right-width: 60% (was 38%)
- --bottom-bar-height: 60px (was 56px)
- Added --color-positive: #3a7a4a

### src/components/game/ActivationList.svelte

- Removed: "+ Add" button from list header
- Removed: AddAdversaryModal import and conditional render
- Removed: on:click/on:keydown handlers from group rows
- Removed: cursor: pointer, hover background, .selected class from group rows
- Removed: selectAdversary import (no longer called from here)
- Group rows are now pure display: icon, name, stars, color pips
- Color pips now only render for colors that exist (if unit), not all 4

## Status: DONE
