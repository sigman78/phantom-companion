# Phantom Companion

A browser-based companion app for **Phantom Epoch** tabletop sessions.
Dark-themed, fullscreen SPA targeting laptop and tablet browsers.

![App screenshot](docs/results/one/demo.jpg)

---

## Current state

The app covers the full adversary lifecycle from pre-battle setup through
end of mission. Before combat begins, a setup screen lets you add adversary
groups by type, set difficulty per group (1-4 stars), and toggle which color
units (Red, Blue, Cyan, Yellow) are active. Once battle starts, a turn engine
draws one species card and one class card per unique type combination, calculates
initiative from card costs, and sorts all living units into an activation order
list. Stepping through activations shows each unit's drawn card art and aggregated
action steps in a right-hand detail panel. At any point a roster overlay can be
opened to mark individual units dead or alive and remove fully defeated groups.

Session state is auto-saved to local storage. On next open, a resume dialog shows
the saved turn number and group count so the mission can be picked up where it
left off. The app is installable as a PWA with a service worker and app icons.

The UI is dark and skeuomorphic in style, touch-friendly, and designed for
fullscreen use.

---

## What is implemented

**Adversary data**
22 standard adversary types across 6 classes and 8 species (bosses excluded).
Game data is served as static JSON from `/game-data/`. Source art is resized and
converted to JPEG at display-appropriate sizes.

**Turn engine**
Card draw, initiative calculation (species AP + color class AP), activation order
sorting, turn counter, and automatic deck reshuffling when exhausted.

**UI screens**
Pre-battle setup screen (type picker, stats preview, difficulty and color controls);
game screen with activation list on the left and adversary detail panel on the right;
roster management overlay accessible mid-battle.

**Persistence and PWA**
Auto-save to local storage with resume dialog. Installable via `manifest.webmanifest`
and offline-capable via `sw.js`.

---

## Development

Built with Astro 5 + Svelte 5 + TypeScript; no backend, all state in Svelte stores,
data loaded client-side.

```
npm install
npm run dev
```

Open `http://localhost:4321` in a browser.

---

## Project layout

```
src/
  components/game/     Game screens and panels (Svelte)
  components/shared/   Shared UI (BottomBar)
  lib/                 Game logic: deck, initiative, adversary data, asset URLs
  stores/              gameStore (writable Svelte store + action functions)
  types/               TypeScript domain types
  styles/              Global CSS and design tokens
data/                  Source game data and art (not served directly)
public/game-data/      Converted and optimised assets served to the browser
public/icons/          PWA app icons
public/manifest.webmanifest
public/sw.js
docs/planning/         Implementation plans and task breakdowns
```
