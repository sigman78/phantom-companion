Phantom Epoch - Web companion app
===============================

This is a companion app for "Phantom Epoch" board game. It should take the buden of some of the
mundane tracking work while enjoying plaing the game.

The game itself is lesser known but for the purpose of the app could be considered as easy-mode of
widely known Gloomhaven board game.

Game info and data sources
-------------------------------

Look up in `data` folder: `INDEX.md` describes major contents. `TURN.md` describes game round structure.
Data at `data\art` contain game graphics: cards and icons. Under `data\data`: game parsed data.

Adversaries in this game are built from combinatin of 'Species' and 'Class'. For example 'Grallok Berserker',
where 'Grallok' is species and 'Berserker' is class. Then each adversary unit on the map gets the color on a board
['Red', 'Blue', 'Cyan', 'Yellow']. For each currently active adversary on a board we aggregate species and classes
and draw exactly 1 card for each class and 1 card for each species from respective decks. The adversary unit's action
(and action initiative) is a summ of both his species and class action cards.

Tech
----

Its an web SPA app based on latest 'astro.js' tooling and 'svelte' for client-side interactive components.
Target devices - Laptop/Tablet's web browser.

Phase 1: POC
------------

This is a POC and play test of the idea. It should relief the players from some of the burden of
tracking adversaries turn, initiative in particular.

Goals:
- Track through the mission adversaries initiative
- Shuffle and present active adversaries decks
- Setup adversaries before first turn
- Add new or remove eradicated adversaries during the turn (spawns are generally inactive untill next turn)
- Track and activate the Class and Species action cards from respective decks for each adversary type (alive) in the mission
- Build a sorted activation list of adversaries for given turn
- Provide 'Next' and 'Prev' UI to move through the activation list as players resolve this
- Show hint about currently active adversary - portrait, stats, specials
- Track current turn number in UI

Non goals:
- Track boss activation and initiative - could be done by players
- Track players initiative - players do that
- Track adversary HP & effects - we do it on a board

App's design:
- Modern humanistic design, simple, practical, dark theme.
- Some light animations for selection or cards.
- Use SVG icons from Iconify sets where appropriate
- Controls size balanced between mouse and touch interactions
- Fullscreen non scrollable view
- Light skeuomorphic elements - leather, wood, brass
- App's screen shows list of adversaries activations on left (~ 2/3 of width)
- On the right (~1/3) shown currently selected adversary (color) group - aversary stats, portrait, action
- There is a bottom bar which displays current turn number and currently active UI actions: 'next', 'prev', 'end of turn' etc

