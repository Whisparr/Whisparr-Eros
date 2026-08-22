import { useMemo } from 'react';
import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie from 'Movie/Movie';
import MovieCollection from './MovieCollection';

export const COLLECTION_PATH = '/collection';
export const EXISTING_MOVIES_PATH = '/movie/list';

const EMPTY: MovieCollection[] = [];

export function useMovieCollections() {
  const { data, ...rest } = useApiQuery<MovieCollection[]>({
    path: COLLECTION_PATH,
  });

  return { collections: data ?? EMPTY, ...rest };
}

export function useMovieCollection(collectionId: number | undefined) {
  const { collections } = useMovieCollections();

  return useMemo(
    () => collections.find((collection) => collection.id === collectionId),
    [collections, collectionId]
  );
}

// The collection resource is built from `MovieMetadata`, so its movies carry
// `isExisting` but no library id, monitored flag or file state. Everything the
// posters show beyond "is it here" needs the real movies, which is what this
// asks for -- only for the ones the server already said are in the library.
export function useCollectionExistingMovies(collections: MovieCollection[]) {
  const foreignIds = useMemo(() => {
    const ids = new Set<string>();

    collections.forEach((collection) => {
      collection.movies.forEach((movie) => {
        if (movie.isExisting) {
          ids.add(movie.foreignId);
        }
      });
    });

    return Array.from(ids).sort();
  }, [collections]);

  const { data } = useApiQuery<Movie[]>({
    path: EXISTING_MOVIES_PATH,
    method: 'POST',
    body: foreignIds,
    queryOptions: { enabled: foreignIds.length > 0 },
  });

  return useMemo(() => {
    const map = new Map<string, Movie>();

    (data ?? []).forEach((movie) => map.set(movie.foreignId, movie));

    return map;
  }, [data]);
}

// `GET /collection?tmdbId=` answers with a one-element list. Used where a single
// collection is wanted away from the collections page -- asking for the whole
// list there would pull every collection's movies down for one label.
export function useMovieCollectionByTmdbId(tmdbId: number | undefined) {
  const { data } = useApiQuery<MovieCollection[]>({
    path: COLLECTION_PATH,
    queryParams: { tmdbId },
    queryOptions: { enabled: !!tmdbId },
  });

  return data?.[0];
}

function invalidateCollections() {
  queryClient.invalidateQueries({ queryKey: [COLLECTION_PATH] });
}

// Deliberately invalidates nothing. `UpdateCollection` raises
// `CollectionEditedEvent`, so `SignalRListener` invalidates this key already.
export function useSaveMovieCollection() {
  return useApiMutation<MovieCollection, MovieCollection>({
    method: 'PUT',
    path: ({ id }) => `${COLLECTION_PATH}/${id}`,
  });
}

export interface MovieCollectionUpdatePayload {
  collectionIds: number[];
  monitored?: boolean;
  monitorMovies?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
}

// The bulk endpoint is the exception: `UpdateCollections` writes straight to the
// repository without raising `CollectionEditedEvent`, so nothing is broadcast
// and this has to invalidate for itself.
export function useSaveMovieCollections() {
  return useApiMutation<MovieCollection[], MovieCollectionUpdatePayload>({
    method: 'PUT',
    path: COLLECTION_PATH,
    mutationOptions: { onSuccess: invalidateCollections },
  });
}

export interface DeleteMovieCollectionPayload {
  id: number;
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

// `RemoveCollection` raises `CollectionDeletedEvent`; SignalR handles the rest.
export function useDeleteMovieCollection() {
  return useApiMutation<void, DeleteMovieCollectionPayload>({
    method: 'DELETE',
    path: ({ id, deleteFiles, addImportExclusion }) =>
      `${COLLECTION_PATH}/${id}?deleteFiles=${deleteFiles}&addImportExclusion=${addImportExclusion}`,
  });
}

// Toggling monitored is the same PUT with the same body; named separately only
// so the call sites read as what they do.
export const useToggleCollectionMonitored = useSaveMovieCollection;

// Adding a movie changes `isExisting` and `missingMovies` on the collection it
// came from, and nothing broadcasts that, so the collections have to be
// invalidated by hand. The existing-movies query needs no help: its key is the
// list of existing foreign ids, so the refreshed collections give it a new key
// and it fetches once for the new set rather than twice for the old and new.
export function useAddCollectionMovie() {
  return useApiMutation<Movie, Partial<Movie>>({
    method: 'POST',
    path: '/movie',
    mutationOptions: {
      onSuccess: () => {
        invalidateCollections();
        queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });
      },
    },
  });
}
