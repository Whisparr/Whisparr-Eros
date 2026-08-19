import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CustomFilter, Filter, FilterBuilderProp } from 'Filters/Filter';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import { createCustomFiltersSelector } from 'Store/Selectors/createClientSideCollectionSelector';
import Queue from 'typings/Queue';
import getQueryString from 'Utilities/Fetch/getQueryString';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import translate from 'Utilities/String/translate';
import { useQueueOptions } from './queueOptionsStore';

interface BulkQueueData {
  ids: number[];
}

export interface RemoveQueueItemData {
  id: number;
  remove: boolean;
  changeCategory: boolean;
  blocklist: boolean;
  skipRedownload: boolean;
}

export type RemoveQueueItemsData = Omit<RemoveQueueItemData, 'id'> & {
  ids: number[];
};

// The API takes `removeFromClient`, not `remove`, which is what
// RemoveQueueItemModal emits.
function getRemovalQueryString({
  remove,
  changeCategory,
  blocklist,
  skipRedownload,
}: Omit<RemoveQueueItemData, 'id'>) {
  return getQueryString({
    removeFromClient: remove,
    changeCategory,
    blocklist,
    skipRedownload,
  });
}

export const FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
];

// `movieIds` uses the MOVIE value type, whose picker lists every record in the
// movie table by title -- scenes and movies together, with no `itemType`
// distinction. Carried over as-is; see the roadmap's open threads.
export const FILTER_BUILDER: FilterBuilderProp<Queue>[] = [
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
  {
    name: 'protocol',
    label: () => translate('Protocol'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.PROTOCOL,
  },
  {
    name: 'status',
    label: () => translate('Status'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.QUEUE_STATUS,
  },
];

const useQueue = () => {
  const { page, goToPage } = usePage('queue');
  const {
    pageSize,
    selectedFilterKey,
    sortKey,
    sortDirection,
    includeUnknownMovieItems,
  } = useQueueOptions();

  // Custom filters are still redux-backed; they convert in Phase C. Leaving
  // them out of the lookup silently drops the filter -- the key is stored, the
  // query is not filtered.
  const customFilters = useSelector(
    createCustomFiltersSelector('queue')
  ) as CustomFilter[];

  const filters = useMemo(() => {
    return findSelectedFilters(selectedFilterKey, FILTERS, customFilters);
  }, [selectedFilterKey, customFilters]);

  const { refetch, ...query } = usePagedApiQuery<Queue>({
    path: '/queue',
    page,
    pageSize,
    filters,
    sortKey,
    sortDirection,
    queryParams: { includeUnknownMovieItems },
    queryOptions: {
      placeholderData: keepPreviousData,
    },
  });

  return {
    ...query,
    goToPage,
    page,
    refetch,
  };
};

export default useQueue;

export const useGrabQueueItem = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<unknown, void>({
    path: `/queue/grab/${id}`,
    method: 'POST',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/queue'] });
      },
    },
  });

  return { grabQueueItem: mutate, isGrabbing: isPending, grabError: error };
};

export const useGrabQueueItems = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useApiMutation<unknown, BulkQueueData>({
    path: '/queue/grab/bulk',
    method: 'POST',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/queue'] });
      },
    },
  });

  return { grabQueueItems: mutate, isGrabbing: isPending };
};

// Eros picks the removal options in RemoveQueueItemModal each time rather than
// persisting them the way Sonarr does, so they ride on the mutation variables
// and the path is built per call.
export const useRemoveQueueItem = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useApiMutation<unknown, RemoveQueueItemData>({
    path: ({ id, ...removalOptions }) =>
      `/queue/${id}${getRemovalQueryString(removalOptions)}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/queue'] });
      },
    },
  });

  return { removeQueueItem: mutate, isRemoving: isPending };
};

export const useRemoveQueueItems = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useApiMutation<unknown, RemoveQueueItemsData>({
    path: ({ ids, ...removalOptions }) =>
      `/queue/bulk${getRemovalQueryString(removalOptions)}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/queue'] });
      },
    },
  });

  return { removeQueueItems: mutate, isRemoving: isPending };
};
