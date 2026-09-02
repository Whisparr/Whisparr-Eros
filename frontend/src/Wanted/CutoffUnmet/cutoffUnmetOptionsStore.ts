import {
  createOptionsStore,
  PageableOptions,
} from 'Helpers/Hooks/useOptionsStore';
import translate from 'Utilities/String/translate';

const { useOptions, useOption, setOptions, setOption, setSort } =
  createOptionsStore<PageableOptions>('cutoff_unmet_options', () => {
    return {
      pageSize: 20,
      selectedFilterKey: 'monitored',
      sortKey: 'movieMetadata.sortTitle',
      sortDirection: 'ascending',
      columns: [
        {
          name: 'movieMetadata.sortTitle',
          label: () => translate('MovieTitle'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'movieMetadata.year',
          label: () => translate('Year'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'movieMetadata.releaseDate',
          label: () => translate('ReleaseDate'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'movies.lastSearchTime',
          label: () => translate('LastSearched'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'status',
          label: () => translate('Status'),
          isVisible: true,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isVisible: true,
          isModifiable: 'onlyPosition',
        },
      ],
    };
  });

export const useCutoffUnmetOptions = useOptions;
export const useCutoffUnmetOption = useOption;
export const setCutoffUnmetOptions = setOptions;
export const setCutoffUnmetOption = setOption;
export const setCutoffUnmetSort = setSort;
