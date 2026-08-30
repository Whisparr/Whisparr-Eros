import Column from 'Components/Table/Column';
import {
  createOptionsStore,
  OptionChanged,
} from 'Helpers/Hooks/useOptionsStore';
import { resetPage } from 'Helpers/Hooks/usePage';
import { sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface MovieIndexPosterOptions {
  detailedProgressBar: boolean;
  size: string;
  showTitle: boolean;
  showMonitored: boolean;
  showQualityProfile: boolean;
  showReleaseDate: boolean;
  showTmdbRating: boolean;
  showTags: boolean;
  showSearchAction: boolean;
  pageSize: number;
}

export interface MovieIndexOverviewOptions {
  detailedProgressBar: boolean;
  size: string;
  showMonitored: boolean;
  showStudio: boolean;
  showQualityProfile: boolean;
  showAdded: boolean;
  showPath: boolean;
  showSizeOnDisk: boolean;
  showTags: boolean;
  showSearchAction: boolean;
  pageSize: number;
}

export interface MovieIndexTableOptions {
  showSearchAction: boolean;
  pageSize: number;
}

export interface MovieIndexOptions {
  indexMode: string;
  view: string;
  sortKey: string;
  sortDirection: SortDirection;
  selectedFilterKey: string | number;
  columns: Column[];
  posterOptions: MovieIndexPosterOptions;
  overviewOptions: MovieIndexOverviewOptions;
  tableOptions: MovieIndexTableOptions;
}

const { useOptions, useOption, getOptions, setOptions, setOption, setSort } =
  createOptionsStore<MovieIndexOptions>('movie_index_options', () => {
    return {
      indexMode: 'movie',
      view: 'posters',
      sortKey: 'cleanTitle',
      sortDirection: sortDirections.ASCENDING,
      selectedFilterKey: 'all',

      posterOptions: {
        detailedProgressBar: false,
        size: 'large',
        showTitle: false,
        showMonitored: true,
        showQualityProfile: true,
        showReleaseDate: false,
        showTmdbRating: false,
        showTags: false,
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
        showTags: false,
        showSearchAction: false,
        pageSize: 20,
      },

      tableOptions: {
        showSearchAction: false,
        pageSize: 20,
      },

      columns: [
        {
          name: 'select',
          label: '',
          columnLabel: 'Select',
          isSortable: false,
          isVisible: true,
          isModifiable: false,
        },
        {
          name: 'status',
          label: '',
          columnLabel: () => translate('ReleaseStatus'),
          isSortable: false,
          isVisible: true,
          isModifiable: false,
        },
        {
          name: 'sortTitle',
          label: () => translate('MovieTitle'),
          isSortable: true,
          isVisible: true,
          isModifiable: false,
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
          name: 'releaseDate',
          label: () => translate('ReleaseDate'),
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
          name: 'releaseGroups',
          label: () => translate('ReleaseGroup'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'tags',
          label: () => translate('Tags'),
          isSortable: true,
          isVisible: false,
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
  useOptions as useMovieIndexOptions,
  useOption as useMovieIndexOption,
  getOptions as getMovieIndexOptions,
  setOptions as setMovieIndexOptions,
  setOption as setMovieIndexOption,
};

// Sorting, filtering and switching view all invalidate the current page number,
// exactly as the reducers they replace did -- page 3 of a poster view is not
// page 3 of a differently sorted or filtered list.
export const setMovieIndexSort = (sortKey: string) => {
  setSort({ sortKey });
  resetPage('movieIndex');
};

export const setMovieIndexFilter = (selectedFilterKey: string | number) => {
  setOption('selectedFilterKey', selectedFilterKey);
  resetPage('movieIndex');
};

export const setMovieIndexView = (view: string) => {
  setOption('view', view);
  resetPage('movieIndex');
};

// The poster and overview option modals send a partial set of their own keys,
// so those merge into the sub-object rather than replacing it.
export const setMovieIndexPosterOption = (
  payload: Partial<MovieIndexPosterOptions>
) => {
  setOption('posterOptions', { ...getOptions().posterOptions, ...payload });
};

export const setMovieIndexOverviewOption = (
  payload: Partial<MovieIndexOverviewOptions>
) => {
  setOption('overviewOptions', { ...getOptions().overviewOptions, ...payload });
};

// The table options modal sends `{ tableOptions }`; the column modal sends
// `{ columns }`. The redux reducer picked those same keys off one payload.
export const setMovieIndexTableOption = (
  payload: Partial<Pick<MovieIndexOptions, 'columns' | 'tableOptions'>>
) => {
  setOptions(payload);
};

export type MovieIndexOptionChanged = OptionChanged<MovieIndexOptions>;
