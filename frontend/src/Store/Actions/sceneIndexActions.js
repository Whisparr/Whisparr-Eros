import { createAction } from 'redux-actions';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  sortDirections,
} from 'Helpers/Props';
import { MOVIE_INDEX_FILTERS } from 'Movie/Index/movieIndexFilters';
import translate from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';
import { filterPredicates, sortPredicates } from './movieActions';

//
// Variables

export const section = 'sceneIndex';

//
// State

export const defaultState = {
  isSaving: false,
  saveError: null,
  isDeleting: false,
  deleteError: null,
  indexMode: 'scene',
  page: 1,
  sortKey: 'sortTitle',
  sortDirection: sortDirections.ASCENDING,
  secondarySortKey: 'sortTitle',
  secondarySortDirection: sortDirections.ASCENDING,
  view: 'posters',

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
    pageSize: 25,
    showSearchAction: false,
  },

  columns: [
    {
      name: 'select',
      columnLabel: 'Select',
      isSortable: false,
      isVisible: true,
      isModifiable: false,
      isHidden: true,
    },
    {
      name: 'status',
      columnLabel: () => translate('ReleaseStatus'),
      isSortable: true,
      isVisible: true,
      isModifiable: false,
    },
    {
      name: 'sortTitle',
      label: () => translate('SceneTitle'),
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
      columnLabel: () => translate('Actions'),
      isVisible: true,
      isModifiable: false,
    },
  ],

  sortPredicates: {
    ...sortPredicates,

    studio: function (item) {
      const studio = item.studioTitle;

      return studio ? studio.toLowerCase() : '';
    },
  },

  selectedFilterKey: 'all',

  filters: MOVIE_INDEX_FILTERS,
  filterPredicates,

  filterBuilderProps: [
    {
      name: 'monitored',
      label: () => translate('Monitored'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL,
    },
    {
      name: 'isAvailable',
      label: () => translate('ConsideredAvailable'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL,
    },
    {
      name: 'title',
      label: () => translate('Title'),
      type: filterBuilderTypes.STRING,
    },
    {
      name: 'genres',
      label: () => translate('Genres'),
      type: filterBuilderTypes.STRING,
    },
    {
      name: 'status',
      label: () => translate('ReleaseStatus'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.RELEASE_STATUS,
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.QUALITY_PROFILE,
    },
    {
      name: 'added',
      label: () => translate('Added'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE,
    },
    {
      name: 'year',
      label: () => translate('Year'),
      type: filterBuilderTypes.NUMBER,
    },
    {
      name: 'releaseDate',
      label: () => translate('ReleaseDate'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE,
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      type: filterBuilderTypes.NUMBER,
    },
    {
      name: 'path',
      label: () => translate('Path'),
      type: filterBuilderTypes.STRING,
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('SizeOnDisk'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.BYTES,
    },
    {
      name: 'tags',
      label: () => translate('Tags'),
      type: filterBuilderTypes.ARRAY,
      valueType: filterBuilderValueTypes.TAG,
    },
  ],
};

export const persistState = [
  'sceneIndex.sortKey',
  'sceneIndex.sortDirection',
  'sceneIndex.selectedFilterKey',
  'sceneIndex.view',
  'sceneIndex.columns',
  'sceneIndex.posterOptions',
  'sceneIndex.overviewOptions',
  'sceneIndex.tableOptions',
];

//
// Actions Types

export const SET_SCENE_PAGE = 'sceneIndex/setScenePage';
export const SET_MOVIE_SORT = 'sceneIndex/setSceneSort';
export const SET_MOVIE_FILTER = 'sceneIndex/setSceneFilter';
export const SET_MOVIE_VIEW = 'sceneIndex/setSceneView';
export const SET_MOVIE_TABLE_OPTION = 'sceneIndex/setSceneTableOption';
export const SET_MOVIE_POSTER_OPTION = 'sceneIndex/setScenePosterOption';
export const SET_MOVIE_OVERVIEW_OPTION = 'sceneIndex/setSceneOverviewOption';
export const SET_MOVIE_INDEX_MODE = 'sceneIndex/setSceneIndexMode';

//
// Action Creators

export const setScenePage = createAction(SET_SCENE_PAGE);
export const setSceneSort = createAction(SET_MOVIE_SORT);
export const setSceneFilter = createAction(SET_MOVIE_FILTER);
export const setSceneView = createAction(SET_MOVIE_VIEW);
export const setSceneTableOption = createAction(SET_MOVIE_TABLE_OPTION);
export const setScenePosterOption = createAction(SET_MOVIE_POSTER_OPTION);
export const setSceneOverviewOption = createAction(SET_MOVIE_OVERVIEW_OPTION);
export const setSceneIndexMode = createAction(SET_MOVIE_INDEX_MODE);

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_SCENE_PAGE]: function (state, { payload }) {
      return Object.assign({}, state, { page: payload });
    },

    [SET_MOVIE_SORT]: function (state, { payload }) {
      const { sortKey } = payload;
      const newDirection =
        state.sortKey === sortKey && state.sortDirection === 'ascending'
          ? 'descending'
          : 'ascending';
      return Object.assign({}, state, {
        sortKey,
        sortDirection: newDirection,
        page: 1,
      });
    },

    [SET_MOVIE_FILTER]: function (state, { payload }) {
      return Object.assign({}, state, {
        selectedFilterKey: payload.selectedFilterKey,
        page: 1,
      });
    },

    [SET_MOVIE_VIEW]: function (state, { payload }) {
      return Object.assign({}, state, { view: payload.view, page: 1 });
    },

    [SET_MOVIE_TABLE_OPTION]: createSetTableOptionReducer(section),

    [SET_MOVIE_POSTER_OPTION]: function (state, { payload }) {
      const posterOptions = state.posterOptions;

      return {
        ...state,
        posterOptions: {
          ...posterOptions,
          ...payload,
        },
      };
    },

    [SET_MOVIE_OVERVIEW_OPTION]: function (state, { payload }) {
      const overviewOptions = state.overviewOptions;

      return {
        ...state,
        overviewOptions: {
          ...overviewOptions,
          ...payload,
        },
      };
    },

    [SET_MOVIE_INDEX_MODE]: function (state, { payload }) {
      return Object.assign({}, state, { indexMode: payload.indexMode });
    },
  },
  defaultState,
  section
);
