import type { ClassName, SpeciesName } from '../types/game';
import { CLASS_ART_PREFIX, SPECIES_ART_PREFIX } from './adversaries';

const BASE_CLASS_ART   = '/game-data/art/adv-class-actions';
const BASE_SPECIES_ART = '/game-data/art/adv-species-actions';
const BASE_ICONS       = '/game-data/art/adv-icons';

export function classCardArtUrl(className: ClassName, cardIndex: number): string {
  return `${BASE_CLASS_ART}/${CLASS_ART_PREFIX[className]}_act${cardIndex}.jpg`;
}

// SPECIAL CASE: Trained Beast back file is "trainer_beast_back.jpg" (typo in source art).
export function classCardBackUrl(className: ClassName): string {
  if (className === 'Trained Beast') {
    return `${BASE_CLASS_ART}/trainer_beast_back.jpg`;
  }
  return `${BASE_CLASS_ART}/${CLASS_ART_PREFIX[className]}_back.jpg`;
}

export function speciesCardArtUrl(species: SpeciesName, cardIndex: number): string {
  return `${BASE_SPECIES_ART}/${SPECIES_ART_PREFIX[species]}_act${cardIndex}.jpg`;
}

export function speciesCardBackUrl(species: SpeciesName): string {
  return `${BASE_SPECIES_ART}/${SPECIES_ART_PREFIX[species]}_back.jpg`;
}

// "Grallok Archer" -> /game-data/art/adv-icons/Grallok_Archer.png
export function adversaryIconUrl(adversaryName: string): string {
  return `${BASE_ICONS}/${adversaryName.replace(/ /g, '_')}.png`;
}

// Phase 1: reuse icon as portrait
export function adversaryPortraitUrl(adversaryName: string): string {
  return adversaryIconUrl(adversaryName);
}
