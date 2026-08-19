import { keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Filter } from 'Filters/Filter';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import { filterTypes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import translate from 'Utilities/String/translate';
import { useCutoffUnmetOptions } from './cutoffUnmetOptionsStore';

export const FILTERS: Filter[] = [
  {
    key: 'monitored',
    label: () => translate('Monitored'),
    filters: [
      {
        key: 'monitored',
        value: [true],
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'unmonitored',
    label: () => translate('Unmonitored'),
    filters: [
      {
        key: 'monitored',
        value: [false],
        type: filterTypes.EQUAL,
      },
    ],
  },
];

const useCutoffUnmet = () => {
  const { page, goToPage } = usePage('cutoffUnmet');
  const { pageSize, selectedFilterKey, sortKey, sortDirection } =
    useCutoffUnmetOptions();

  // Neither wanted page offers custom filters, so there is nothing to merge
  // into the two built-ins.
  const filters = useMemo(() => {
    return findSelectedFilters(selectedFilterKey, FILTERS, []);
  }, [selectedFilterKey]);

  const query = usePagedApiQuery<Movie>({
    path: '/wanted/cutoff',
    page,
    pageSize,
    filters,
    sortKey,
    sortDirection,
    queryOptions: {
      placeholderData: keepPreviousData,
    },
  });

  return {
    ...query,
    goToPage,
    page,
    filters,
  };
};

export default useCutoffUnmet;
