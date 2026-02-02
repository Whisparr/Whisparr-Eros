import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as Icons from 'Helpers/Props/icons';

export const MALE = 'male';
export const FEMALE = 'female';
export const TRANSMALE = 'transmale';
export const TRANSFEMALE = 'transfemale';
export const INTERSEX = 'intersex';
export const NONBINARY = 'non-binary';
export const UNKNOWN = 'unknown';

// Strict Gender type
export type Gender =
  | typeof MALE
  | typeof FEMALE
  | typeof TRANSMALE
  | typeof TRANSFEMALE
  | typeof INTERSEX
  | typeof NONBINARY
  | typeof UNKNOWN;

export const all: Gender[] = [
  MALE,
  FEMALE,
  TRANSMALE,
  TRANSFEMALE,
  INTERSEX,
  NONBINARY,
  UNKNOWN,
];

// Gender details return type

// Type-safe icon name: any value exported from Icons (should be IconDefinition)
export type IconName = IconDefinition;

// Gender details return type
export interface GenderDetails {
  gender: string;
  icon: IconName;
}

// Returns gender and icon for a performer
export function getGenderDetails(gender: string): GenderDetails {
  if (gender) {
    const g = gender.toLowerCase() as Gender;
    if (all.includes(g)) {
      gender = g;
    }
  }
  let icon: IconName = Icons.PERFORMER;
  switch (gender) {
    case MALE:
      icon = Icons.PERFORMERMALE;
      break;
    case FEMALE:
      icon = Icons.PERFORMERFEMALE;
      break;
    case TRANSMALE:
      icon = Icons.PERFORMERTRANS;
      break;
    case TRANSFEMALE:
      icon = Icons.PERFORMERTRANS;
      break;
    case INTERSEX:
      icon = Icons.PERFORMERTRANS;
      break;
    case NONBINARY:
      icon = Icons.PERFORMERTRANS;
      break;
    default:
      icon = Icons.PERFORMER;
      break;
  }
  return { gender, icon };
}
