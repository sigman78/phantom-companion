import { describe, it, expect } from 'vitest';
import { adversaryIconUrl, classCardArtUrl, classCardBackUrl, speciesCardArtUrl, speciesCardBackUrl } from './assets';

describe('adversaryIconUrl', () => {
  it('replaces spaces with underscores and uses .png', () => {
    expect(adversaryIconUrl('Grallok Archer')).toBe('/game-data/art/adv-icons/Grallok_Archer.png');
  });
  it('handles multi-word names', () => {
    expect(adversaryIconUrl('Timeless Berserker')).toBe('/game-data/art/adv-icons/Timeless_Berserker.png');
  });
});

describe('classCardArtUrl', () => {
  it('builds correct path for a standard class', () => {
    expect(classCardArtUrl('Archer', 3)).toBe('/game-data/art/adv-class-actions/archer_act3.jpg');
  });
  it('uses trained_beast prefix for Trained Beast action cards', () => {
    expect(classCardArtUrl('Trained Beast', 3)).toBe('/game-data/art/adv-class-actions/trained_beast_act3.jpg');
  });
  it('uses wild_beast prefix for Wild Beast', () => {
    expect(classCardArtUrl('Wild Beast', 0)).toBe('/game-data/art/adv-class-actions/wild_beast_act0.jpg');
  });
});

describe('classCardBackUrl', () => {
  it('builds correct back path for standard class', () => {
    expect(classCardBackUrl('Archer')).toBe('/game-data/art/adv-class-actions/archer_back.jpg');
  });
  it('uses trained_beast prefix for Trained Beast back card', () => {
    expect(classCardBackUrl('Trained Beast')).toBe('/game-data/art/adv-class-actions/trained_beast_back.jpg');
  });
  it('uses wild_beast prefix for Wild Beast back card', () => {
    expect(classCardBackUrl('Wild Beast')).toBe('/game-data/art/adv-class-actions/wild_beast_back.jpg');
  });
});

describe('speciesCardArtUrl', () => {
  it('builds correct path', () => {
    expect(speciesCardArtUrl('Grallok', 0)).toBe('/game-data/art/adv-species-actions/grallok_act0.jpg');
  });
  it('uses index in filename', () => {
    expect(speciesCardArtUrl('Wolf', 7)).toBe('/game-data/art/adv-species-actions/wolf_act7.jpg');
  });
});

describe('speciesCardBackUrl', () => {
  it('builds correct back path', () => {
    expect(speciesCardBackUrl('Human')).toBe('/game-data/art/adv-species-actions/human_back.jpg');
  });
});
