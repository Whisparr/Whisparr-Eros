import _ from 'lodash';
import { createAction } from 'redux-actions';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { updateItem } from './baseActions';
import createHandleActions from './Creators/createHandleActions';
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
export const SET_STUDIO_VALUE = 'studios/setStudioValue';

export const TOGGLE_STUDIO_MONITORED = 'studios/toggleStudioMonitored';

//
// Action Creators

export const saveStudio = createThunk(SAVE_STUDIO);

export const toggleStudioMonitored = createThunk(TOGGLE_STUDIO_MONITORED);

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
});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_STUDIO_VALUE]: createSetSettingValueReducer(section),
  },
  defaultState,
  section
);
