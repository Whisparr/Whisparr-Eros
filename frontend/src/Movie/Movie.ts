import ModelBase from 'App/ModelBase';
import Language from 'Language/Language';
import { MovieFile } from 'MovieFile/MovieFile';
import MovieCredit from 'typings/MovieCredit';

export type MovieMonitor = 'monitor' | 'none';

export type MovieStatus =
  'tba' | 'announced' | 'inCinemas' | 'released' | 'deleted';

export type CoverType = 'poster' | 'fanart' | 'screenshot' | 'clearlogo';

export interface Image {
  coverType: CoverType;
  url: string;
  remoteUrl: string;
}

export interface Collection {
  tmdbId: number;
  title: string;
}

export interface Statistics {
  movieFileCount: number;
  releaseGroups: string[];
  sizeOnDisk: number;
}

export interface RatingValues {
  votes: number;
  value: number;
}

export interface Ratings {
  tmdb: RatingValues;
}

export interface AlternativeTitle extends ModelBase {
  sourceType: string;
  title: string;
}

export interface MovieAddOptions {
  monitor: MovieMonitor;
  searchForMovie: boolean;
}

interface Movie extends ModelBase {
  foreignId: string;
  tmdbId: number;
  tpdbId: string;
  stashId: string;
  code: string;
  certification: string;
  itemType: string;
  added: string;
  addOptions: MovieAddOptions;
  alternateTitles: AlternativeTitle[];
  cleanTitle: string;
  collection: Collection;
  credits: MovieCredit[];
  genres: string[];
  grabbed?: boolean;
  hasFile: boolean;
  images: Image[];
  isAvailable: boolean;
  isSaving?: boolean;
  lastSearchTime?: string;
  monitored: boolean;
  movieFile?: MovieFile;
  movieFileId: number;
  originalLanguage: Language;
  originalTitle: string;
  overview: string;
  path: string;
  performerForeignIds: Array<string>;
  performerNames: Array<string>;
  qualityProfileId: number;
  ratings: Ratings;
  releaseDate: string;
  rootFolderPath: string;
  runtime: number;
  sizeOnDisk?: number;
  sortTitle: string;
  statistics: Statistics;
  status: MovieStatus;
  studioForeignId: string;
  studioTitle: string;
  tags: number[];
  title: string;
  titleSlug: string;
  website: string;
  year: number;
}

// Added to allow for faster updates to monitored status.  Can be extended in the future
export interface MoviePatchResource extends ModelBase {
  monitored: boolean;
}

export default Movie;
