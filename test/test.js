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

  describe('should solve', function() {

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


  it('should batch solve', async function() {

    // more time to execute
    this.timeout(20000);

    const runs = [];

    let usedWords = [];

    const nextWord = () => {

      let word;

      do {
        word = randomWord(allWords);

      } while (usedWords.includes(word));

      usedWords.push(word);

      return word;
    };

    let wins = 0;
    let loss = 0;
    let steps = 0;

    for (var i = 0; i < 100; i++) {

      const word = nextWord();
      const game = createGame(word);

      const {
        win,
        history
      } = await solve(game);

      runs.push([ word, history.length, win ]);

      if (win) {
        wins++;
      } else {
        loss++;
      }

      steps += history.length;
    }

    console.log('W=%s S=%s', wins / runs.length, steps / runs.length);
  });

});