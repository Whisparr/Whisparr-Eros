import ModelBase from 'App/ModelBase';
import { Image, MovieStatus, Ratings } from 'Movie/Movie';

// Mirrors `CollectionMovieResource`. Note there is no `id` -- the resource is
// built from `MovieMetadata`, not from a library `Movie` -- so `isExisting` is
// the only thing on it that says whether the movie is in the library.
export interface MovieCollectionMovie {
  foreignId: string;
  tmdbId: number;
  tpdbId: string;
  stashId: string;
  imdbId: string;
  title: string;
  cleanTitle: string;
  sortTitle: string;
  status: MovieStatus;
  overview: string;
  runtime: number;
  images: Image[];
  year: number;
  ratings: Ratings;
  genres: string[];
  itemType: string;
  folder: string;
  isExisting: boolean;
  isExcluded: boolean;
}

interface MovieCollection extends ModelBase {
  title: string;
  sortTitle: string;
  tmdbId: number;
  images: Image[];
  overview: string;
  monitored: boolean;
  monitorNewItems: boolean;
  rootFolderPath: string;
  qualityProfileId: number;
  searchOnAdd: boolean;
  movies: MovieCollectionMovie[];
  missingMovies: number;
  tags: number[];
}

export default MovieCollection;
