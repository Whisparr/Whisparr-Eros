import { useMutation } from '@tanstack/react-query';
import { queryClient } from 'App/queryClient';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import fetchJson, { ApiError } from '../Utilities/Fetch/fetchJson';
import Movie from './Movie';

// Shared auth headers for all API calls
const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};
const apiRoot = '/api/v3';

function apiPut<T, TBody>(path: string, body: TBody) {
  return fetchJson<T, TBody>({
    path: `${apiRoot}${path}`,
    method: 'PUT',
    body,
    headers: AUTH_HEADERS,
  });
}

// Fetch a single movie by ID or foreignId
export function useMovie(idOrForeignId: string | number | undefined) {
  return useApiQuery<Movie | undefined>({
    path: `/movie/${idOrForeignId}`,
    queryOptions: { enabled: !!idOrForeignId },
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

// TODO: Move to useApiMutation
export function useToggleMovieMonitored(idOrForeignId: string | number) {
  return useMutation({
    mutationFn: ({ movie, monitored }: { movie: Movie; monitored: boolean }) =>
      apiPut<Movie, Movie>(`/movie/${movie.id}`, { ...movie, monitored }),
    onSuccess: (data) => {
      queryClient.setQueryData([`/movie/${idOrForeignId}`], data);
    },
  });
}

// TODO: Move to useApiMutation
export function useSaveMovie() {
  return useMutation<Movie, ApiError, { movie: Movie; moveFiles?: boolean }>({
    mutationFn: ({
      movie,
      moveFiles = false,
    }: {
      movie: Movie;
      moveFiles?: boolean;
    }) => {
      const url = moveFiles
        ? `/movie/${movie.id}?moveFiles=true`
        : `/movie/${movie.id}`;
      return apiPut<Movie, Movie>(url, movie);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/movie/${data.id}`], data);
      queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });
    },
  });
}

export default useMovie;
