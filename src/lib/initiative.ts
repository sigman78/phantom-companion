import type { AdversaryUnit, ActivationEntry, SpeciesCard, ColorCard } from '../types/game';

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
    if (a.drawGroupOrder !== b.drawGroupOrder) return a.drawGroupOrder - b.drawGroupOrder;
    if (
      a.classCardIndex === b.classCardIndex &&
      a.classCard.Cost === b.classCard.Cost
    ) {
      return a.classCardOrderIndex - b.classCardOrderIndex;
    }
    return 0;
  });
}

export function numberActivations(entries: ActivationEntry[]): ActivationEntry[] {
  return entries.map((e, i) => ({ ...e, activationOrder: i + 1 }));
}
