
Foundation
==========

- Use astrojs and svelte for modern SPA app
- Target: fullscreen, dark-themed SPA for laptop/tablet browsers
- Phase 1: POC - adversary initiative and activation tracking


Code style
==========

- Avoid unicode characters and emoji in documentation


Tools use
=========

- Avoid unvetted call to destructive tools or their replacements: rm, unlink, git reset --hard, etc
- Use primary platform CLI tools (windows pc)
- There is some CLI tools available from scoop: ImageMagick etc


Project structure
=================

See PROJECT.md for full scope and design goals.

Key data artifacts (all under data/):

- data/INDEX.md                      - data folder contents index
- data/TURN.md                       - game round/turn structure rules
- data/Phantom Epoch_Rulebook.pdf    - official rulebook (87 MB)
- data/manual/*.md                   - rulebook extracted as markdown (10 files)
- data/adversary-stats.json          - stats for all 29 adversary types, 4 difficulty levels each
- data/data/class/*.json             - 6 class action card decks (Archer, Berserker, Scout, Sentry, Trained Beast, Wild Beast)
- data/data/species/*.json           - 8 species action card decks (Grallok, Gryllo, Human, Lypran, Slink, Timeless, Wolf, Other)
- data/art/adv-class-actions/        - 55 class card PNG images
- data/art/adv-species-actions/      - 123 species card PNG images
- data/art/adv-icons/                - adversary icon PNGs

Domain model
============

- Adversary = Species + Class (e.g. "Grallok Berserker")
- Each unit on board has a color: Red, Blue, Cyan, Yellow
- Per turn: draw 1 species card + 1 class card per active species/class type
- Adversary initiative = sum of species card AP + class card AP
- Activation order resolved by initiative, tie-broken by color order
- 29 adversary types, 6 classes, 8 species

App layout (Phase 1 POC)
========================

- Left ~2/3: sorted adversary activation list for the turn
- Right ~1/3: currently selected adversary group (stats, portrait, action cards)
- Bottom bar: turn counter + Next / Prev / End-of-turn controls
- Design: dark theme, humanistic, light skeuomorphic accents (leather, wood, brass)
- SVG icons from Iconify sets