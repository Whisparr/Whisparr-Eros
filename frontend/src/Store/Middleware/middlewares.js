import { routerMiddleware } from 'connected-react-router';
import { applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createPersistState from './createPersistState';
import createSentryMiddleware from './createSentryMiddleware';

export default function (history) {
  const middlewares = [];
  const sentryMiddleware = createSentryMiddleware();

  if (sentryMiddleware) {
    middlewares.push(sentryMiddleware);
  }

  middlewares.push(routerMiddleware(history));
  middlewares.push(thunk);

  const composeEnhancers =
    // eslint-disable-next-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  return composeEnhancers(
    applyMiddleware(...middlewares),
    createPersistState()
  );
}
