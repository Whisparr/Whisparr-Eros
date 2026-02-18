import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from 'App/queryClient';
import fetchJson from '../Utilities/Fetch/fetchJson';
import Movie from './Movie';
import { MoviePagingRequest, PagingResource } from './Movie.types';

// Shared auth headers for all API calls
const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};
const apiRoot = '/api/v3';

// Helper for GET
function apiGet<T>(path: string) {
  return fetchJson<T, undefined>({
    path: `${apiRoot}${path}`,
    method: 'GET',
    headers: AUTH_HEADERS,
  });
}

// Helper for POST
function apiPost<T, TBody>(path: string, body: TBody) {
  return fetchJson<T, TBody>({
    path: `${apiRoot}${path}`,
    method: 'POST',
    body,
    headers: AUTH_HEADERS,
  });
}

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
  return useQuery<Movie | undefined>({
    queryKey: [`/movie/${idOrForeignId}`],
    queryFn: async () => {
      if (!idOrForeignId) return undefined;
      return apiGet<Movie>(`/movie/${idOrForeignId}`);
    },
    enabled: !!idOrForeignId,
  });
}

// Fetch paged movies/scenes for index views
export function useMovieIndexQuery(params: MoviePagingRequest) {
  return useQuery<PagingResource<Movie>>({
    queryKey: ['/movie/paged', params],
    queryFn: () =>
      apiPost<PagingResource<Movie>, MoviePagingRequest>(
        '/movie/paged',
        params
      ),
    placeholderData: (prev) => prev,
  });
}

// Fetch multiple movies by foreignIds
export function useMoviesByForeignIds(foreignIds: string[] | undefined) {
  return useQuery<Movie[]>({
    queryKey: ['moviesByForeignIds', foreignIds],
    queryFn: () =>
      foreignIds && foreignIds.length > 0
        ? apiPost<Movie[], string[]>('/movie/list', foreignIds)
        : [],
    enabled: !!foreignIds && foreignIds.length > 0,
  });
}

export function useToggleMovieMonitored(idOrForeignId: string | number) {
  return useMutation({
    mutationFn: ({ movie, monitored }: { movie: Movie; monitored: boolean }) =>
      apiPut<Movie, Movie>(`/movie/${movie.id}`, { ...movie, monitored }),
    onSuccess: (data) => {
      queryClient.setQueryData([`/movie/${idOrForeignId}`], data);
    },
  });
}

export default useMovie;
