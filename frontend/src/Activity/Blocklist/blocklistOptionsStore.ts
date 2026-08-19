import {
  createOptionsStore,
  PageableOptions,
} from 'Helpers/Hooks/useOptionsStore';
import translate from 'Utilities/String/translate';

const { useOptions, useOption, setOptions, setOption, setSort } =
  createOptionsStore<PageableOptions>('blocklist_options', () => {
    return {
      pageSize: 20,
      selectedFilterKey: 'all',
      sortKey: 'date',
      sortDirection: 'descending',
      columns: [
        {
          name: 'movieMetadata.sortTitle',
          label: () => translate('MovieTitle'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'sourceTitle',
          label: () => translate('SourceTitle'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'languages',
          label: () => translate('Languages'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'quality',
          label: () => translate('Quality'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'customFormats',
          label: () => translate('Formats'),
          isSortable: false,
          isVisible: true,
        },
        {
          name: 'date',
          label: () => translate('Date'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'indexer',
          label: () => translate('Indexer'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isSortable: false,
          isVisible: true,
          isModifiable: false,
        },
      ],
    };
  });

export const useBlocklistOptions = useOptions;
export const useBlocklistOption = useOption;
export const setBlocklistOptions = setOptions;
export const setBlocklistOption = setOption;
export const setBlocklistSort = setSort;
