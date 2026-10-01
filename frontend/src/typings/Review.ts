import ModelBase from 'App/ModelBase';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';

export type ReviewReason = 'weakMatch' | 'ambiguousMatch' | 'unknownQuality';

export type MovieParseMatchType =
  | 'stashId'
  | 'title'
  | 'episode'
  | 'performersTitle'
  | 'charactersTitle'
  | 'performers'
  | 'characters'
  | 'performerTitle'
  | 'characterTitle'
  | 'performersNotTitle'
  | 'charactersNotTitle'
  | 'parsedTitleContainsCleanTitle';

export interface ReviewCandidate {
  movieId: number;
  title?: string;
  titleSlug?: string;
  studioTitle?: string;
  releaseDate?: string;
  code?: string;
  matchType?: MovieParseMatchType;
  hasFile: boolean;
  monitored: boolean;
}

interface Review extends ModelBase {
  movieId: number;
  candidates: ReviewCandidate[];
  title: string;
  indexerId: number;
  indexer?: string;
  infoUrl?: string;
  size: number;
  protocol: DownloadProtocol;
  quality: QualityModel;
  languages: Language[];
  reasons: ReviewReason[];
  status: 'pending' | 'approved' | 'rejected';
  publishDate?: string;
  added: string;
}

export interface ReviewActionResult {
  approved: number[];
  failed: { id: number; message: string }[];
}

export default Review;
