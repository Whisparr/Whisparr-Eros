import _ from 'lodash';
import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { set, updateItem } from './baseActions';
import createFetchHandler from './Creators/createFetchHandler';
import createHandleActions from './Creators/createHandleActions';
import createRemoveItemHandler from './Creators/createRemoveItemHandler';
import createSaveProviderHandler from './Creators/createSaveProviderHandler';
import createSetSettingValueReducer from './Creators/Reducers/createSetSettingValueReducer';

//
// Variables

export const section = 'performers';

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  items: [],
  isSaving: false,
  saveError: null,
  pendingChanges: {},

  deleteOptions: {
    addImportExclusion: false,
  },

  defaults: {
    rootFolderPath: '',
    monitored: true,
    qualityProfileId: 0,
    searchForMovie: true,
    tags: [],
  },
};

export const persistState = ['performers.defaults'];

//
// Actions Types

export const FETCH_PERFORMERS = 'performers/fetchPerformers';
export const SAVE_PERFORMER = 'performers/savePerformer';
export const SAVE_PERFORMER_EDITOR = 'performers/savePerformerEditor';
export const SET_PERFORMER_VALUE = 'performers/setPerformerValue';

export const DELETE_PERFORMER = 'performers/deletePerformer';
export const SET_DELETE_OPTION = 'performers/setDeleteOption';

export const TOGGLE_PERFORMER_MONITORED = 'performers/togglePerformerMonitored';

//
// Action Creators

export const fetchPerformers = createThunk(FETCH_PERFORMERS);
export const savePerformer = createThunk(SAVE_PERFORMER);
export const savePerformerEditor = createThunk(SAVE_PERFORMER_EDITOR);

export const deletePerformer = createThunk(DELETE_PERFORMER, (payload) => {
  return {
    ...payload,
    queryParams: {
      deleteFiles: payload.deleteFiles,
      addImportExclusion: payload.addImportExclusion,
    },
  };
});

export const setDeleteOption = createAction(SET_DELETE_OPTION);

export const togglePerformerMonitored = createThunk(TOGGLE_PERFORMER_MONITORED);

export const setPerformerValue = createAction(
  SET_PERFORMER_VALUE,
  (payload) => {
    return {
      section,
      ...payload,
    };
  }
);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [FETCH_PERFORMERS]: createFetchHandler(section, '/performer'),
  [SAVE_PERFORMER]: createSaveProviderHandler(section, '/performer'),
  [DELETE_PERFORMER]: createRemoveItemHandler(section, '/performer'),

  [TOGGLE_PERFORMER_MONITORED]: (getState, payload, dispatch) => {
    const { performerId: id, monitored, moviesMonitored } = payload;

    const performer = _.find(getState().performers.items, { id });

    dispatch(
      updateItem({
        id,
        section,
        isSaving: true,
      })
    );

    const promise = createAjaxRequest({
      url: `/performer/${id}`,
      method: 'PUT',
      data: JSON.stringify({
        ...performer,
        monitored,
        moviesMonitored,
      }),
      dataType: 'json',
    }).request;

    promise.done((data) => {
      dispatch(
        updateItem({
          id,
          section,
          isSaving: false,
          monitored,
          moviesMonitored,
          saveError: null,
        })
      );
    });

    promise.fail((xhr) => {
      dispatch(
        updateItem({
          id,
          section,
          isSaving: false,
          saveError: xhr,
        })
      );
    });
  },

  [SAVE_PERFORMER_EDITOR]: function (getState, payload, dispatch) {
    dispatch(
      set({
        section,
        isSaving: true,
      })
    );

    const promise = createAjaxRequest({
      url: '/performer/editor',
      method: 'PUT',
      data: JSON.stringify(payload),
      dataType: 'json',
    }).request;

    promise.done((data) => {
      dispatch(
        batchActions([
          ...data.map((performer) => {
            return updateItem({
              id: performer.id,
              section: 'performers',
              ...performer,
            });
          }),

          set({
            section,
            isSaving: false,
            saveError: null,
          }),
        ])
      );
    });

    promise.fail((xhr) => {
      dispatch(
        set({
          section,
          isSaving: false,
          saveError: xhr,
        })
      );
    });
  },
});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_PERFORMER_VALUE]: createSetSettingValueReducer(section),
    [SET_DELETE_OPTION]: (state, { payload }) => {
      return {
        ...state,
        deleteOptions: {
          ...payload,
        },
      };
    },
  },
  defaultState,
  section
);
