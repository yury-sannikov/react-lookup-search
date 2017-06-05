import path from 'path';
import Loadable from 'react-loadable';
import React from 'react';

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200,
    color: '#ccc'
  },
};
const Loading = () => (
  <div style={styles.container}>
    <h1>Loading</h1>
  </div>
)

export default Loadable({
  loader: () => import('./index'),
  LoadingComponent: () => <Loading/>,
  serverSideRequirePath: path.join(__dirname, './index'),
  webpackRequireWeakId: () => require.resolveWeak('./index'),
});
