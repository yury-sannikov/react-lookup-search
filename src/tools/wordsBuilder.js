'use strict';
const isCapitalized = require('is-capitalized')
const ld = require('lodash')

const SPACE_AHEAD = 1
const HYPEN_AHEAD = 2
const CAPITALIZED = 4

class WordsBuilder {

    constructor() {
        this.result = {
            indices: [],
            words: new Map()
        }
        this.splitRx = /[ -]/
    }

    put(word) {
        const wordIndices = ld.chain(word.split(' '))
            .map((w, i) => ({w, f: i ? SPACE_AHEAD : 0 }))
            .map(({w:word, f:flag}) => {
                const parts = word.split('-');
                if (parts.length === 1) {
                    return {w:word, f:flag}
                }
                return parts.map( (w,i) => ({w, f:(!i ? flag : 0) + (i ? HYPEN_AHEAD : 0)}))
            })
            .flattenDeep()
            .map( ({w,f}) => ({w:w.toLowerCase(), f: f + (isCapitalized(w, true) ? CAPITALIZED : 0)}))
            .map( wo => {
                const wordIndex = this.result.words.get(wo.w)
                if (typeof wordIndex === 'undefined') {
                    const result = [this.result.words.size, wo.f]
                    this.result.words.set(wo.w, this.result.words.size);
                    return result;
                } else {
                    return [wordIndex, wo.f];
                }
            })
            .flattenDeep()
            .value();
        this.result.indices.push(wordIndices);
    }
    getStorable() {
        var words = Array.from(this.result.words.keys()).map( k => ({k, v:this.result.words.get(k)}))
        words.sort((a,b) => a.v - b.v);
        const res = {
            i: this.result.indices,
            w: words.map(kv => kv.k)
        }
        return res;
    }
}

exports.WordsBuilder = WordsBuilder