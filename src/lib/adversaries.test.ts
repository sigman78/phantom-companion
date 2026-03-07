import { describe, it, expect } from 'vitest';
import { ADVERSARY_TYPES, CLASS_FILE, SPECIES_FILE } from './adversaries';

describe('ADVERSARY_TYPES', () => {
  it('has exactly 22 entries (no bosses)', () => {
    expect(ADVERSARY_TYPES).toHaveLength(22);
  });
  it('all entries have non-empty name, species, and className', () => {
    for (const t of ADVERSARY_TYPES) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.species.length).toBeGreaterThan(0);
      expect(t.className.length).toBeGreaterThan(0);
    }
  });
  it('name is derived from species + className', () => {
    for (const t of ADVERSARY_TYPES) {
      expect(t.name).toBe(`${t.species} ${t.className}`);
    }
  });
});

describe('CLASS_FILE', () => {
  it('covers all class names used in ADVERSARY_TYPES', () => {
    const classes = new Set(ADVERSARY_TYPES.map(t => t.className));
    for (const c of classes) {
      expect(CLASS_FILE[c], `Missing CLASS_FILE entry for "${c}"`).toBeTruthy();
    }
  });
  it('all file names end in .json', () => {
    for (const [, file] of Object.entries(CLASS_FILE)) {
      expect(file.endsWith('.json')).toBe(true);
    }
  });
});

describe('SPECIES_FILE', () => {
  it('covers all species names used in ADVERSARY_TYPES', () => {
    const species = new Set(ADVERSARY_TYPES.map(t => t.species));
    for (const s of species) {
      expect(SPECIES_FILE[s], `Missing SPECIES_FILE entry for "${s}"`).toBeTruthy();
    }
  });
  it('all file names end in .json', () => {
    for (const [, file] of Object.entries(SPECIES_FILE)) {
      expect(file.endsWith('.json')).toBe(true);
    }
  });
});
