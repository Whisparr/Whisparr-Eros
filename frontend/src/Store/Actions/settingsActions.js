import { handleThunks } from 'Store/thunks';
import createHandleActions from './Creators/createHandleActions';
import downloadClients from './Settings/downloadClients';

export * from './Settings/downloadClients';

//
// Variables

export const section = 'settings';

//
// State

export const defaultState = {
  downloadClients: downloadClients.defaultState,
};

//
// Action Handlers

export const actionHandlers = handleThunks({
  ...downloadClients.actionHandlers,
});

//
// Reducers

export const reducers = createHandleActions(
  {
    ...downloadClients.reducers,
  },
  defaultState,
  section
);
