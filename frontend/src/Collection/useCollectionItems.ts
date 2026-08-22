import { useMemo } from 'react';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import clientSideFilterAndSort from 'Utilities/Filter/clientSideFilterAndSort';
import {
  COLLECTION_FILTER_PREDICATES,
  COLLECTION_FILTERS,
} from './collectionFilters';
import { useCollectionOptions } from './collectionOptionsStore';
import MovieCollection from './MovieCollection';
import { useMovieCollections } from './useMovieCollections';

export interface CollectionItem extends MovieCollection {
  genres: string[];
}

// Replaces `createCollectionClientSideCollectionItemsSelector`, which stripped
// every collection down to `{id, sortTitle}` so `CollectionItemConnector` could
// re-select the whole thing by id one row at a time. React Query hands back one
// stable array, so the rows can just be given the collections.
export function useCollectionItems() {
  const { collections, isFetching, isLoading, error } = useMovieCollections();
  const { sortKey, sortDirection, selectedFilterKey } = useCollectionOptions();
  const customFilters = useCustomFiltersList('movieCollections');

  const items = useMemo(() => {
    // The slice set `secondarySortKey` to `sortTitle` as well, so its secondary
    // clause only ever repeated the primary one. Left out rather than carried
    // over.
    const { data } = clientSideFilterAndSort(collections, {
      selectedFilterKey,
      filters: COLLECTION_FILTERS,
      filterPredicates: COLLECTION_FILTER_PREDICATES,
      customFilters,
      sortKey,
      sortDirection,
    });

    // Was `CollectionItemConnector`: newest movie first, and the union of the
    // movies' genres for the collection's own genre label.
    return data.map((collection): CollectionItem => {
      return {
        ...collection,
        movies: [...collection.movies].sort((a, b) => b.year - a.year),
        genres: Array.from(
          new Set(collection.movies.flatMap((movie) => movie.genres))
        ),
      };
    });
  }, [collections, customFilters, selectedFilterKey, sortKey, sortDirection]);

  return {
    items,
    totalItems: collections.length,
    isFetching,
    isLoading,
    error,
    customFilters,
  };
}
