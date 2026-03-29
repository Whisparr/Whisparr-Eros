import { createAction } from 'redux-actions';
import { sortDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';

//
// Variables

export const section = 'performerScenes';

//
// State

export const defaultState = {
  sortKey: 'releaseDate',
  sortDirection: sortDirections.DESCENDING,
  secondarySortKey: 'title',
  secondarySortDirection: sortDirections.ASCENDING,
  view: 'table',

  posterOptions: {
    size: 'large',
  },

  columns: [
    {
      name: 'monitored',
      columnLabel: () => translate('Monitored'),
      isVisible: true,
      isModifiable: false,
    },
    {
      name: 'title',
      label: () => translate('Title'),
      isVisible: true,
      isSortable: true,
    },
    {
      name: 'credits',
      label: 'Performers',
      isVisible: true,
    },
    {
      name: 'path',
      label: () => translate('Path'),
      isVisible: false,
      isSortable: true,
    },
    {
      name: 'releaseDate',
      label: () => translate('ReleaseDate'),
      isVisible: true,
      isSortable: true,
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      isVisible: false,
      isSortable: true,
    },
    {
      name: 'studioTitle',
      label: () => translate('Studio'),
      isVisible: true,
      isSortable: true,
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('Size'),
      isVisible: false,
      isSortable: true,
    },
    {
      name: 'status',
      label: () => translate('Status'),
      isVisible: true,
    },
    {
      name: 'actions',
      columnLabel: () => translate('Actions'),
      isVisible: true,
      isModifiable: false,
    },
  ],

  sortPredicates: {
    gender: function (item) {
      const gender = item.gender;
      return gender ? gender.toLowerCase() : '';
    },
    status: function (item) {
      console.log('Sorting status:', item.status);
      return item.status ? item.status.toLowerCase() : '';
    },
  },
};

export const persistState = [
  'performerScenes.sortKey',
  'performerScenes.sortDirection',
  'performerScenes.columns',
  'performerScenes.tableOptions',
  'performerScenes.view',
  'performerScenes.posterOptions',
];

//
// Actions Types

export const SET_PERFORMER_SCENES_SORT =
  'performerScenes/setPerformerScenesSort';
export const SET_PERFORMER_SCENES_TABLE_OPTION =
  'performerScenes/setPerformerScenesTableOption';
export const SET_PERFORMER_SCENES_VIEW =
  'performerScenes/setPerformerScenesView';
export const SET_PERFORMER_SCENES_POSTER_OPTION =
  'performerScenes/setPerformerScenesPosterOption';

//
// Action Creators

export const setPerformerScenesSort = createAction(SET_PERFORMER_SCENES_SORT);
export const setPerformerScenesTableOption = createAction(
  SET_PERFORMER_SCENES_TABLE_OPTION
);
export const setPerformerScenesView = createAction(SET_PERFORMER_SCENES_VIEW);
export const setPerformerScenesPosterOption = createAction(
  SET_PERFORMER_SCENES_POSTER_OPTION
);

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_PERFORMER_SCENES_SORT]:
      createSetClientSideCollectionSortReducer(section),

    [SET_PERFORMER_SCENES_TABLE_OPTION]: createSetTableOptionReducer(section),

    [SET_PERFORMER_SCENES_VIEW]: function (state, { payload }) {
      return { ...state, view: payload.view };
    },

    [SET_PERFORMER_SCENES_POSTER_OPTION]: function (state, { payload }) {
      return {
        ...state,
        posterOptions: {
          ...state.posterOptions,
          ...payload,
        },
      };
    },
  },
  defaultState,
  section
);
