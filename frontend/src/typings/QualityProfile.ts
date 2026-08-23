import Language from 'Language/Language';
import Quality from 'Quality/Quality';
import { QualityProfileFormatItem } from './CustomFormat';

export interface QualityProfileQualityItem {
  id?: number;
  name?: string;
  quality: Quality;
  items?: QualityProfileQualityItem[];
  allowed: boolean;
}

// A group carries no `quality` of its own -- the API omits null properties, so
// the key is absent rather than null, which is what makes `item.quality` the
// narrowing test everywhere below.
export interface QualityProfileGroup {
  id: number;
  name: string;
  quality?: undefined;
  items: QualityProfileQualityItem[];
  allowed: boolean;
}

export type QualityProfileItem =
  QualityProfileQualityItem | QualityProfileGroup;

interface QualityProfile {
  name: string;
  upgradeAllowed: boolean;
  fallback: boolean;
  cutoff: number;
  items: QualityProfileItem[];
  minFormatScore: number;
  cutoffFormatScore: number;
  minUpgradeFormatScore: number;
  formatItems: QualityProfileFormatItem[];
  language: Language;
  id: number;
}

export default QualityProfile;
