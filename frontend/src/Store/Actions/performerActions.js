import { createAction } from 'redux-actions';
import { createThunk, handleThunks } from 'Store/thunks';
import createFetchHandler from './Creators/createFetchHandler';
import createHandleActions from './Creators/createHandleActions';
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
export const SET_PERFORMER_VALUE = 'performers/setPerformerValue';

//
// Action Creators

export const fetchPerformers = createThunk(FETCH_PERFORMERS);
export const savePerformer = createThunk(SAVE_PERFORMER);

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
});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_PERFORMER_VALUE]: createSetSettingValueReducer(section),
  },
  defaultState,
  section
);
