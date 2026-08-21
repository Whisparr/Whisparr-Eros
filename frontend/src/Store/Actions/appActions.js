import { createThunk, handleThunks } from 'Store/thunks';
import { fetchTranslations as fetchAppTranslations } from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';

// Everything else that lived here -- dimensions, messages, version, sidebar
// visibility, connection state and the server ping -- moved to `App/appStore`
// and `App/messagesStore`. Translations stay behind because `useAppPage` gates
// the entire app render on them; they move with the boot path.

//
// Variables

export const section = 'app';

//
// State

export const defaultState = {
  translations: {
    isFetching: true,
    isPopulated: false,
    error: null,
  },
};

//
// Action Types

export const SET_APP_VALUE = 'app/setAppValue';
export const FETCH_TRANSLATIONS = 'app/fetchTranslations';

//
// Action Creators

export const fetchTranslations = createThunk(FETCH_TRANSLATIONS);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [FETCH_TRANSLATIONS]: async function (getState, payload, dispatch) {
    const isFetchingComplete = await fetchAppTranslations();

    dispatch({
      type: SET_APP_VALUE,
      payload: {
        translations: {
          isFetching: false,
          isPopulated: isFetchingComplete,
          error: isFetchingComplete
            ? null
            : 'Failed to load translations from API',
        },
      },
    });
  },
});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_APP_VALUE]: function (state, { payload }) {
      return Object.assign({}, state, payload);
    },
  },
  defaultState,
  section
);
