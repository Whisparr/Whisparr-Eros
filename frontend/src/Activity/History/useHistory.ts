import { useMutation } from '@tanstack/react-query';
import { queryClient } from 'App/queryClient';
import { PropertyFilter } from 'Filters/Filter';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { SortDirection } from 'Helpers/Props/sortDirections';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import History from '../../typings/History';
import fetchJson from '../../Utilities/Fetch/fetchJson';

const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

function apiPost<T>(path: string, body: unknown) {
  return fetchJson<T, unknown>({
    path: getQueryPath(path),
    method: 'POST',
    headers: AUTH_HEADERS,
    body,
  });
}

export interface HistoryPageParams {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  filters?: PropertyFilter[];
}

export interface HistoryPageResult {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  totalRecords: number;
  records: History[];
}

// Fetch all history for the main Activity > History page
export function useHistory(params: HistoryPageParams) {
  const { page, pageSize, sortKey, sortDirection, filters = [] } = params;

  return useApiQuery<HistoryPageResult>({
    path: '/history',
    queryParams: { page, pageSize, sortKey, sortDirection, filters },
  });
}

// Fetch all movie history for a single movieId
export function useMovieHistory(movieId: number | undefined) {
  return useApiQuery<History[] | undefined>({
    path: '/history/movie',
    queryOptions: { enabled: !!movieId },
    queryParams: { movieId },
  });
}

// TODO: Move to useApiMutation
// Mark a history item as failed
export function useMarkHistoryFailed() {
  return useMutation({
    mutationFn: (historyId: number) =>
      apiPost(`/history/failed/${historyId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/history'],
      });
    },
  });
}

export default useHistory;
