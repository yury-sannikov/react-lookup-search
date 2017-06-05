const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const path = require('path')
const clj_fuzzy = require('clj-fuzzy')
const ld = require('lodash')

const { getRefsByPartialKey, getWordsByRefs, rangeWordsWithDiceDistance, buildWords } = require('../src/common/trieSearch')

const TRIE_DATA = require(path.join(process.cwd(), './src/data/trie.json'));
const BIRDS_DATA = require(path.join(process.cwd(), './src/data/birds.json'));

describe('Trie Search', function() {
    describe('getRefsByPartialKey', function() {
        it('lookup should pick a node(s) with most weight and get word list', () => {
            const refs = getRefsByPartialKey(TRIE_DATA, '0');
            expect(refs).to.eql([5425,5426]);
        })

        it('should get refs to closest metaphone', () => {
            const metaphone = clj_fuzzy.phonetics.metaphone('Brazilian');
            const refs = getRefsByPartialKey(TRIE_DATA, metaphone);
            expect(refs.length).to.equal(7);
        })

        it('should get refs to closest metaphone', () => {
            const metaphone = clj_fuzzy.phonetics.metaphone('Braz');
            const refs = getRefsByPartialKey(TRIE_DATA, metaphone);
            expect(refs).to.eql([193, 212, 603, 5796, 9403]);
        })
    });

    describe('getWordsByRefs', function() {
        /// That technically not a corrrect test as due to trie node nodeThreshold factor node can contain
        /// wordrefs with other metaphone endings
        it('should get all words containing matching metaphone', () => {
            const metaphone = clj_fuzzy.phonetics.metaphone('Brazilian');
            const refs = getRefsByPartialKey(TRIE_DATA, metaphone);
            const words = getWordsByRefs(BIRDS_DATA, refs);
            words.forEach((w) => {
                expect(ld.some(w, wrd => wrd === 'brazilian' || wrd === 'brasilia')).to.be.true
            })
        })
    });
    describe('buildWordsWithLevenshteinDistance', function() {
        it('should build correct words & distances', () => {
            const metaphone = clj_fuzzy.phonetics.metaphone('Brazilian');
            const refs = getRefsByPartialKey(TRIE_DATA, metaphone);
            const words = getWordsByRefs(BIRDS_DATA, refs);
            result = rangeWordsWithDiceDistance(words, ['Brazilian'], {diceTreshold : 0});
            expect(result.length).to.equal(7);
            expect(result[result.length - 1].word).to.eql([ 'brasilia', 4, 'tapaculo', 5 ]);
        });

        it('should build correct words & distances', () => {
            let metaphone = clj_fuzzy.phonetics.metaphone('brazilian');
            let refs = getRefsByPartialKey(TRIE_DATA, metaphone);
            
            metaphone = clj_fuzzy.phonetics.metaphone('tina');
            refs.push(...getRefsByPartialKey(TRIE_DATA, metaphone));
            
            const words = getWordsByRefs(BIRDS_DATA, refs);
            result = rangeWordsWithDiceDistance(words, ['brazilian', 'tina']);

            expect(result[0].word).to.eql([ 'brazilian', 4, 'tinamou', 5 ]);
        });

    });
    describe('buildWords', () => {
        describe('should build correct words & search with typos', () => {
            let metaphone = clj_fuzzy.phonetics.metaphone('brasilian');
            let refs = getRefsByPartialKey(TRIE_DATA, metaphone);
            
            metaphone = clj_fuzzy.phonetics.metaphone('meer');
            refs.push(...getRefsByPartialKey(TRIE_DATA, metaphone));
            
            const words = getWordsByRefs(BIRDS_DATA, refs);
            result = buildWords(
                rangeWordsWithDiceDistance(words, ['brasilian', 'meer'])
                .map( w => w.word)
            );

            expect(result).to.eql([
                'Brazilian Merganser',
                'Brasilia Tapaculo',
                'Brazilian Tanager',
                'Brazilian Teal',
                'Brazilian Ruby',
                'Brazilian Tinamou',
                'East Brazilian Chachalaca',
                'Moorea Sandpiper',
                'Common Murre',
                'Thick-billed Murre',
                'Serra do Mar Tyrannulet',
                'Serra do Mar Tyrant-Manakin',
                'Moorea Reed-Warbler']);
        })

    })

});