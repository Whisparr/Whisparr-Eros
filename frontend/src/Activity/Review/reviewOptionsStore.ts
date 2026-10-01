import {
  createOptionsStore,
  PageableOptions,
} from 'Helpers/Hooks/useOptionsStore';
import translate from 'Utilities/String/translate';

const { useOptions, useOption, setOptions, setOption, setSort } =
  createOptionsStore<PageableOptions>('review_options', () => {
    return {
      pageSize: 20,
      selectedFilterKey: 'all',
      sortKey: 'added',
      sortDirection: 'descending',
      columns: [
        {
          name: 'movieMetadata.sortTitle',
          label: () => translate('Scene'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'title',
          label: () => translate('ReleaseTitle'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'indexer',
          label: () => translate('Indexer'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'size',
          label: () => translate('Size'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'quality',
          label: () => translate('Quality'),
          isSortable: false,
          isVisible: true,
        },
        {
          name: 'match',
          label: () => translate('ReviewMatch'),
          isSortable: false,
          isVisible: true,
        },
        {
          name: 'publishDate',
          label: () => translate('Age'),
          isSortable: false,
          isVisible: false,
        },
        {
          name: 'added',
          label: () => translate('Added'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isSortable: false,
          isVisible: true,
          isModifiable: 'onlyPosition',
        },
      ],
    };
  });

export const useReviewOptions = useOptions;
export const useReviewOption = useOption;
export const setReviewOptions = setOptions;
export const setReviewOption = setOption;
export const setReviewSort = setSort;
