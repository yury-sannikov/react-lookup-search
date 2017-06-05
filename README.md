# Installation

```
yarn install
```

# Run

```
yarn start
open http://localhost:8000
```

# Rebuild Data Indices

```
yarn run build:data
```

# How It Works

build:data generate 2 files.

### birds.json
```
{
    "i":[ [0,4,1,5],[2,4,1,5], ....,
    "w":["common","ostrich","somali", ...
}
```
That's a compressed representation of original data file. Index array has references to the `Word` array in even positions and flags in odd ones. Flag can show that a word was capitalized, had hypen or space before.

### trie.json

A (trie)[https://en.wikipedia.org/wiki/Trie] structure. Keys are use (metaphone)[http://yomguithereal.github.io/clj-fuzzy/node.html#metaphone] to be typo agnostic. Nodes has references to the `birds.json` indices.

Implemented trie algorithm has one improvement. Trie node has nodeThreshold parameter. If node has less than nodeThreshold refereces, it keep it inside that node. If it exceeded, it rebalance this node by creating subnodes, maintaining the same nodeThreshold value. This reduces size of trie.

### Search

Search algorithm split input text, then extract metaphones. Metaphones goes through trie using `getRefsByPartialKey` and get a list of references to the words index using `getWordsByRefs`.
Later `rangeWordsWithDiceDistance` is used to extract actual words and using `dice` distance metrics range words and sort it accordingly. A special heuristics is used to filter out false positive matches. Search has diceTreshold equal to 0.35. Any dice distance metric below that value becomes false positive and replaced by zero.
Mean of all dice instances is used to range entire word.
