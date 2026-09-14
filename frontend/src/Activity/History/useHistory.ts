import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Filter, FilterBuilderProp } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  filterTypes,
} from 'Helpers/Props';
import History from 'typings/History';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import translate from 'Utilities/String/translate';
import { useHistoryOptions } from './historyOptionsStore';

interface MarkAsFailedData {
  id: number;
}

export const FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
  {
    key: 'grabbed',
    label: () => translate('Grabbed'),
    filters: [
      {
        key: 'eventType',
        value: '1',
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'imported',
    label: () => translate('Imported'),
    filters: [
      {
        key: 'eventType',
        value: '3',
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'failed',
    label: () => translate('Failed'),
    filters: [
      {
        key: 'eventType',
        value: '4',
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'deleted',
    label: () => translate('Deleted'),
    filters: [
      {
        key: 'eventType',
        value: '6',
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'renamed',
    label: () => translate('Renamed'),
    filters: [
      {
        key: 'eventType',
        value: '8',
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'ignored',
    label: () => translate('Ignored'),
    filters: [
      {
        key: 'eventType',
        value: '9',
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'diskScanImported',
    label: () => translate('DiskScanImported'),
    filters: [
      {
        key: 'eventType',
        value: '10',
        type: filterTypes.EQUAL,
      },
    ],
  },
];

export const FILTER_BUILDER: FilterBuilderProp<History>[] = [
  {
    name: 'eventType',
    label: () => translate('EventType'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.HISTORY_EVENT_TYPE,
  },
  {
    name: 'movieIds',
    label: () => translate('Movie'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.MOVIE,
  },
  {
    name: 'quality',
    label: () => translate('Quality'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.QUALITY,
  },
  {
    name: 'languages',
    label: () => translate('Languages'),
    type: filterBuilderTypes.CONTAINS,
    valueType: filterBuilderValueTypes.LANGUAGE,
  },
];

const useHistory = () => {
  const { page, goToPage } = usePage('history');
  const { pageSize, selectedFilterKey, sortKey, sortDirection } =
    useHistoryOptions();

  const customFilters = useCustomFiltersList('history');

  const filters = useMemo(() => {
    return findSelectedFilters(selectedFilterKey, FILTERS, customFilters);
  }, [selectedFilterKey, customFilters]);

  const query = usePagedApiQuery<History>({
    path: '/history',
    page,
    pageSize,
    filters,
    sortKey,
    sortDirection,
  });

  return {
    ...query,
    goToPage,
    page,
  };
};

export default useHistory;

const DEFAULT_HISTORY: History[] = [];

// History for a single movie, used by the movie history modal.
export const useMovieHistory = (movieId: number | undefined) => {
  const { data, ...query } = useApiQuery<History[]>({
    path: '/history/movie',
    queryParams: { movieId },
    queryOptions: { enabled: !!movieId },
  });

  return {
    ...query,
    data: data ?? DEFAULT_HISTORY,
  };
};

export const useMarkHistoryFailed = () => {
  const queryClient = useQueryClient();

  return useApiMutation<unknown, MarkAsFailedData>({
    path: ({ id }) => `/history/failed/${id}`,
    method: 'POST',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/history'] });
        queryClient.invalidateQueries({ queryKey: ['/history/movie'] });
      },
    },
  });
};
