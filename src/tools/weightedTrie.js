'use strict';
const ld = require('lodash')

class WeightedTrie {
    /**
     * WeightedTrie
     * builds Trie with weights and maintain no more than nodeThreshold references per node
     * 
     * @param {Integer} nodeThreshold - maximum references per each node 
     * @param {Function} transformer - transform each word before adding into the trie
     */
    constructor({nodeThreshold, wordGetter, transformer = __=>__ }) {
        this.nodeThreshold = nodeThreshold
        this.transformer = transformer
        this.trie = [{}]
        this.wordGetter = wordGetter;
    }

    add(refIndex, wordRef) {
        const wd = this.transformer(this.wordGetter(wordRef));
        this.addRecursive(refIndex, wordRef, wd, 0, this.trie[0])
    }
    addRecursive(refIndex, wordRef, word, wIdx, root) {
        if (wIdx >= word.length || !word) {
            throw Error('Wrong word/index word='+word +', index='+wIdx);
        }
        const letter = word[wIdx],
            remaining = word.slice(wIdx + 1);
        let leafNode = root[letter];
        if (!leafNode) {
            leafNode = root[letter] = {
                w: 0,
                r: []
            }
        }

        leafNode.w++;

        if (leafNode.w >= this.nodeThreshold && remaining) {
            this.rebalanceNode(leafNode, word, wIdx);
        }

        const underTheshold = leafNode.w < this.nodeThreshold;
        if (!remaining || underTheshold) {
            leafNode.r.push([refIndex, wordRef]);
        } else {
            if(!leafNode.n) {
                this.trie.push({});
                leafNode.n = this.trie.length - 1;
            }

            this.addRecursive(refIndex, wordRef, word, wIdx + 1, this.trie[leafNode.n]);
        }
    }

    rebalanceNode(node, word, wIdx) {
        const refs = ld.cloneDeep(node.r);
        node.r = [];
        refs.forEach((r) => {
            const word = this.transformer(this.wordGetter(r[1]));
            if (word.length <= (wIdx + 1)) {
                node.r.push(r);
                return;
            }
            if(!node.n) {
                this.trie.push({});
                node.n = this.trie.length - 1;
            }
            this.addRecursive(r[0], r[1], word, wIdx + 1, this.trie[node.n]);
        });
    }
    getStorable() {
        return this.trie.map(t => 
            ld.mapValues(t, node => Object.assign({}, node, {
                r: ld.chain(node.r).map(r=>r[0]).uniq().value()
            }))
        );
    }
}

exports.WeightedTrie = WeightedTrie