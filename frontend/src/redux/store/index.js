import { createStore, applyMiddleware, compose } from 'redux';

import { createBrowserHistory } from 'history';
import { routerMiddleware as createRouterMiddleware } from 'react-router-redux';
import { sync } from './middleware';
import thunk from 'redux-thunk';
import reducer from '../reducers';
// Instruments

const devtools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers = devtools ? devtools : compose;

// Instruments


const history = createBrowserHistory();

// Build the middleware for intercepting and dispatching navigation actions
const routerMiddleware = createRouterMiddleware(history);

const middleware = [routerMiddleware, thunk, sync];

const persistedState = JSON.parse(localStorage.getItem('@@imatrixcertservice'));

export { history };
export default (() =>
    persistedState
        ? createStore(reducer, persistedState, composeEnhancers(applyMiddleware(...middleware)))
        : createStore(reducer, composeEnhancers(applyMiddleware(...middleware))))();
