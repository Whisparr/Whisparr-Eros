import { setAppValue } from 'Store/Actions/appActions';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { pingServer } from './appActions';
import createHandleActions from './Creators/createHandleActions';

//
// Variables

export const section = 'system';

//
// State

// The system slice no longer holds any data -- status, health, tasks, backups,
// updates and logs are all React Query now. Restart and shutdown stay here
// because they drive the redux app slice (`isRestarting`, `pingServer`); they
// move with it when app state converts.
export const defaultState = {};

//
// Action Types

export const RESTART = 'system/restart';
export const SHUTDOWN = 'system/shutdown';

//
// Action Creators

export const restart = createThunk(RESTART);
export const shutdown = createThunk(SHUTDOWN);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [RESTART]: function (getState, payload, dispatch) {
    const promise = createAjaxRequest({
      url: '/system/restart',
      method: 'POST',
    }).request;

    promise.done(() => {
      dispatch(setAppValue({ isRestarting: true }));
      dispatch(pingServer());
    });
  },

  [SHUTDOWN]: function () {
    createAjaxRequest({
      url: '/system/shutdown',
      method: 'POST',
    });
  },
});

//
// Reducers

export const reducers = createHandleActions({}, defaultState, section);
