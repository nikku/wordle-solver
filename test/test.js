import {
  createGame,
  MATCH,
  NO_MATCH,
  CONTAINED
} from './game.js';

import {
  randomWord,
  words as allWords,
  solutions
} from './dictionary.js';

import colors from 'picocolors';

import {
  printProgress as _printProgress
} from '../lib/pretty-print.js';

import {
  solve,
  suggest
} from '../lib/index.js';

import {
  expect
} from 'chai';


const printProgress = _printProgress(colors);

describe('game', function() {

  it('should process input', function() {

    // given
    const game = createGame('swops');

    // then
    expect(game.input('swops')).to.eql(
      [ MATCH, MATCH, MATCH, MATCH, MATCH ]
    );

    expect(game.input('xxxxw')).to.eql(
      [ NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH, CONTAINED ]
    );

    expect(game.input('sxxxx')).to.eql(
      [ MATCH, NO_MATCH, NO_MATCH, NO_MATCH, NO_MATCH ]
    );
  });

});


describe('solver', function() {

  describe('#suggest', function() {

    it('should suggest initial word', function() {

      // given
      const history = [];

      // when
      const {
        word,
        wordsByRank
      } = suggest(history, allWords, solutions);

      // then
      expect(word).to.eql('soare');
    });


    it('should suggest word', function() {

      // given
      const history = [
        [ 'saine', Array.from('--?-+') ]
      ];

      // when
      const {
        word,
        wordsByRank
      } = suggest(history, allWords, solutions);

      // then
      expect(word).to.eql('boult');
    });


    it('should suggest remaining word', function() {

      // given
      const history = [
        [ 'cigar', Array.from('??--+') ]
      ];

      // when
      const {
        word,
        progress
      } = suggest(history, allWords, solutions);

      // then
      expect(progress.remainingWords).to.eql([
        'incur'
      ]);

      expect(word).to.eql('incur');
    });


    it('should suggest from remaining two words', function() {

      // given
      const history = [
        [ 'soare', Array.from('-+++-') ]
      ];

      // when
      const {
        word,
        progress
      } = suggest(history, allWords, solutions);

      // then
      expect(progress.remainingWords).to.eql([
        'hoard',
        'board'
      ]);

      expect(word).to.eql('hoard');
    });


    it('should suggest from remaining three words', function() {

      // given
      const history = [
        [ 'soare', Array.from('+-?--') ],
        [ 'uplay', Array.from('?--+-') ]
      ];

      // when
      const {
        word,
        wordsByRank,
        progress
      } = suggest(history, allWords, solutions);

      // then
      expect(progress.remainingWords).to.eql([
        'squad',
        'sumac',
        'squat'
      ]);

      expect(word).to.eql('squad');
    });


    it('should suggest other word', function() {

      // given
      const history = [
        [ 'soare', Array.from('-+-??') ]
      ];

      // when
      const {
        word,
        wordsByRank,
        progress
      } = suggest(history, allWords, solutions);

      // then
      expect(progress.remainingWords).to.have.length(22);

      expect(word).to.eql('vowel');
    });


    it('should suggest from remaining four words', function() {

      // given
      const history = [
        [ 'soare', Array.from('+---?') ],
        [ 'speel', Array.from('+-++-') ]
      ];

      // when
      const {
        word,
        wordsByRank,
        progress
      } = suggest(history, allWords, solutions);

      // then
      expect(progress.remainingWords).to.eql([
        'steed',
        'sweet',
        'sheen',
        'sheet'
      ]);

      expect(word).to.eql('sheet');
    });

  });


  describe('#solve', function() {

    function test(description, word, skip=false) {
      it(description, async function() {

        // given
        const game = createGame(word);

        console.log('\nFind word <' + word + '>');

        // when
        const { win } = await solve(game, allWords, {
          log: printProgress,
          solutions
        });

        // then
        expect(win).to.eql(!skip);
      });
    }

    describe('should solve random', function() {

      for (var i = 0; i < 5; i++) {
        const word = randomWord();

        test(`attempt #${i + 1} - ${word}`, word);
      }

    });


    describe('should solve special', function() {

      const words = [ 'cheek', 'melee', 'daunt', 'catch', 'river', 'daddy', 'foyer' ];

      for (const word of words) {

        const skip = word.startsWith('!');

        test(word, word.replace(/^!/, ''), skip);
      }

    });

  });

});