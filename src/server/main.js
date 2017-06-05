import React from 'react';
import { StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import express from 'express';
import winston from 'winston';
import { flushServerSideRequirePaths } from 'react-loadable';

import Html from './Html';
import App from '../client/pages/App';
import createStore from '../common/redux/store';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {green100, green500, green700} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const app = express();
app.use('/assets', express.static('dist', { maxAge: '200d' }));

const webpackStats = require('../../stats.json');

const babelInterop = obj => (
  obj && obj.__esModule ? obj.default : obj // eslint-disable-line no-underscore-dangle
);

const modules = {};
const bundles = {};

(webpackStats.modules || []).forEach((module) => {
  modules[module.identifier] = module.chunks;
});

(webpackStats.chunks || []).forEach((chunk) => {
  bundles[chunk.id] = chunk.files;
});

function renderApp(store, req) {
  const muiTheme = getMuiTheme({
    palette: {
      primary1Color: green500,
      primary2Color: green700,
      primary3Color: green100,
    },
  }, {
    avatar: {
      borderColor: null,
    },
    userAgent: req.headers['user-agent'],
  });

  return ReactDOMServer.renderToString(
    <MuiThemeProvider muiTheme={muiTheme}>
      <Provider store={store}>
        <StaticRouter location={req.url} context={{}}>
          <App />
        </StaticRouter>
      </Provider>
    </MuiThemeProvider>,
  );
}

async function render(req, res) {
  const store = createStore();

  // First render to get modules paths
  renderApp(store, req);

  const requires = flushServerSideRequirePaths();
  const scripts = [];

  requires.forEach((file) => {
    const matchedBundles = modules[`${file}.js`];
    matchedBundles.forEach((bundle) => {
      bundles[bundle].forEach((script) => {
        scripts.unshift(script);
      });
    });
  });

  await Promise.all(
    requires
      /* eslint-disable global-require, import/no-dynamic-require */
      .map(file => babelInterop(require(file)))
      /* eslint-disable global-require, import/no-dynamic-require */
      .filter(component => Boolean(component && component.fetch))
      .map(component => component.fetch(store)),
  );

  const html = renderApp(store, req);
  const markup = ReactDOMServer.renderToString(
    <Html
      html={html}
      state={store.getState()}
      scripts={scripts}
    />,
  );

  res.status(200).send(`<!DOCTYPE html>${markup}`);
}

app.get('*', render);

app.listen(8000, () => winston.info('server started'));
