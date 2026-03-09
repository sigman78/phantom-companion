import type { ClassName, SpeciesName } from '../types/game';
import { CLASS_ART_PREFIX, SPECIES_ART_PREFIX } from './adversaries';

const BASE_CLASS_ART   = '/game-data/art/adv-class-actions';
const BASE_SPECIES_ART = '/game-data/art/adv-species-actions';
const BASE_ICONS       = '/game-data/art/adv-icons';

export function classCardArtUrl(className: ClassName, cardIndex: number): string {
  return `${BASE_CLASS_ART}/${CLASS_ART_PREFIX[className]}_act${cardIndex}.png`;
}

export function classCardBackUrl(className: ClassName): string {
  return `${BASE_CLASS_ART}/${CLASS_ART_PREFIX[className]}_back.png`;
}

export function speciesCardArtUrl(species: SpeciesName, cardIndex: number): string {
  return `${BASE_SPECIES_ART}/${SPECIES_ART_PREFIX[species]}_act${cardIndex}.png`;
}

export function speciesCardBackUrl(species: SpeciesName): string {
  return `${BASE_SPECIES_ART}/${SPECIES_ART_PREFIX[species]}_back.png`;
}

// "Grallok Archer" -> /game-data/art/adv-icons/Grallok_Archer.png
export function adversaryIconUrl(adversaryName: string): string {
  return `${BASE_ICONS}/${adversaryName.replace(/ /g, '_')}.png`;
}

// Phase 1: reuse icon as portrait
export function adversaryPortraitUrl(adversaryName: string): string {
  return adversaryIconUrl(adversaryName);
}
