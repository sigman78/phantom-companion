# Phantom Epoch — In-Mission Turn Order & Adversary Actions (Rules Summary)

This document summarizes the **in-mission round structure**, **initiative/turn order rules**, and **adversary action + targeting + movement rules**.

---

## 1) Round structure (in order)

1. **Roll the Decision die** (used for tie/ambiguity resolution during the round).
2. **Draw and resolve an Event card.**
3. **Each character chooses** one of:
   - **Rest**, or
   - **Select Character Action cards** for the round.
4. **Reveal Character Action selections** simultaneously (all non-resting characters).
5. **Draw Adversary Action cards**:
   - Regular adversaries: draw from **Species** and **Class** decks (per adversary type present).
   - Boss adversaries: draw from the **Boss** deck instead.
6. **Determine initiative** for every figure (characters + adversaries), applying relevant modifiers.
7. **Take turns in initiative order** from **lowest → highest**.
8. **Discard Adversary Action cards** drawn this round.
9. **Resolve end-of-round effects**, then proceed to the next round if the mission continues.

---

## 2) Initiative calculation

### 2.1 Characters
- A character’s initiative equals the **total AP** of their **selected Character Action cards** (plus any modifiers).

### 2.2 Regular adversaries
- A regular adversary’s initiative equals:
  - **Species Action card AP** + **Class Action AP** for that adversary’s **standee color**.
- For “same-type” adversaries, class actions are arranged **low → high AP** which supports consistent ordering.

### 2.3 Boss adversaries
- Boss initiative is the **AP of the inherent action** plus the **AP of all additional actions** that will be performed that turn.

---

## 3) Tie-break rules for initiative order

When two or more figures share the same initiative:

1. **Character vs adversary:** characters go first.
2. **Character vs character:** players choose the order.
3. **Same-type adversaries:** follow the **standee color order** shown on the Class Action card.
   - If multiple adversaries share a color, use the **Decision die** to decide among them.
4. **Different-type adversaries:** use the **Decision die** to decide which goes first.

---

## 4) Resting and selecting Character Action cards

### 4.1 Resting (eligibility)
A character may **not** rest if:
- They have **no discarded Character Action cards**, or
- They rested **the previous round** (no resting two turns in a row).

### 4.2 Resting (effects)
While resting:
- Initiative for the round is **1**.
- The character **does not play** Character Action cards on their turn.
- The character **recovers all discarded** Character Action cards back into hand.
- The character may remove **detrimental conditions** at the **start of their rest turn** (before those conditions would apply).
- The character may perform equipment management permitted by the rules (equip/unequip, recharge, move Nova Cells as allowed).

### 4.3 Selecting Character Action cards (non-resting)
- A character must select **one or more** Character Action cards.
- The **sum of AP** of selected cards must be **≤ the character’s max AP**.
- Selections are revealed simultaneously (limited table-talk regarding exact cards).

---

## 5) Decision die resolution (color + direction)

When a rule calls for the Decision die to resolve ambiguity:

### 5.1 Color
- If options map to colors, use the **die color** to select among those options.

### 5.2 Direction (when color does not resolve it)
If multiple options remain or color doesn’t apply:

1. Use the **primary direction** (large cardinal letter) to pick the viable option **furthest** in that direction.
2. If still tied, use the **secondary direction** (small cardinal letter) to pick the viable option **furthest** in that direction.

---

## 6) Adversary actions each turn

### 6.1 What is drawn each round
- Regular adversaries use **Species** + **Class** action cards for their type.
- Boss adversaries use **Boss** action cards.

### 6.2 What an adversary performs on its turn
A regular adversary performs:
1. **All actions on the Species Action card**, then
2. **All actions on the Class Action card row matching its standee color**.

### 6.3 Round-icon effects
- Any effect marked with a **round icon** remains active **for the entire round** the card was drawn.

### 6.4 Converting an Adversary Action card into movement
An adversary may convert **either** the Species or Class card into a **Move** action **only if**:

- The chosen card **does not** contain **Move / Leap / Teleport**, **and**
- One or more actions cannot be performed because the **primary target** is **out of range or line of sight**.

An adversary **never converts**:
- A card that already has **Move / Leap / Teleport**, or
- A card that has a **round effect**, even if some additional effects can’t be performed.

When converted:
- The movement points (MP) gained are derived from the relevant **AP cost** indicated on the card/action being converted.

---

## 7) Determining the adversary’s primary target

### 7.1 “Closest” definition
- If at least one enemy is already in range/LoS: **closest** means the enemy at the **shortest range**.
- If none are in range/LoS: **closest** means the enemy that can be reached into range/LoS with the **fewest MP**, counting through hazards as required by the rules.
- If a Leap is available this turn, it is considered for current-turn reachability (without assuming future turns will also have Leap).

### 7.2 Primary target priority (in order)
When selecting a primary target, ignore enemies/objects that have **no unoccupied space** from which the adversary could Attack them.

Choose the first applicable option:

1. **Closest enemy in range and line of sight.**
2. **Enemy requiring the fewest MP** to reach a space where it is in range and line of sight to Attack.
3. **First destructible object blocking a path** to a space that would put an enemy within range (choosing a route that passes through the **fewest destructible objects** possible).
4. If none apply: the adversary has **no primary target** and will not Move or perform actions that require a primary target.

### 7.3 Ties when choosing a primary target
If multiple enemies tie:
1. Prefer an enemy that **does not require entering a hazard** to be in range to Attack.
2. Otherwise resolve using the **Decision die**.

If multiple objects tie:
1. Prefer one that **does not require entering a hazard**.
2. Prefer a **damaged** object.
3. Prefer the object whose destruction opens a path that requires the **fewest MP** to reach an Attack space.
4. Otherwise resolve using the **Decision die**.

### 7.4 No primary target cases
An adversary has **no primary target** if:
- There are no enemies, or
- All enemies are Invisible, or
- It is impossible to get within range of an enemy (and no valid destructible objects meet the criteria).

In this case, it will not Move or perform actions requiring a primary target.

---

## 8) Determining adversary line of sight (when multiple lines are possible)

When more than one valid line of sight can be drawn, choose in this order:

1. A line passing through **as few objects/figures** as possible.
2. If tied, the line passing through **as few allies** as possible.
3. If tied, the line passing through **as few indestructible objects** as possible.
4. If still tied, resolve using the **Decision die**.

---

## 9) Targeting allies (healing/buffs)

If an action targets allies and/or self:

- **Healing:** choose the ally/self with the **highest damage to HP**.
- **Beneficial conditions:** choose self or the **closest ally** without the condition (if self is eligible, prioritize self over an ally).

Unless the card says otherwise, movement still resolves normally even if it moves out of ally range.

---

## 10) Adversary movement rules

### 10.1 General movement goals (Move & Leap)
If there is **no primary target**: the adversary **does not move**.

If the primary target is an **object** and it is already in range/LoS: the adversary **does not move**.

If the primary target is an **enemy**:

- If already in range: end movement in a space from which it can Attack the enemy, while being as close as possible to **maximum range** from that enemy.
- If not in range/LoS: move toward a space from which it **can Attack**, and (when possible) end as close as possible to **maximum range** from the target.

### 10.2 Choosing the final space (movement tie-breakers)
When multiple final spaces qualify, choose in this order:

1. A space that **does not require entering a hazard** (if possible).
2. A space from which the adversary will have **the most enemies** in range and line of sight.
3. The space requiring the **fewest MP** to reach.
4. If still tied, resolve using the **Decision die**.

### 10.3 Hazards during movement
Adversaries treat hazards as blocked (similar to indestructible objects) **unless**:

- The path is otherwise completely blocked, **or**
- Entering the hazard is the **only way** to reach **exactly maximum range** from the primary target with the current action.

### 10.4 Multiple movement actions in one turn
If an adversary performs multiple movement actions in the same turn, each movement is resolved **independently**, and the adversary may retrace steps.

### 10.5 Leap special case
If a Leap cannot reach a space that allows an Attack on the primary target, choose the Leap landing space assuming the **next action will be a Move**.

---

## 11) Retreat

Retreat is resolved like movement, but the goal is to end as **far from the primary target as possible**:

- Prefer the space with the **greatest range** from the primary target.
- If tied, choose the one requiring the **fewest MP**.
- If still tied, resolve using the **Decision die**.

If a character is forced to Retreat by an adversary effect, the character typically treats it as a regular Move unless the rules instruct using adversary movement rules.

---

## 12) Teleport (adversary)

Teleport:
- Remove the adversary from the map and place it on any empty space (including the same space if allowed),
- But **not** on the other side of a **closed door**.

If multiple destinations are viable, determine the destination using the same movement decision logic used for Move/Leap (goal-driven, with tie-breakers and Decision die as needed).

---

## 13) Boss adversary action structure (overview)

- A boss has an **inherent action** that occurs at the start of every boss turn.
- A boss action card then instructs which additional numbered actions to perform (and/or special “Other” effects).
- Boss initiative is determined by summing the AP of the inherent action and the additional actions that will be performed.
- Bosses follow the **same primary target, movement, and Attack rules** as regular adversaries unless explicitly overridden.

