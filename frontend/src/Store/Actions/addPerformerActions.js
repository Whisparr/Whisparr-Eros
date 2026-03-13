import _ from 'lodash';
import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getNewPerformer from 'Utilities/Performer/getNewPerformer';
import getSectionState from 'Utilities/State/getSectionState';
import updateSectionState from 'Utilities/State/updateSectionState';
import { set, update, updateItem } from './baseActions';
import createHandleActions from './Creators/createHandleActions';
import createSetSettingValueReducer from './Creators/Reducers/createSetSettingValueReducer';

//
// Variables

export const section = 'addPerformer';
let abortCurrentRequest = null;

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  isAdding: false,
  isAdded: false,
  addError: null,
  items: [],
  performersWithStatus: [],

  performerDefaults: {
    rootFolderPath: '',
    monitored: true,
    moviesMonitored: false,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  },
};

export const persistState = ['addPerformer.performerDefaults'];

//
// Actions Types

export const LOOKUP_PERFORMER = 'addPerformer/lookupPerformer';
export const ADD_PERFORMER = 'addPerformer/addPerformer';
export const SET_ADD_PERFORMER_VALUE = 'addPerformer/setAddPerformerValue';
export const CLEAR_ADD_PERFORMER = 'addPerformer/clearAddPerformer';
export const SET_ADD_PERFORMER_DEFAULT = 'addPerformer/setAddPerformerDefault';
export const SET_PERFORMERS_WITH_STATUS =
  'addPerformer/setPerformersWithStatus';

//
// Action Creators

export const lookupPerformer = createThunk(LOOKUP_PERFORMER);
export const addPerformer = createThunk(ADD_PERFORMER);
export const clearAddPerformer = createAction(CLEAR_ADD_PERFORMER);
export const setAddPerformerDefault = createAction(SET_ADD_PERFORMER_DEFAULT);
export const setPerformersWithStatus = createAction(SET_PERFORMERS_WITH_STATUS);

export const setAddPerformerValue = createAction(
  SET_ADD_PERFORMER_VALUE,
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
  [LOOKUP_PERFORMER]: function (getState, payload, dispatch) {
    dispatch(set({ section, isFetching: true }));

    if (abortCurrentRequest) {
      abortCurrentRequest();
    }

    const { request, abortRequest } = createAjaxRequest({
      url: '/lookup/performer',
      data: {
        term: payload.term,
      },
    });

    abortCurrentRequest = abortRequest;

    request.done((data) => {
      data = data.map((movie) => ({
        ...movie,
        internalId: movie.id,
        id: movie.foreignId,
      }));

      dispatch(
        batchActions([
          update({ section, data }),

          set({
            section,
            isFetching: false,
            isPopulated: true,
            error: null,
          }),
        ])
      );
    });

    request.fail((xhr) => {
      dispatch(
        set({
          section,
          isFetching: false,
          isPopulated: false,
          error: xhr.aborted ? null : xhr,
        })
      );
    });
  },

  [ADD_PERFORMER]: function (getState, payload, dispatch) {
    dispatch(set({ section, isAdding: true }));

    const foreignId = payload.foreignId;
    const items = getState().addPerformer.items;
    const itemToAdd = _.find(items, { foreignId });
    const newPerformer = getNewPerformer(
      _.cloneDeep(itemToAdd.performer),
      payload
    );
    newPerformer.id = 0;

    const promise = createAjaxRequest({
      url: '/performer',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(newPerformer),
    }).request;

    promise.done((data) => {
      const updatedItem = _.cloneDeep(data);
      updatedItem.internalId = updatedItem.id;
      updatedItem.id = updatedItem.foreignId;
      delete updatedItem.images;

      const actions = [
        updateItem({ section: 'performers', ...data }),
        updateItem({ section: 'addMovie', ...updatedItem }),

        set({
          section,
          isAdding: false,
          isAdded: true,
          addError: null,
        }),
      ];

      dispatch(batchActions(actions));
    });

    promise.fail((xhr) => {
      dispatch(
        set({
          section,
          isAdding: false,
          isAdded: false,
          addError: xhr,
        })
      );
    });
  },
});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_ADD_PERFORMER_VALUE]: createSetSettingValueReducer(section),

    [SET_ADD_PERFORMER_DEFAULT]: function (state, { payload }) {
      const newState = getSectionState(state, section);

      newState.performerDefaults = {
        ...newState.performerDefaults,
        ...payload,
      };

      return updateSectionState(state, section, newState);
    },
    [SET_PERFORMERS_WITH_STATUS]: function (state, { payload }) {
      const newState = getSectionState(state, section);
      newState.performersWithStatus = payload;
      return updateSectionState(state, section, newState);
    },
    [CLEAR_ADD_PERFORMER]: function (state) {
      const {
        movieDefaults,
        performerDefaults,
        studioDefaults,
        view,
        ...otherDefaultState
      } = defaultState;

      return Object.assign({}, state, otherDefaultState);
    },
  },
  defaultState,
  section
);
