import React from 'react';
import { Link, Route } from 'react-router-dom';
import AutoCompleteBirds from '../../pages/AutoCompleteBirds/AutoCompleteBirdsAsync';
import RaisedButton from 'material-ui/RaisedButton';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200,
  },
};

export default () =>
  <div>
    <Route path="/" exact={true} render={(props) =>
        <div style={styles.container}>
          <RaisedButton
            label="Load Lookup Component"
            secondary={true}
            onTouchTap={() => props.history.push('/birds')}
          />   
        </div>
    } />
    <Route path="/birds" component={AutoCompleteBirds} />
  </div>;
