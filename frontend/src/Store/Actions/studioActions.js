import _ from 'lodash';
import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { set, updateItem } from './baseActions';
import createHandleActions from './Creators/createHandleActions';
import createRemoveItemHandler from './Creators/createRemoveItemHandler';
import createSaveProviderHandler from './Creators/createSaveProviderHandler';
import createSetSettingValueReducer from './Creators/Reducers/createSetSettingValueReducer';

//
// Variables

export const section = 'studios';

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

export const persistState = ['studios.defaults'];

//
// Actions Types

export const SAVE_STUDIO = 'studios/saveStudio';
export const DELETE_STUDIO = 'studios/deleteStudio';
export const SAVE_STUDIO_EDITOR = 'studios/saveStudioEditor';
export const SET_STUDIO_VALUE = 'studios/setStudioValue';

export const SET_DELETE_OPTION = 'studios/setDeleteOption';

export const TOGGLE_STUDIO_MONITORED = 'studios/toggleStudioMonitored';

//
// Action Creators

export const saveStudio = createThunk(SAVE_STUDIO);
export const saveStudioEditor = createThunk(SAVE_STUDIO_EDITOR);

export const toggleStudioMonitored = createThunk(TOGGLE_STUDIO_MONITORED);

export const deleteStudio = createThunk(DELETE_STUDIO, (payload) => {
  return {
    ...payload,
    queryParams: {
      deleteFiles: payload.deleteFiles,
      addImportExclusion: payload.addImportExclusion,
    },
  };
});

export const setDeleteOption = createAction(SET_DELETE_OPTION);

export const setStudioValue = createAction(SET_STUDIO_VALUE, (payload) => {
  return {
    section,
    ...payload,
  };
});

//
// Action Handlers

export const actionHandlers = handleThunks({
  [SAVE_STUDIO]: createSaveProviderHandler(section, '/studio'),
  [DELETE_STUDIO]: createRemoveItemHandler(section, '/studio'),

  [TOGGLE_STUDIO_MONITORED]: (getState, payload, dispatch) => {
    const { studioId: id, monitored, moviesMonitored } = payload;

    const studio = _.find(getState().studios.items, { id });

    dispatch(
      updateItem({
        id,
        section,
        isSaving: true,
      })
    );

    const promise = createAjaxRequest({
      url: `/studio/${id}`,
      method: 'PUT',
      data: JSON.stringify({
        ...studio,
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
        })
      );
    });

    promise.fail((xhr) => {
      dispatch(
        updateItem({
          id,
          section,
          isSaving: false,
        })
      );
    });
  },

  [SAVE_STUDIO_EDITOR]: function (getState, payload, dispatch) {
    dispatch(
      set({
        section,
        isSaving: true,
      })
    );

    const promise = createAjaxRequest({
      url: '/studio/editor',
      method: 'PUT',
      data: JSON.stringify(payload),
      dataType: 'json',
    }).request;

    promise.done((data) => {
      dispatch(
        batchActions([
          updateItem({ section, ...data }),

          set({
            section,
            isSaving: false,
            saveError: null,
            pendingChanges: {},
          }),
        ])
      );
    });

    promise.fail((xhr) => {
      dispatch(
        set({
          section,
          isSaving: false,
          saveError: xhr.aborted ? null : xhr,
        })
      );
    });
  },
});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_STUDIO_VALUE]: createSetSettingValueReducer(section),
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
