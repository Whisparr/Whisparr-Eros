import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from 'App/queryClient';
import History from '../../typings/History';
import fetchJson, { apiRoot } from '../../Utilities/Fetch/fetchJson';

const API_ROOT = apiRoot;
const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

function apiGet<T>(path: string) {
  return fetchJson<T, undefined>({
    path: `${API_ROOT}${path}`,
    method: 'GET',
    headers: AUTH_HEADERS,
  });
}

function apiPost<T>(path: string, body: unknown) {
  return fetchJson<T, unknown>({
    path: `${API_ROOT}${path}`,
    method: 'POST',
    headers: AUTH_HEADERS,
    body,
  });
}

// Fetch all history (FUTURE USE for pagination)
export function useHistory(movieId: number | undefined) {
  const PATH = `/history`;
  return useQuery<History[] | undefined>({
    queryKey: [PATH],
    queryFn: async () => {
      if (!movieId) return undefined;
      return apiGet<History[]>(PATH);
    },
    enabled: !!movieId,
  });
}

// Fetch all movie history for single a movieId
export function useMovieHistory(movieId: number | undefined) {
  const PATH = `/history/movie?movieId=${movieId}`;
  return useQuery<History[] | undefined>({
    queryKey: [PATH],
    queryFn: async () => {
      if (!movieId) return undefined;
      return apiGet<History[]>(PATH);
    },
    enabled: !!movieId,
  });
}

// Mark a history item as failed
export function useMarkHistoryFailed(movieId: number) {
  return useMutation({
    mutationFn: (historyId: number) =>
      apiPost(`/history/failed/${historyId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/history/movie/${movieId}`],
      });
    },
  });
}

export default useHistory;
