Layout
======

SPA with the focus on touch interface on tablet, but still looks good on desktop.
Focus on best use of screen estate - no large unused spaces, well packed information,
efficient controls.

Main Screen
===========

Left vertical column - adversary activation list 

Numbered, scrollable list with adverasries in activation order. Non touch/click interactive
Line consists of smaller adversary portrait, outline with his color, then adversary unit name, (small color text tag underneath for color blind)
Large number with initiative number
Past adversaries (which made a move) - dimmed

Right larger column - divided horizontally on top (smaller) and bottom parts

Top part of right column split vertically on two columns:
Leftmost displays currently selected adversary card: portrait, name and difficulty level alongside
The adversary stats: HP | Guard | AP | Range
Then critical ability text

Right column shows summary of actions: species action, then class action.
Each action 'card' consists of header with action title and AP cost
Followed by the actions in order. 
Each action is showed as action kwd, its value (if any), modifiers (if any), followed by the 'Effect' text under.
Effect text can contain extra formatting - highlighted keywords, markup for `[p]` paragraph breaks, `[icon:name]` icon placeholders

Bottom part of the right column - action cards drawn

Shows species and class decks for current adversary: visually stacked (approximated by remaining cards) deck of card backs
And opened card of this deck overlapping it. Add simple (css) based animation to show card draw.
On the start of each turn this area is 'grayed out' and display text 'Draw cards' - gives players time to announce own initiative
before adversary cards are revealed. (In that time adversaries list is 'disabled' too)


Bottom bar:

Prev | Turn # | Next (larger) activation buttons
Adversaries - edit adversaries
End turn - highlights when last adversary is activated


Initial screen:
===============

Where we edit adversaries before game starts

Reuses main screen two column layout, but:
Leftmost shows added adversaries (with all initiative 0 - newly added) in order of addition
Rightmost top shows currenrly selected adversary card - portrait, stats, crit etc (according to dificulty)
Rightmost shows all adversary types to choose from.
Bottom bar shows buttons: 1-4 Star current adversary difficulty, 4 color (toggle, all active by default) - which colors to add of given type
Then 'add' button, 'clear' button, 'In battle!' button - this one let you straight into initial (pre-card-drawn) state of main screen


Modifying adversaries during the battle
=======================================

In the battle adversaries could be added or removed. Switch to screen similar to initial for that matter.