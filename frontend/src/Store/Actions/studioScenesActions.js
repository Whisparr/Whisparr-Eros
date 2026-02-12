import { createAction } from 'redux-actions';
import { sortDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';

//
// Variables

export const section = 'studioScenes';

//
// State

export const defaultState = {
  sortKey: 'releaseDate',
  sortDirection: sortDirections.DESCENDING,
  secondarySortKey: 'title',
  secondarySortDirection: sortDirections.ASCENDING,

  columns: [
    {
      name: 'monitored',
      columnLabel: () => translate('Monitored'),
      isVisible: true,
      isModifiable: false
    },
    {
      name: 'title',
      label: () => translate('Title'),
      isVisible: true,
      isSortable: true
    },
    {
      name: 'credits',
      label: 'Performers',
      isVisible: true
    },
    {
      name: 'path',
      label: () => translate('Path'),
      isVisible: false,
      isSortable: true
    },
    {
      name: 'releaseDate',
      label: () => translate('ReleaseDate'),
      isVisible: true,
      isSortable: true
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      isVisible: false,
      isSortable: true
    },
    {
      name: 'audioInfo',
      label: () => translate('AudioInfo'),
      isVisible: false
    },
    {
      name: 'videoCodec',
      label: () => translate('VideoCodec'),
      isVisible: false
    },
    {
      name: 'videoDynamicRangeType',
      label: () => translate('VideoDynamicRange'),
      isVisible: false
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('Size'),
      isVisible: false,
      isSortable: true
    },
    {
      name: 'releaseGroup',
      label: () => translate('ReleaseGroup'),
      isVisible: false
    },
    {
      name: 'status',
      label: () => translate('Status'),
      isVisible: true
    },
    {
      name: 'actions',
      columnLabel: () => translate('Actions'),
      isVisible: true,
      isModifiable: false
    }
  ],

  sortPredicates: {
    gender: function(item) {
      const gender = item.gender;

      return gender ? gender.toLowerCase() : '';
    }
  },

  expandedState: {}
};

export const persistState = [
  'studioScenes.sortKey',
  'studioScenes.sortDirection',
  'studioScenes.columns',
  'studioScenes.tableOptions',
  'studioScenes.expandedState'
];

//
// Actions Types

export const SET_STUDIO_SCENES_SORT = 'studioScenes/setStudioScenesSort';
export const SET_STUDIO_SCENES_TABLE_OPTION = 'studioScenes/setStudioScenesTableOption';
export const SET_STUDIO_SCENES_EXPANDED = 'studioScenes/setStudioScenesExpanded';
export const TOGGLE_STUDIO_SCENES_EXPANDED = 'studioScenes/toggleStudioScenesExpanded';

//
// Action Creators

export const setStudioScenesSort = createAction(SET_STUDIO_SCENES_SORT);
export const setStudioScenesTableOption = createAction(SET_STUDIO_SCENES_TABLE_OPTION);
export const setStudioScenesExpanded = createAction(SET_STUDIO_SCENES_EXPANDED);
export const toggleStudioScenesExpanded = createAction(TOGGLE_STUDIO_SCENES_EXPANDED);

//
// Reducers

export const reducers = createHandleActions({

  [SET_STUDIO_SCENES_SORT]: createSetClientSideCollectionSortReducer(section),

  [SET_STUDIO_SCENES_TABLE_OPTION]: createSetTableOptionReducer(section),

  [SET_STUDIO_SCENES_EXPANDED]: function(state, { payload }) {
    return {
      ...state,
      expandedState: payload
    };
  },

  [TOGGLE_STUDIO_SCENES_EXPANDED]: function(state, { payload }) {
    const { year } = payload;
    return {
      ...state,
      expandedState: {
        ...state.expandedState,
        [year]: !state.expandedState[year]
      }
    };
  }

}, defaultState, section);
