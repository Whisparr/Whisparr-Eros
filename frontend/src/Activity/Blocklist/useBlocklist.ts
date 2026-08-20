import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Filter, FilterBuilderProp } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import Blocklist from 'typings/Blocklist';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import translate from 'Utilities/String/translate';
import { useBlocklistOptions } from './blocklistOptionsStore';

interface BulkBlocklistData {
  ids: number[];
}

export const FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
];

// `movieIds` shares the MOVIE filter-builder value type with the queue, so it
// lists scenes and movies together; see the roadmap's open threads.
export const FILTER_BUILDER: FilterBuilderProp<Blocklist>[] = [
  {
    name: 'movieIds',
    label: () => translate('Movie'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.MOVIE,
  },
  {
    name: 'protocols',
    label: () => translate('Protocol'),
    type: filterBuilderTypes.EQUAL,
    valueType: filterBuilderValueTypes.PROTOCOL,
  },
];

const useBlocklist = () => {
  const { page, goToPage } = usePage('blocklist');
  const { pageSize, selectedFilterKey, sortKey, sortDirection } =
    useBlocklistOptions();

  const customFilters = useCustomFiltersList('blocklist');

  const filters = useMemo(() => {
    return findSelectedFilters(selectedFilterKey, FILTERS, customFilters);
  }, [selectedFilterKey, customFilters]);

  const query = usePagedApiQuery<Blocklist>({
    path: '/blocklist',
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

export default useBlocklist;

export const useRemoveBlocklistItem = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useApiMutation<unknown, void>({
    path: `/blocklist/${id}`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/blocklist'] });
      },
    },
  });

  return { removeBlocklistItem: mutate, isRemoving: isPending };
};

export const useRemoveBlocklistItems = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useApiMutation<unknown, BulkBlocklistData>({
    path: '/blocklist/bulk',
    method: 'DELETE',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/blocklist'] });
      },
    },
  });

  return { removeBlocklistItems: mutate, isRemoving: isPending };
};
