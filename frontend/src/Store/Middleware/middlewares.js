import { applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createPersistState from './createPersistState';

export default function () {
  const middlewares = [thunk];

  const composeEnhancers =
    // eslint-disable-next-line no-underscore-dangle
    globalThis.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  return composeEnhancers(
    applyMiddleware(...middlewares),
    createPersistState()
  );
}
