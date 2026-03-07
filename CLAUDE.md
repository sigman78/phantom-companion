
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
- data/manual/                       - rulebook extracted as markdown (10 files)
- data/data/                         - adversary action desk data in json
- data/art                           - game art
- docs/planning/                     - current development plans


Development cycle
=================

- Read and study initial prompt
- Study current project state from PROJECT.md and related artefacts
- Build current dev phase rough plans and store into /docs/planning/
- Study and split that plans into subtask /docs/planning/phaseN/task...md
- Execute tasks one by one, verify results after each
- After all tasks done, verify phase completion checklist
- If there is inconsistencies, sum them up, add new fixing task, repeat to the previous relevant step
