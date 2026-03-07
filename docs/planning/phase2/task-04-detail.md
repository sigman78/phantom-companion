# Task 04 - Right Panel Redesign (AdversaryDetail)

## Goal

Restructure AdversaryDetail into a 2-section vertical layout.

## New Structure

### Top section (flex: 45)
- Left col (45%): portrait + name + stars + HP/Guard/Atk/Rng stats + Crit
- Right col (55%, scrollable): species card actions + class card actions (post-draw only)

### Bottom section (flex: 55) - deck area
- Pre-draw: deck stacks (height proportional to remaining cards) + "Draw Cards" tap overlay
  - Tap anywhere triggers drawTurn()
- Post-draw: card images with CSS card-reveal animation
  - {#key url} block triggers re-animation on navigation

## Key Details

- displayName derived from: activation.unit.adversaryName ?? selectedAdversaryName ?? groups[0].name
- deckKey used to find remaining deck counts for stack heights
- card-reveal animation in global.css (@keyframes + .card-revealed class)

## Status: DONE
