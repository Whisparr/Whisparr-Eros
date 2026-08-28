import ModelBase from 'App/ModelBase';
import Language from 'Language/Language';
import { MovieFile } from 'MovieFile/MovieFile';
import MovieCredit from 'typings/MovieCredit';

// The shape an import list's `monitor` takes. `MovieAddOptions` used to claim
// it too -- see the note there.
export type MovieMonitor = 'monitor' | 'none';

export type MovieStatus =
  'tba' | 'announced' | 'inCinemas' | 'released' | 'deleted';

// Every member of `MediaCoverTypes` (src/NzbDrone.Core/MediaCover/MediaCover.cs),
// which is what the API serialises. `banner`, `headshot` and `unknown` were
// missing, and `MovieHeadshot` asks for `headshot`.
export type CoverType =
  | 'unknown'
  | 'poster'
  | 'banner'
  | 'fanart'
  | 'screenshot'
  | 'headshot'
  | 'clearlogo';

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

// What the add flows actually send. The declared shape was `monitor:
// MovieMonitor`, which no caller has ever produced and whose values do not
// match the server's `MonitorTypes` either; `getNewMovie`, `getNewPerformer`,
// `getNewStudio` and the import body all send `monitored`. The server's
// `AddMovieOptions` has neither -- it reads `SearchForMovie` and defaults
// `Monitor` -- so the key is inert on the wire. Typed as sent; sending
// `monitor` instead would be a behaviour change, not a typing fix.
export interface MovieAddOptions {
  monitored: boolean;
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
