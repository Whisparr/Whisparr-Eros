import { createAction } from 'redux-actions';
import getSectionState from 'Utilities/State/getSectionState';
import updateSectionState from 'Utilities/State/updateSectionState';
import createHandleActions from './Creators/createHandleActions';
import createSetSettingValueReducer from './Creators/Reducers/createSetSettingValueReducer';

//
// Variables
//

export const section = 'addPerformer';

//
// State
//

export const defaultState = {
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
//

export const SET_ADD_PERFORMER_VALUE = 'addPerformer/setAddPerformerValue';
export const SET_ADD_PERFORMER_DEFAULT = 'addPerformer/setAddPerformerDefault';

//
// Action Creators
//

export const setAddPerformerDefault = createAction(SET_ADD_PERFORMER_DEFAULT);

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
// Reducers
//

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
  },
  defaultState,
  section
);
