import { describe, it, expect } from 'vitest';
import { deckKey, createDeck, drawCard } from './deck';

describe('deckKey', () => {
  it('returns species:class format', () => {
    expect(deckKey('Grallok', 'Archer')).toBe('Grallok:Archer');
  });
  it('handles multi-word class', () => {
    expect(deckKey('Wolf', 'Trained Beast')).toBe('Wolf:Trained Beast');
  });
});

describe('createDeck', () => {
  it('returns 10 indices for each pile', () => {
    const deck = createDeck();
    expect(deck.speciesIndices).toHaveLength(10);
    expect(deck.classIndices).toHaveLength(10);
  });
  it('contains all indices 0-9 (shuffled)', () => {
    const deck = createDeck();
    expect([...deck.speciesIndices].sort((a, b) => a - b)).toEqual([0,1,2,3,4,5,6,7,8,9]);
    expect([...deck.classIndices].sort((a, b) => a - b)).toEqual([0,1,2,3,4,5,6,7,8,9]);
  });
  it('starts with empty discards', () => {
    const deck = createDeck();
    expect(deck.speciesDiscard).toHaveLength(0);
    expect(deck.classDiscard).toHaveLength(0);
  });
});

describe('drawCard', () => {
  it('pops the head of speciesIndices and classIndices', () => {
    const deck = createDeck();
    const expectedSpecies = deck.speciesIndices[0];
    const expectedClass   = deck.classIndices[0];
    const result = drawCard(deck);
    expect(result.speciesIndex).toBe(expectedSpecies);
    expect(result.classIndex).toBe(expectedClass);
  });
  it('reduces pile length by 1', () => {
    const deck = createDeck();
    const result = drawCard(deck);
    expect(result.deck.speciesIndices).toHaveLength(9);
    expect(result.deck.classIndices).toHaveLength(9);
  });
  it('adds drawn card to discard', () => {
    const deck = createDeck();
    const { speciesIndex, classIndex, deck: next } = drawCard(deck);
    expect(next.speciesDiscard).toContain(speciesIndex);
    expect(next.classDiscard).toContain(classIndex);
  });
  it('reshuffles from discard when pile is exhausted', () => {
    let deck = createDeck();
    // Exhaust the deck
    for (let i = 0; i < 10; i++) {
      deck = drawCard(deck).deck;
    }
    expect(deck.speciesIndices).toHaveLength(0);
    // 11th draw reshuffles
    const result = drawCard(deck);
    expect(result.speciesIndex).toBeGreaterThanOrEqual(0);
    expect(result.speciesIndex).toBeLessThanOrEqual(9);
    expect(result.deck.speciesIndices).toHaveLength(9);
  });
});
