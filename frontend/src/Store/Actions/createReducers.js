import { combineReducers } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import actions from 'Store/Actions';

const defaultState = {};
const reducers = {};

actions.forEach((action) => {
  const section = action.section;

  defaultState[section] = action.defaultState;
  reducers[section] = action.reducers;
});

export { defaultState };

// `combineReducers({})` warns on every dispatch about a store with no valid
// reducer, which is exactly what this is now that the last slice is gone. The
// store exists only so `<Provider>` and the one remaining `connect()` have
// something to hold; Phase F takes all three.
const noReducers = () => defaultState;

export default function () {
  return enableBatching(
    Object.keys(reducers).length ? combineReducers(reducers) : noReducers
  );
}
