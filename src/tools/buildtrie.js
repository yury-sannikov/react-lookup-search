'use strict';
const path = require('path')
const fs = require('fs')
const { WeightedTrie } = require('./weightedTrie')
const { WordsBuilder } = require('./wordsBuilder')
const clj_fuzzy = require('clj-fuzzy')

if (process.argv.length !== 5) {
    console.error('Please pass source json file, output trie json & output birds json');
}

const [,, INPUT_DATA_FILE, OUTPUT_TRIE, OUTPUT_BIRDS] = process.argv
const INPUT_DATA = require(path.join(process.cwd(), INPUT_DATA_FILE));


console.log(INPUT_DATA.length);

const wordsBuilder = new WordsBuilder();
INPUT_DATA.forEach(w => wordsBuilder.put(w));

const wordsData = wordsBuilder.getStorable();
fs.writeFileSync(path.join(process.cwd(), OUTPUT_BIRDS), JSON.stringify(wordsData));

const wt = new WeightedTrie({
    nodeThreshold: 50,
    wordGetter: (idx) => wordsData.w[idx],
    transformer: clj_fuzzy.phonetics.metaphone
})

wordsData.i.forEach( (chunk, refIndex) => {
    for (let i = 0, n = chunk.length; i < n; i += 2) {
        wt.add(refIndex, chunk[i]);
    }
});


// const arr = ['ab', 'ac', 'abc', 'bcd', 'abd'];

// const wt = new WeightedTrie({
//     nodeThreshold: 4,
//     wordGetter: (idx) => arr[idx]
// })
// arr.forEach((e,i) => wt.add(i * 10, i));

const storableTrie = wt.getStorable()
console.log(JSON.stringify(storableTrie, null, 2));
fs.writeFileSync(path.join(process.cwd(), OUTPUT_TRIE), JSON.stringify(storableTrie));
