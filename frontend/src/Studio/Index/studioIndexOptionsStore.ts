import Column from 'Components/Table/Column';
import {
  createOptionsStore,
  OptionChanged,
} from 'Helpers/Hooks/useOptionsStore';
import { resetPage } from 'Helpers/Hooks/usePage';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface StudioIndexPosterOptions {
  detailedProgressBar: boolean;
  size: string;
  showTitle: boolean;
  pageSize: number;
}

export interface StudioIndexTableOptions {
  pageSize: number;
}

export interface StudioIndexOptions {
  view: string;
  sortKey: string;
  sortDirection: SortDirection;
  selectedFilterKey: string | number;
  columns: Column[];
  posterOptions: StudioIndexPosterOptions;
  tableOptions: StudioIndexTableOptions;
}

const { useOptions, useOption, getOptions, setOptions, setOption, setSort } =
  createOptionsStore<StudioIndexOptions>('studio_index_options', () => {
    return {
      view: 'posters',
      sortKey: 'sortTitle',
      sortDirection: sortDirections.ASCENDING,
      selectedFilterKey: 'all',

      posterOptions: {
        detailedProgressBar: false,
        size: 'large',
        showTitle: true,
        pageSize: 25,
      },

      tableOptions: {
        pageSize: 25,
      },

      columns: [
        {
          name: 'status',
          label: '',
          columnLabel: () => translate('Monitored'),
          isSortable: true,
          isVisible: true,
          isModifiable: false,
        },
        {
          name: 'sortTitle',
          label: () => translate('StudioTitle'),
          isSortable: true,
          isVisible: true,
          isModifiable: false,
        },
        {
          name: 'network',
          label: () => translate('Network'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'qualityProfileId',
          label: () => translate('QualityProfile'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'rootFolderPath',
          label: () => translate('RootFolderPath'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'aliases',
          label: () => translate('Aliases'),
          isSortable: false,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'tags',
          label: () => translate('Tags'),
          isSortable: false,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'totalMovieCount',
          label: () => translate('Movies'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'totalSceneCount',
          label: () => translate('Scenes'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'sizeOnDisk',
          label: () => translate('SizeOnDisk'),
          isSortable: true,
          isVisible: true,
          isModifiable: true,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isVisible: true,
          isModifiable: false,
        },
      ],
    };
  });

export {
  useOptions as useStudioIndexOptions,
  useOption as useStudioIndexOption,
  getOptions as getStudioIndexOptions,
  setOptions as setStudioIndexOptions,
  setOption as setStudioIndexOption,
};

// Sorting, filtering and switching view all invalidate the current page number,
// exactly as the reducers they replace did.
export const setStudioIndexSort = (sortKey: string) => {
  setSort({ sortKey });
  resetPage('studioIndex');
};

export const setStudioIndexFilter = (selectedFilterKey: string | number) => {
  setOption('selectedFilterKey', selectedFilterKey);
  resetPage('studioIndex');
};

export const setStudioIndexView = (view: string) => {
  setOption('view', view);
  resetPage('studioIndex');
};

// The poster options modal sends a partial set of its own keys, so those merge
// into the sub-object rather than replacing it.
export const setStudioIndexPosterOption = (
  payload: Partial<StudioIndexPosterOptions>
) => {
  setOption('posterOptions', { ...getOptions().posterOptions, ...payload });
};

// The table options modal sends `{ tableOptions }`; the column modal sends
// `{ columns }`. The redux reducer picked those same keys off one payload.
export const setStudioIndexTableOption = (
  payload: Partial<Pick<StudioIndexOptions, 'columns' | 'tableOptions'>>
) => {
  setOptions(payload);
};

export type StudioIndexOptionChanged = OptionChanged<StudioIndexOptions>;
