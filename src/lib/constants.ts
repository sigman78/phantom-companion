import type { AdversaryColor, DifficultyLevel } from '../types/game';

export const ADVERSARY_COLORS: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

export const DIFFICULTY_STARS: Record<DifficultyLevel, string> = {
  0: '★', 1: '★★', 2: '★★★', 3: '★★★★',
};

export const COLOR_VAR: Record<AdversaryColor, string> = {
  Red:    'var(--color-red)',
  Blue:   'var(--color-blue)',
  Cyan:   'var(--color-cyan)',
  Yellow: 'var(--color-yellow)',
};

export const COLOR_BG: Record<AdversaryColor, string> = {
  Red:    'rgba(192,57,43,0.15)',
  Blue:   'rgba(40,120,214,0.15)',
  Cyan:   'rgba(0,191,165,0.12)',
  Yellow: 'rgba(212,172,13,0.15)',
};
