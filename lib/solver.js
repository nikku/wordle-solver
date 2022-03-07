import {
  CONTAINED,
  MATCH,
  NO_MATCH,
  isWin
} from './game.js';

/**
 * @typedef { CONTAINED | MATCH | NO_MATCH } LetterMatch
 * @typedef { [ LetterMatch, LetterMatch, LetterMatch, LetterMatch, LetterMatch ] } WordMatch
 * @typedef { { [letter: string]: number } LetterDistribution }
 * @typedef { [ LetterDistribution?, LetterDistribution?, LetterDistribution?, LetterDistribution?, LetterDistribution? ] } ColumnLetterDistribution
 * @typedef { [ word: string, match: WordMatch ] } HistoryEntry
 * @typedef { HistoryEntry[] } History
 * @typedef { { attempt: number, search: number, matched: [ string|null, string|null, string|null, string|null, string|null ], remainingWords: string[], remainingLetters: string[], history: History } } Progress
 */

/**
 * @param {string[]} words
 * @return {LetterDistribution}
 */
export function getLetterDistribution(words) {

  const letterCount = words.reduce((letterCount, word) => {

    return Array.from(word).reduce((letterCount, letter) => {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
      return letterCount;
    }, letterCount);
  }, /** @type { LetterDistribution } */ ({}));

  const letterDistribution = Object.entries(letterCount).reduce((letterDistribution, [ letter, count ]) => {
    letterDistribution[letter] = count / (words.length * 5);

    return letterDistribution;
  }, /** @type { LetterDistribution } */ ({}));

  return letterDistribution;
}

/**
 * @param { string[] } words
 * @return { ColumnLetterDistribution }
 */
export function getColumnLetterDistribution(words) {

  const letterCount = words.reduce((letterCount, word) => {

    return Array.from(word).reduce((letterCount, letter, idx) => {
      letterCount[idx] = letterCount[idx] || {};
      letterCount[idx][letter] = (letterCount[idx][letter] || 0) + 1;

      return letterCount;
    }, letterCount);
  }, /** @type { ColumnLetterDistribution } */ ([]));

  const letterDistribution = letterCount.map((lettersPerColumn) => {
    return Object.entries(lettersPerColumn).reduce((letterDistribution, [ letter, count ]) => {
      letterDistribution[letter] = count / words.length;

      return letterDistribution;
    }, /** @type {LetterDistribution} */ ({}));
  });

  return letterDistribution;
}

/**
 * @typedef { [ unknown, number ] } Rankable
 *
 * @param  { Rankable } a
 * @param  { Rankable } b
 * @return { number }
 */
function rank(a, b) {
  return b[1] - a[1];
}

/**
 * @param { string } word
 * @param { ColumnLetterDistribution } lettersByColumn
 * @param { LetterDistribution } lettersByWord
 *
 * @return { number } return confidence of word matching
 */
function rankWord(word, lettersByColumn, lettersByWord) {

  const letters = {};

  const byColumnRanks = Array.from(word).map((letter, idx) => {
    letters[letter] = true;

    const columnLetters = lettersByColumn[idx];

    if (!columnLetters) {
      return [ letter, 0 ];
    }

    const letterScore = columnLetters[letter];

    if (!letterScore) {
      return [ letter, 0 ];
    }

    return [ letter, .5 + letterScore * Math.log(1 / letterScore) ];
  });

  const byWordRanks = Object.keys(letters).map((letter) => {

    const wordScore = lettersByWord[letter];

    if (!wordScore) {
      return [ letter, 0 ];
    }

    return [ letter, .25 + wordScore * Math.log(1 / wordScore) ];
  });

  return [
    ...byColumnRanks,
    ...byWordRanks
  ].reduce((rank, [ _letter, score ]) => score + rank, 0);
}

/**
 * @param { string[] } words
 * @param { ColumnLetterDistribution } lettersByColumn
 * @param { LetterDistribution } lettersByWord
 *
 * @return {[string, number][]} wordsByRank
 */
function rankWords(words, lettersByColumn, lettersByWord) {

  const wordsRanked = words.map(
    word => /** @type { [ word: string, rank: number ] } */ ([ word, rankWord(word, lettersByColumn, lettersByWord) ])
  ).sort(rank);

  return wordsRanked;
}


/**
 * @param { History } history
 * @param { string[] } words
 *
 * @return { { lettersByColumn: ColumnLetterDistribution, lettersByWord: LetterDistribution, progress: Progress } }
 */
export function scoreLetters(history, words) {

  const contained = [ [], [], [], [], [] ];
  const notContained = [ ];

  const matched = [ null, null, null, null, null ];

  history.forEach(([ word, match ]) => {

    match.forEach((field, idx) => {
      const letter = word.charAt(idx);

      if (field === MATCH) {
        matched[idx] = letter;
      }

      if (field === CONTAINED) {
        const containedLetters = contained[idx];

        if (!containedLetters.includes(letter)) {
          containedLetters.push(letter);
        }
      }

      if (field === NO_MATCH) {
        if (!notContained.includes(letter)) {
          notContained.push(letter);
        }
      }
    });

  });

  const containedLetters = contained.flat();

  const search = Math.min(
    (
        matched.filter(m => m).length * .2
      + containedLetters.length * .01
    ),
    1
  );

  const remainingWords = words.filter(
    word => matched.every(
      (letter, idx) => !letter || word.charAt(idx) === letter
    ) && contained.every(
      (letters, idx) => letters.every(
        letter => word.charAt(idx) !== letter && word.includes(letter)
      )
    ) && notContained.every(
      letter => !word.includes(letter)
    )
  );

  const remainingLetters = Object.keys(remainingWords.reduce((letters, word) => {
    return Array.from(word).reduce((letters, letter, idx) => {
      if (!matched[idx]) {
        letters[letter] = true;
      }

      return letters;
    }, letters);
  }, {}));

  const progress = {
    attempt: history.length,
    search,
    matched,
    remainingLetters,
    remainingWords,
    history
  };

  // if guessing is our best chance, do it
  if (remainingWords.length < 3 || remainingLetters.length < 3 || history.length === 5) {
    return {
      lettersByColumn: getColumnLetterDistribution(remainingWords),
      lettersByWord: getLetterDistribution(remainingWords),
      progress
    };
  }

  const remainingWordsUnmatched = remainingWords.map(
    word => Array.from(word).map(
      (letter, idx) => matched[idx] ? '_' : letter
    ).join('')
  );

  const lettersByWord = getLetterDistribution(remainingWordsUnmatched);
  const lettersByColumn = getColumnLetterDistribution(remainingWordsUnmatched);

  matched.forEach(letter => {
    lettersByWord[letter || '_'] = 0;
  });

  return {
    lettersByColumn,
    lettersByWord,
    progress
  };
}

/**
 * @param {History} history
 * @param {string[]} words
 * @param {string[]} solutions
 *
 * @return { { progress: Progress, word: string, wordsByRank: [ string, number ][] } }
 */
export function suggest(history, words, solutions=words) {

  const {
    progress,
    lettersByColumn,
    lettersByWord
  } = scoreLetters(history, solutions);

  const wordsByRank = rankWords(words, lettersByColumn, lettersByWord);

  const word = wordsByRank[0][0];

  return {
    progress,
    word,
    wordsByRank
  };
}

/**
 * Attempt to solve wordle game, in six tries.
 *
 * @param { { input: (word: string) => Promise<WordMatch> } } game
 * @param { string[] } words
 * @param { { log?: (Progress) => void } } [options]
 *
 * @return { Promise<{ history: History, win: boolean }> } result after 6 tries
 */
export async function solve(game, words, options={}) {

  if (!game) {
    throw new Error('<game> required');
  }

  if (!words) {
    throw new Error('<words> required');
  }

  const {
    log = null,
    solutions = words
  } = options;

  const history = [];

  for (let i = 0; i < 6; i++) {

    const {
      progress,
      word
    } = suggest(history, words, solutions);

    const match = await game.input(word);

    history.push([ word, match ]);

    log && log(progress);

    if (isWin(match)) {
      return {
        history,
        win: true
      };
    }
  }

  return {
    history,
    win: false
  };
}
