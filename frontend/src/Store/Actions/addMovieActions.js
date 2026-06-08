import { createAction } from 'redux-actions';
import getSectionState from 'Utilities/State/getSectionState';
import updateSectionState from 'Utilities/State/updateSectionState';
import createHandleActions from './Creators/createHandleActions';
import createSetSettingValueReducer from './Creators/Reducers/createSetSettingValueReducer';

//
// Variables
//

export const section = 'addMovie';

//
// State
//

export const defaultState = {
  movieDefaults: {
    rootFolderPath: '',
    monitor: 'movieOnly',
    monitored: true,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  },
  performerDefaults: {
    rootFolderPath: '',
    monitored: true,
    moviesMonitored: false,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  },
  studioDefaults: {
    rootFolderPath: '',
    monitored: true,
    moviesMonitored: false,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  },
};

export const persistState = [
  'addMovie.movieDefaults',
  'addMovie.performerDefaults',
  'addMovie.studioDefaults',
];

//
// Actions Types
//

export const SET_ADD_MOVIE_VALUE = 'addMovie/setAddMovieValue';
export const SET_ADD_PERFORMER_VALUE = 'addMovie/setAddPerformerValue';
export const SET_ADD_STUDIO_VALUE = 'addMovie/setAddStudioValue';
export const SET_ADD_MOVIE_DEFAULT = 'addMovie/setAddMovieDefault';
export const SET_ADD_PERFORMER_DEFAULT = 'addMovie/setAddPerformerDefault';
export const SET_ADD_STUDIO_DEFAULT = 'addMovie/setAddStudioDefault';

//
// Action Creators
//

export const setAddMovieDefault = createAction(SET_ADD_MOVIE_DEFAULT);
export const setAddPerformerDefault = createAction(SET_ADD_PERFORMER_DEFAULT);
export const setAddStudioDefault = createAction(SET_ADD_STUDIO_DEFAULT);

export const setAddMovieValue = createAction(SET_ADD_MOVIE_VALUE, (payload) => {
  return {
    section,
    ...payload,
  };
});
export const setAddPerformerValue = createAction(
  SET_ADD_PERFORMER_VALUE,
  (payload) => {
    return {
      section,
      ...payload,
    };
  }
);
export const setAddStudioValue = createAction(
  SET_ADD_STUDIO_VALUE,
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
    [SET_ADD_MOVIE_VALUE]: createSetSettingValueReducer(section),
    [SET_ADD_PERFORMER_VALUE]: createSetSettingValueReducer(section),
    [SET_ADD_STUDIO_VALUE]: createSetSettingValueReducer(section),

    [SET_ADD_MOVIE_DEFAULT]: function (state, { payload }) {
      const newState = getSectionState(state, section);

      newState.movieDefaults = {
        ...newState.movieDefaults,
        ...payload,
      };

      return updateSectionState(state, section, newState);
    },
    [SET_ADD_PERFORMER_DEFAULT]: function (state, { payload }) {
      const newState = getSectionState(state, section);

      newState.performerDefaults = {
        ...newState.performerDefaults,
        ...payload,
      };

      return updateSectionState(state, section, newState);
    },
    [SET_ADD_STUDIO_DEFAULT]: function (state, { payload }) {
      const newState = getSectionState(state, section);

      newState.studioDefaults = {
        ...newState.studioDefaults,
        ...payload,
      };

      return updateSectionState(state, section, newState);
    },
  },
  defaultState,
  section
);
