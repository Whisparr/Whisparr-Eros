import Column from 'Components/Table/Column';
import {
  createOptionsStore,
  OptionChanged,
} from 'Helpers/Hooks/useOptionsStore';
import { resetPage } from 'Helpers/Hooks/usePage';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface SceneIndexPosterOptions {
  detailedProgressBar: boolean;
  size: string;
  showTitle: boolean;
  showMonitored: boolean;
  showQualityProfile: boolean;
  showReleaseDate: boolean;
  showSearchAction: boolean;
  pageSize: number;
}

export interface SceneIndexOverviewOptions {
  detailedProgressBar: boolean;
  size: string;
  showMonitored: boolean;
  showStudio: boolean;
  showQualityProfile: boolean;
  showAdded: boolean;
  showPath: boolean;
  showSizeOnDisk: boolean;
  showSearchAction: boolean;
  pageSize: number;
}

export interface SceneIndexTableOptions {
  showSearchAction: boolean;
  pageSize: number;
}

export interface SceneIndexOptions {
  indexMode: string;
  view: string;
  sortKey: string;
  sortDirection: SortDirection;
  selectedFilterKey: string | number;
  columns: Column[];
  posterOptions: SceneIndexPosterOptions;
  overviewOptions: SceneIndexOverviewOptions;
  tableOptions: SceneIndexTableOptions;
}

const { useOptions, useOption, getOptions, setOptions, setOption, setSort } =
  createOptionsStore<SceneIndexOptions>('scene_index_options', () => {
    return {
      indexMode: 'scene',
      view: 'posters',
      sortKey: 'sortTitle',
      sortDirection: sortDirections.ASCENDING,
      selectedFilterKey: 'all',

      posterOptions: {
        detailedProgressBar: false,
        size: 'large',
        showTitle: false,
        showMonitored: true,
        showQualityProfile: true,
        showReleaseDate: false,
        showSearchAction: false,
        pageSize: 25,
      },

      overviewOptions: {
        detailedProgressBar: false,
        size: 'medium',
        showMonitored: true,
        showStudio: true,
        showQualityProfile: true,
        showAdded: false,
        showPath: false,
        showSizeOnDisk: false,
        showSearchAction: false,
        pageSize: 25,
      },

      tableOptions: {
        showSearchAction: false,
        pageSize: 25,
      },

      columns: [
        {
          name: 'select',
          label: '',
          columnLabel: 'Select',
          isSortable: false,
          isVisible: true,
          isModifiable: 'disabled',
          isHidden: true,
        },
        {
          name: 'status',
          label: '',
          columnLabel: () => translate('ReleaseStatus'),
          isSortable: true,
          isVisible: true,
          isModifiable: 'disabled',
        },
        {
          name: 'sortTitle',
          label: () => translate('SceneTitle'),
          isSortable: true,
          isVisible: true,
          isModifiable: 'disabled',
        },
        {
          name: 'studioTitle',
          label: () => translate('Studio'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'qualityProfileId',
          label: () => translate('QualityProfile'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'added',
          label: () => translate('Added'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'year',
          label: () => translate('Year'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'releaseDate',
          label: () => translate('ReleaseDate'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'runtime',
          label: () => translate('Runtime'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'path',
          label: () => translate('Path'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'sizeOnDisk',
          label: () => translate('SizeOnDisk'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'genres',
          label: () => translate('Genres'),
          isSortable: false,
          isVisible: false,
        },
        {
          name: 'movieStatus',
          label: () => translate('Status'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'tags',
          label: () => translate('Tags'),
          isSortable: false,
          isVisible: false,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isVisible: true,
          isModifiable: 'disabled',
        },
      ],
    };
  });

export {
  useOptions as useSceneIndexOptions,
  useOption as useSceneIndexOption,
  getOptions as getSceneIndexOptions,
  setOptions as setSceneIndexOptions,
  setOption as setSceneIndexOption,
};

// Sorting, filtering and switching view all invalidate the current page number,
// exactly as the reducers they replace did.
export const setSceneIndexSort = (sortKey: string) => {
  setSort({ sortKey });
  resetPage('sceneIndex');
};

export const setSceneIndexFilter = (selectedFilterKey: string | number) => {
  setOption('selectedFilterKey', selectedFilterKey);
  resetPage('sceneIndex');
};

export const setSceneIndexView = (view: string) => {
  setOption('view', view);
  resetPage('sceneIndex');
};

// The poster and overview option modals send a partial set of their own keys,
// so those merge into the sub-object rather than replacing it.
export const setSceneIndexPosterOption = (
  payload: Partial<SceneIndexPosterOptions>
) => {
  setOption('posterOptions', { ...getOptions().posterOptions, ...payload });
};

export const setSceneIndexOverviewOption = (
  payload: Partial<SceneIndexOverviewOptions>
) => {
  setOption('overviewOptions', { ...getOptions().overviewOptions, ...payload });
};

// The table options modal sends `{ tableOptions }`; the column modal sends
// `{ columns }`. The redux reducer picked those same keys off one payload.
export const setSceneIndexTableOption = (
  payload: Partial<Pick<SceneIndexOptions, 'columns' | 'tableOptions'>>
) => {
  setOptions(payload);
};

export type SceneIndexOptionChanged = OptionChanged<SceneIndexOptions>;
