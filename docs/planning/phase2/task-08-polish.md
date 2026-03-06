# Task 08 - Visual Polish

## Goal

Token updates, card draw animation, and keyword palette improvements.

## Changes

### src/styles/tokens.css

- Panel proportions updated (see task-05)
- Bottom bar height: 60px
- Added --color-positive: #3a7a4a

### src/styles/global.css

- Added @keyframes card-reveal (translateY + rotate from/to)
- Added .card-revealed class: animation: card-reveal 0.25s ease-out
- Used with {#key url} blocks in AdversaryDetail for per-navigation re-trigger

### Component touch targets

- All bar buttons: min-height: 44px
- BottomBar cells: min-height: 44px

## Status: DONE
