import type { AdversaryColor, AdversaryUnit, ActivationEntry, SpeciesCard, ColorCard } from '../types/game';

const COLOR_ORDER: AdversaryColor[] = ['Red', 'Blue', 'Cyan', 'Yellow'];

export function calcInitiative(
  unit: AdversaryUnit,
  speciesCard: SpeciesCard,
  classCardEntry: ColorCard[]
): number {
  const card = classCardEntry.find(c => c.Color === unit.color);
  return speciesCard.Cost + (card?.Cost ?? 0);
}

export function sortActivations(entries: ActivationEntry[]): ActivationEntry[] {
  return [...entries].sort((a, b) => {
    if (a.initiative !== b.initiative) return a.initiative - b.initiative;
    return COLOR_ORDER.indexOf(a.unit.color) - COLOR_ORDER.indexOf(b.unit.color);
  });
}

export function numberActivations(entries: ActivationEntry[]): ActivationEntry[] {
  return entries.map((e, i) => ({ ...e, activationOrder: i + 1 }));
}
