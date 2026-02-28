import { createAction } from 'redux-actions';
import { filterBuilderTypes, filterBuilderValueTypes, sortDirections } from 'Helpers/Props';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';
import { filters } from './movieActions';

//
// Variables

export const section = 'movieIndex';

//
// State

export const defaultState = {
  isSaving: false,
  saveError: null,
  isDeleting: false,
  deleteError: null,
  indexMode: 'movie',
  page: 1,
  sortKey: 'cleanTitle',
  sortDirection: sortDirections.ASCENDING,
  view: 'posters',

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
    pageSize: 25
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
    pageSize: 20
  },

  tableOptions: {
    showSearchAction: false,
    pageSize: 20
  },

  columns: [
    {
      name: 'select',
      columnLabel: 'Select',
      isSortable: false,
      isVisible: true,
      isModifiable: false,
      isHidden: true
    },
    {
      name: 'status',
      columnLabel: () => translate('ReleaseStatus'),
      isSortable: false,
      isVisible: true,
      isModifiable: false
    },
    {
      name: 'sortTitle',
      label: () => translate('MovieTitle'),
      isSortable: true,
      isVisible: true,
      isModifiable: false
    },
    {
      name: 'studioTitle',
      label: () => translate('Studio'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'added',
      label: () => translate('Added'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'releaseDate',
      label: () => translate('ReleaseDate'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'year',
      label: () => translate('Year'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'path',
      label: () => translate('Path'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('SizeOnDisk'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'genres',
      label: () => translate('Genres'),
      isSortable: false,
      isVisible: false
    },
    {
      name: 'movieStatus',
      label: () => translate('Status'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'releaseGroups',
      label: () => translate('ReleaseGroup'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'tags',
      label: () => translate('Tags'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'actions',
      columnLabel: () => translate('Actions'),
      isVisible: true,
      isModifiable: false
    }
  ],

  selectedFilterKey: 'all',

  filters,

  filterBuilderProps: [
    {
      name: 'monitored',
      label: () => translate('Monitored'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL
    },
    {
      name: 'isAvailable',
      label: () => translate('ConsideredAvailable'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL
    },
    {
      name: 'title',
      label: () => translate('Title'),
      type: filterBuilderTypes.STRING
    },
    {
      name: 'releaseGroups',
      label: () => translate('ReleaseGroups'),
      type: filterBuilderTypes.ARRAY,
      optionsSelector: function(items) {
        const groupList = items.reduce((acc, movie) => {
          const { statistics = {} } = movie;
          const { releaseGroups = [] } = statistics;

          releaseGroups.forEach((releaseGroup) => {
            acc.push({
              id: releaseGroup,
              name: releaseGroup
            });
          });

          return acc;
        }, []);

        return groupList.sort(sortByProp('name'));
      }
    },
    {
      name: 'status',
      label: () => translate('ReleaseStatus'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.RELEASE_STATUS
    },
    {
      name: 'studio',
      label: () => translate('Studio'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: function(items) {
        const tagList = items.reduce((acc, movie) => {
          if (movie.studioTitle) {
            acc.push({
              id: movie.studioTitle,
              name: movie.studioTitle
            });
          }

          return acc;
        }, []);

        return tagList.sort(sortByProp('name'));
      }
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.QUALITY_PROFILE
    },
    {
      name: 'added',
      label: () => translate('Added'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE
    },
    {
      name: 'year',
      label: () => translate('Year'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'releaseDate',
      label: () => translate('ReleaseDate'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'path',
      label: () => translate('Path'),
      type: filterBuilderTypes.STRING
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('SizeOnDisk'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.BYTES
    },
    {
      name: 'genres',
      label: () => translate('Genres'),
      type: filterBuilderTypes.ARRAY,
      optionsSelector: function(items) {
        const genreList = items.reduce((acc, movie) => {
          movie.genres.forEach((genre) => {
            acc.push({
              id: genre,
              name: genre
            });
          });

          return acc;
        }, []);

        return genreList.sort(sortByProp('name'));
      }
    },
    {
      name: 'tags',
      label: () => translate('Tags'),
      type: filterBuilderTypes.ARRAY,
      valueType: filterBuilderValueTypes.TAG
    }
  ]
};

export const persistState = [
  'movieIndex.sortKey',
  'movieIndex.sortDirection',
  'movieIndex.selectedFilterKey',
  'movieIndex.customFilters',
  'movieIndex.view',
  'movieIndex.columns',
  'movieIndex.posterOptions',
  'movieIndex.overviewOptions',
  'movieIndex.tableOptions'
];

//
// Actions Types

export const SET_MOVIE_PAGE = 'movieIndex/setMoviePage';
export const SET_MOVIE_SORT = 'movieIndex/setMovieSort';
export const SET_MOVIE_FILTER = 'movieIndex/setMovieFilter';
export const SET_MOVIE_VIEW = 'movieIndex/setMovieView';
export const SET_MOVIE_TABLE_OPTION = 'movieIndex/setMovieTableOption';
export const SET_MOVIE_POSTER_OPTION = 'movieIndex/setMoviePosterOption';
export const SET_MOVIE_OVERVIEW_OPTION = 'movieIndex/setMovieOverviewOption';
export const SET_MOVIE_INDEX_MODE = 'movieIndex/setMovieIndexMode';

//
// Action Creators

export const setMoviePage = createAction(SET_MOVIE_PAGE);
export const setMovieSort = createAction(SET_MOVIE_SORT);
export const setMovieFilter = createAction(SET_MOVIE_FILTER);
export const setMovieView = createAction(SET_MOVIE_VIEW);
export const setMovieTableOption = createAction(SET_MOVIE_TABLE_OPTION);
export const setMoviePosterOption = createAction(SET_MOVIE_POSTER_OPTION);
export const setMovieOverviewOption = createAction(SET_MOVIE_OVERVIEW_OPTION);
export const setMovieIndexMode = createAction(SET_MOVIE_INDEX_MODE);

//
// Reducers

export const reducers = createHandleActions({

  [SET_MOVIE_PAGE]: function(state, { payload }) {
    return Object.assign({}, state, { page: payload });
  },

  [SET_MOVIE_SORT]: function(state, { payload }) {
    const { sortKey } = payload;
    const isSameKey = sortKey === state.sortKey;
    let newDirection = sortDirections.ASCENDING;
    if (isSameKey && state.sortDirection === sortDirections.ASCENDING) {
      newDirection = sortDirections.DESCENDING;
    }

    return Object.assign({}, state, { sortKey, sortDirection: newDirection, page: 1 });
  },

  [SET_MOVIE_FILTER]: function(state, { payload }) {
    return Object.assign({}, state, { selectedFilterKey: payload.selectedFilterKey, page: 1 });
  },

  [SET_MOVIE_VIEW]: function(state, { payload }) {
    return Object.assign({}, state, { view: payload.view, page: 1 });
  },

  [SET_MOVIE_TABLE_OPTION]: createSetTableOptionReducer(section),

  [SET_MOVIE_POSTER_OPTION]: function(state, { payload }) {
    const posterOptions = state.posterOptions;

    return {
      ...state,
      posterOptions: {
        ...posterOptions,
        ...payload
      }
    };
  },

  [SET_MOVIE_OVERVIEW_OPTION]: function(state, { payload }) {
    const overviewOptions = state.overviewOptions;

    return {
      ...state,
      overviewOptions: {
        ...overviewOptions,
        ...payload
      }
    };
  },

  [SET_MOVIE_INDEX_MODE]: function(state, { payload }) {
    return Object.assign({}, state, { indexMode: payload.indexMode });
  }

}, defaultState, section);
