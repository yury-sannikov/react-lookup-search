'use strict';
const ld = require('lodash')
const clj_fuzzy = require('clj-fuzzy')

const getRefsByPartialKeyRecursive = (trie, node, key, keyIndex, refs) => {

    keyIndex++;

    if (!node.n || key.length <= keyIndex) {
        if (node.r && node.r.length > 0) {
            refs.push(...node.r);
            return true
        }
        return false
    }

    const nextList = trie[node.n]
    if (!nextList.hasOwnProperty(key[keyIndex])) {
        return false;
    }

    const nextNode = nextList[key[keyIndex]]
    if (!getRefsByPartialKeyRecursive(trie, nextNode, key, keyIndex, refs)) {
        if (node.r && node.r.length > 0) {
            refs.push(...node.r);
            return true
        }
        return false
    }
    return true;
}

const getRefsByPartialKey = (trie, key) => {
    if (!trie || trie.length === 0 || !key) {
        return []
    }
    const root = trie[0]
    const refs = []
    if (!root.hasOwnProperty(key[0])) {
        return refs
    }
    const node = root[key[0]];
    getRefsByPartialKeyRecursive(trie, node, key, 0, refs)
    return refs
}

const getWordsByRefs = (data, refs) => {
    return refs.map(ref => {
        return data.i[ref].map( (wi, i) => (i % 2) ? wi : data.w[wi] );
    })
}

const SPACE_AHEAD = 1
const HYPEN_AHEAD = 2
const CAPITALIZED = 4

const rangeWordsWithDiceDistance = (rawWords, searchWords, options) => {
    options = Object.assign({
        diceTreshold: 0.35
    }, options);
    let res = ld.filter(rawWords.map( wordRule => {
        let distanceTotal = 0;
        const word = ld.map(wordRule, (wordOrRule, idx) => {
            if (idx % 2) {
                return wordOrRule;
            }
            const distance = ld.reduce(searchWords, (r, sw) => {
                const metric = clj_fuzzy.metrics.dice(sw, wordOrRule);
                if (metric < options.diceTreshold) {
                    return r;
                }
                return metric > r ? metric : r;
            }, 0)
            distanceTotal += distance;
            return wordOrRule;
        });
        return { word, score:  distanceTotal / (wordRule.length / 2) };
    }), (r) => true || r.score > options.diceTreshold);
    res.sort((a,b) => b.score - a.score);
    return res;
}

const buildWords = (rawWords) => {
    return rawWords.map( wordRule => {
        let wordAccum = '';
        const displayFriendly = ld.reduce(wordRule, (result, wordOrRule, idx) => {
            if (idx % 2) {
                wordOrRule = parseInt(wordOrRule);
                if (wordOrRule & CAPITALIZED) {
                    wordAccum = ld.capitalize(wordAccum);
                }
                if (wordOrRule & SPACE_AHEAD) {
                    wordAccum = ' ' + wordAccum;
                }
                if (wordOrRule & HYPEN_AHEAD) {
                    wordAccum = '-' + wordAccum;
                }
                return result + wordAccum;
            } else {
                wordAccum = wordOrRule;
                return result;
            }
        }, '');
        return displayFriendly;
    })
}

exports.getRefsByPartialKey = getRefsByPartialKey
exports.getWordsByRefs = getWordsByRefs
exports.rangeWordsWithDiceDistance = rangeWordsWithDiceDistance
exports.buildWords = buildWords