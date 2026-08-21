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
