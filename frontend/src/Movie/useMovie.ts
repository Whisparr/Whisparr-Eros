import { useMemo } from 'react';
import { queryClient } from 'App/queryClient';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Movie, { MoviePatchResource } from './Movie';

// Fetch a single movie by titleSlug or movieId
export function useMovie(titleSlug: string | number | undefined) {
  return useApiQuery<Movie | undefined>({
    path: `/movie/${titleSlug}`,
    queryOptions: { enabled: !!titleSlug },
  });
}

// Fetch multiple movies by foreignIds
export function useMoviesByForeignIds(foreignIds: string[] | undefined) {
  return useApiQuery<Movie[]>({
    method: 'POST',
    path: '/moviesByForeignIds',
    queryOptions: { enabled: !!foreignIds && foreignIds.length > 0 },
    queryParams: { foreignIds },
  });
}

const EMPTY_MOVIES: Movie[] = [];

// Fetch multiple movies by library id. Replaces `createMultiMoviesSelector`,
// which read the `movies` slice -- empty since the index went paged, so every
// caller silently rendered nothing.
//
// The ids are sorted because `useApiQuery` builds the cache key from the body:
// the same set in a different order would otherwise be a second request.
export function useMoviesByIds(movieIds: number[]) {
  const ids = useMemo(() => [...movieIds].sort((a, b) => a - b), [movieIds]);

  const { data, ...rest } = useApiQuery<Movie[]>({
    method: 'POST',
    path: '/movie/bulk',
    body: ids,
    queryOptions: { enabled: ids.length > 0 },
  });

  return { movies: data ?? EMPTY_MOVIES, ...rest };
}

// Every movie and scene in the library. The filter builder's Movie picker is
// the only thing that needs the whole table -- the indexes page on the server --
// so this is deliberately not a shared "load the library" hook, and nothing
// calls it on a path the user did not ask for.
//
// It is an expensive answer: full resources, one per row, so a 17k-scene library
// is ~46MB of JSON (~12MB gzipped). `excludeLocalCovers` drops a per-movie stat
// of the cover files server-side, which is the only part of the cost the API
// lets the client decline; the picker renders titles only and wants none of the
// rest. A projection endpoint returning id and title is the real fix and is its
// own change.
//
// Because of that cost the result is held for five minutes rather than refetched
// per mount, and `SignalRListener` deliberately does not invalidate it: a library
// scan emits a movie event per record, and each one would re-download the list
// while a filter row happened to be open.
export function useAllMovies() {
  const { data, ...rest } = useApiQuery<Movie[]>({
    path: '/movie',
    queryParams: { excludeLocalCovers: true },
    queryOptions: { staleTime: 5 * 60 * 1000 },
  });

  // `ItemType` also has Studio and Performer. Those live in their own tables
  // today, but the selector this replaces filtered them out, so it keeps doing
  // so rather than assume.
  const movies = useMemo(
    () =>
      (data ?? EMPTY_MOVIES).filter(
        (movie) => movie.itemType === 'movie' || movie.itemType === 'scene'
      ),
    [data]
  );

  return { movies, ...rest };
}

export function useToggleMovieMonitored() {
  return useApiMutation<Movie, MoviePatchResource>({
    method: 'PATCH',
    path: ({ id }) => `/movie/${id}`,
    mutationOptions: {
      onSuccess: (data) => {
        queryClient.setQueryData([`/movie/${data.titleSlug}`], data);
      },
    },
  });
}

export function useSaveMovie(moveFiles = false) {
  return useApiMutation<Movie, Movie>({
    method: 'PUT',
    path: ({ id }) => `/movie/${id}`,
    // Passed only when moving. getQueryString emits `moveFiles=false` for a
    // literal false, where the previous hand-rolled URL omitted the param
    // entirely.
    queryParams: moveFiles ? { moveFiles: true } : undefined,
    mutationOptions: {
      onSuccess: (data) => {
        queryClient.setQueryData([`/movie/${data.titleSlug}`], data);
        queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });
      },
      onError: (error) => {
        console.error('useSaveMovie error', error);
      },
    },
  });
}

// `monitored` is a query param rather than part of the body -- the body is the
// bare id array -- so it is fixed per instance, as `useSaveMovie`'s `moveFiles`
// is. Callers that toggle take one of each.
//
// Deliberately invalidates nothing. `SignalRListener` already patches every
// cached view of a changed movie -- the paged lists, the calendar, and the
// performer and studio works lists -- and does so without a refetch by design.
// The thunk this replaces left the caches to SignalR in the same way.
export function useBulkMonitorMovies(monitored: boolean) {
  return useApiMutation<unknown, number[]>({
    method: 'PATCH',
    path: `/movie/bulk/monitor?monitored=${monitored}`,
  });
}

export function useSearchMovie(query: string, limit: number = 10) {
  return useApiQuery<Movie[]>({
    path: `/movie/search`,
    queryParams: { query, limit },
    queryOptions: { enabled: !!query && query.length > 2 },
  });
}

export function useSearchMovieUncached(query: string, limit: number = 10) {
  return useApiQuery<Movie[]>({
    path: `/movie/search`,
    queryParams: { query, limit },
    queryOptions: {
      enabled: !!query && query.length > 2,
      placeholderData: undefined,
    },
  });
}

export default useMovie;
