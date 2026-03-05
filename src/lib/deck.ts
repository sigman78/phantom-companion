import type { DeckState, SpeciesName, ClassName } from '../types/game';

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createDeck(): DeckState {
  return {
    speciesIndices: shuffle([0,1,2,3,4,5,6,7,8,9]),
    classIndices:   shuffle([0,1,2,3,4,5,6,7,8,9]),
    speciesDiscard: [],
    classDiscard:   [],
  };
}

function drawFromPile(
  indices: number[],
  discard: number[]
): { index: number; indices: number[]; discard: number[] } {
  let draw = indices;
  let disc = discard;
  if (draw.length === 0) {
    draw = shuffle([...disc]);
    disc = [];
  }
  const [index, ...rest] = draw;
  return { index, indices: rest, discard: [...disc, index] };
}

// Pure: draw one species card and one class card. Returns new DeckState.
export function drawCard(deck: DeckState): {
  speciesIndex: number;
  classIndex: number;
  deck: DeckState;
} {
  const sp = drawFromPile(deck.speciesIndices, deck.speciesDiscard);
  const cl = drawFromPile(deck.classIndices,   deck.classDiscard);
  return {
    speciesIndex: sp.index,
    classIndex:   cl.index,
    deck: {
      speciesIndices: sp.indices,
      speciesDiscard: sp.discard,
      classIndices:   cl.indices,
      classDiscard:   cl.discard,
    },
  };
}

// Canonical key for a species+class pair
export function deckKey(species: SpeciesName, className: ClassName): string {
  return `${species}:${className}`;
}
