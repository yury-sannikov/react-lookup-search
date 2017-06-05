import React, {Component} from 'react';
import { string } from 'prop-types';
import { connect } from 'react-redux';
import { Route, Link } from 'react-router-dom';
import AutoComplete from 'material-ui/AutoComplete';
import _ from 'lodash';

const birdsData = require('../../../data')
const { 
  getRefsByPartialKey,
  getWordsByRefs,
  rangeWordsWithDiceDistance,
  buildWords 
} = require('../../../common/trieSearch')

const clj_fuzzy = require('clj-fuzzy')


const styles = {
  container: {
    textAlign: 'center',
    padding: '200px 100px 0',
  },
};


function mapStateToProps(state) {
  return {
    home: state.home,
  };
}

class AutoCompleteBirds extends Component {

  constructor() {
    super();
    this.state = {
      dataSource: [],
    };
  }
  
  handleUpdateInput(value) {
    const typedWords = value.split(/[ -]/);
    const wrefs = _.uniq(typedWords.reduce(
      (res, word) => {
        let refs = getRefsByPartialKey(birdsData.trie, clj_fuzzy.phonetics.metaphone(word));
        res.push(...refs);
        return res;
      },
      []
    )).slice(0, 20)

    const words = getWordsByRefs(birdsData.birds, wrefs);
    const result = buildWords(
        rangeWordsWithDiceDistance(words, typedWords)
        .map( w => w.word)
    );
    
    this.setState({
      dataSource: result,
    });
  };

  render() {
    return (
      <div style={styles.container}>
        <AutoComplete
          fullWidth={true}
          filter= {()=> {return true;} }
          hintText="Start typing bird name"
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput.bind(this)}
          />
      </div>    
    );
  }
}

AutoCompleteBirds.propTypes = {
  home: string.isRequired,
};

export default connect(mapStateToProps)(AutoCompleteBirds);
