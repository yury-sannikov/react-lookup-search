/* global window, document */

import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';

import App from './pages/App';
import createStore from '../common/redux/store';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const initialState = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle
const store = createStore(initialState);
const history = createBrowserHistory();

ReactDOM.render(
  <MuiThemeProvider>
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('app'),
  () => {
    delete window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle
  },
);
