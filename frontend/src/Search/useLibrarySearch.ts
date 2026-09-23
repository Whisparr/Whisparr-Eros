import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie from 'Movie/Movie';
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

// The best matches of each type in the local library. Nothing here looks
// anything up remotely.
function useLibrarySearch(term: string, limit: number = 4) {
  return useApiQuery<LibrarySearchResult>({
    path: '/library/search',
    queryParams: { term, limit },
    queryOptions: {
      enabled: !!term && term.length > 2,
      placeholderData: undefined,
    },
  });
}

export default useLibrarySearch;
