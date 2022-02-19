import {
  createGame
} from './game.js';

import {
  CONTAINED,
  MATCH,
  NO_MATCH,
  isWin,
  solve,
  formatMatch,
  formatWord,
  printProgress
} from '../lib/index.js';

import {
  randomWord,
  words as allWords
} from '../lib/dictionary.js';

import {
  expect
} from 'chai';


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

  describe('should solve random', function() {

    for (var i = 0; i < 5; i++) {

      const word = randomWord();

      it(`attempt #${i + 1} - ${word}`, async function() {

        // given
        const game = createGame(word);

        console.log('\nFind word <' + word + '>');

        await solve(game, { log: printProgress });
      });

    }

  });


  describe('should solve special', function() {

    const words = [ 'boohs' ];

    for (const word of words) {

      it(word, async function() {

        // given
        const game = createGame(word);

        console.log('\nFind word <' + word + '>');

        await solve(game, { log: printProgress });
      });

    }

  });

});