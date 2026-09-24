import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie from 'Movie/Movie';
import { PagingResource } from 'Movie/Movie.types';
import Performer from 'Performer/Performer';
import Studio from 'Studio/Studio';

export interface LibrarySearchSection<T> {
  totalRecords: number;
  records: T[];
}

export interface LibrarySearchResult {
  performers: LibrarySearchSection<Performer>;
  studios: LibrarySearchSection<Studio>;
  scenes: LibrarySearchSection<Movie>;
  movies: LibrarySearchSection<Movie>;
}

export type LibrarySearchType = 'scene' | 'movie' | 'performer' | 'studio';

interface LibrarySearchTypeMap {
  scene: Movie;
  movie: Movie;
  performer: Performer;
  studio: Studio;
}

// The best matches of each type in the local library. Nothing here looks
// anything up remotely.
function useLibrarySearch(
  term: string,
  limit: number = 4,
  minLength: number = 3
) {
  return useApiQuery<LibrarySearchResult>({
    path: '/library/search',
    queryParams: { term, limit },
    queryOptions: {
      enabled: !!term.trim() && term.length >= minLength,
      placeholderData: undefined,
    },
  });
}

// One page of a single type's matches.
export function useLibrarySearchPage<T extends LibrarySearchType>(
  type: T,
  term: string,
  page: number,
  pageSize: number,
  enabled: boolean = true
) {
  return useApiQuery<PagingResource<LibrarySearchTypeMap[T]>>({
    path: `/library/search/${type}`,
    queryParams: { term, page, pageSize },
    queryOptions: { enabled: enabled && !!term.trim() },
  });
}

export default useLibrarySearch;
