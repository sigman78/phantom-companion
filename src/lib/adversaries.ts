import type { AdversaryType, ClassName, SpeciesName } from '../types/game';

// Verified against data/data/adversary-stats.json (22 standard, 3 bosses excluded)
export const ADVERSARY_TYPES: AdversaryType[] = [
  { name: 'Grallok Archer',       species: 'Grallok',  className: 'Archer' },
  { name: 'Grallok Berserker',    species: 'Grallok',  className: 'Berserker' },
  { name: 'Grallok Scout',        species: 'Grallok',  className: 'Scout' },
  { name: 'Grallok Sentry',       species: 'Grallok',  className: 'Sentry' },
  { name: 'Gryllo Trained Beast', species: 'Gryllo',   className: 'Trained Beast' },
  { name: 'Gryllo Wild Beast',    species: 'Gryllo',   className: 'Wild Beast' },
  { name: 'Human Archer',         species: 'Human',    className: 'Archer' },
  { name: 'Human Berserker',      species: 'Human',    className: 'Berserker' },
  { name: 'Human Scout',          species: 'Human',    className: 'Scout' },
  { name: 'Human Sentry',         species: 'Human',    className: 'Sentry' },
  { name: 'Other Scout',          species: 'Other',    className: 'Scout' },
  { name: 'Slink Archer',         species: 'Slink',    className: 'Archer' },
  { name: 'Slink Berserker',      species: 'Slink',    className: 'Berserker' },
  { name: 'Slink Scout',          species: 'Slink',    className: 'Scout' },
  { name: 'Slink Sentry',         species: 'Slink',    className: 'Sentry' },
  { name: 'Lypran Trained Beast', species: 'Lypran',   className: 'Trained Beast' },
  { name: 'Lypran Wild Beast',    species: 'Lypran',   className: 'Wild Beast' },
  { name: 'Wolf Trained Beast',   species: 'Wolf',     className: 'Trained Beast' },
  { name: 'Wolf Wild Beast',      species: 'Wolf',     className: 'Wild Beast' },
  { name: 'Timeless Archer',      species: 'Timeless', className: 'Archer' },
  { name: 'Timeless Berserker',   species: 'Timeless', className: 'Berserker' },
  { name: 'Timeless Sentry',      species: 'Timeless', className: 'Sentry' },
];

export const BOSS_NAMES = ['Mutant Grallok', 'Sarhanna', 'Lindor'] as const;

export const CLASS_FILE: Record<ClassName, string> = {
  'Archer':        'archer-actions.json',
  'Berserker':     'berserker-actions.json',
  'Scout':         'scout-actions.json',
  'Sentry':        'sentry-actions.json',
  'Trained Beast': 'trained-beast-actions.json',
  'Wild Beast':    'wild-beast-actions.json',
};

export const SPECIES_FILE: Record<SpeciesName, string> = {
  'Grallok':  'grallok-actions.json',
  'Gryllo':   'gryllo-actions.json',
  'Human':    'human-actions.json',
  'Lypran':   'lypran-actions.json',
  'Other':    'other-actions.json',
  'Slink':    'slink-actions.json',
  'Timeless': 'timeless-actions.json',
  'Wolf':     'wolf-actions.json',
};

export const CLASS_ART_PREFIX: Record<ClassName, string> = {
  'Archer':        'archer',
  'Berserker':     'berserker',
  'Scout':         'scout',
  'Sentry':        'sentry',
  'Trained Beast': 'trained_beast',
  'Wild Beast':    'wild_beast',
};

export const SPECIES_ART_PREFIX: Record<SpeciesName, string> = {
  'Grallok':  'grallok',
  'Gryllo':   'gryllo',
  'Human':    'human',
  'Lypran':   'lypran',
  'Other':    'other',
  'Slink':    'slink',
  'Timeless': 'timeless',
  'Wolf':     'wolf',
};
