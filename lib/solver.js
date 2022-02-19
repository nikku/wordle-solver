import {
  CONTAINED,
  MATCH,
  NO_MATCH,
  isWin
} from './game.js';

import {
  words as allWords,
  getLetterDistribution
} from './dictionary.js';

/**
 * @typedef { [ string, string, string, string, string ] } WordMatch
 * @typedef { { [letter: string]: number } ScoreByLetter }
 * @typedef { [ ScoreByLetter?, ScoreByLetter?, ScoreByLetter?, ScoreByLetter?, ScoreByLetter? ] } ScoredLetters
 * @typedef { [ word: string, match: WordMatch ] } HistoryEntry
 * @typedef { HistoryEntry[] } History
 * @typedef { { attempt: number, search: number, matched: [ string|null, string|null, string|null, string|null, string|null ], remainingWords: string[], remainingLetters: string[], history: History } } Progress
 */

/**
 * @typedef { [ unknown, number] } Rankable
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
 * @param { ScoredLetters } letters
 *
 * @return {number} return [0...1] confidence of word matching
 */
function wordRank(word, letters) {

  const letterCount = {};

  const letterRanks = Array.from(word).map((letter, idx) => {
    letterCount[letter] = (letterCount[letter] || 0) + 1;

    const columnLetters = letters[idx];

    if (!columnLetters) {
      return [ letter, 0 ];
    }

    const letterScore = columnLetters[letter];

    if (!letterScore) {
      return [ letter, 0 ];
    }

    return [ letter, letterScore ];
  });

  const duplicateModifier = Object.values(letterCount).reduce((duplicateScore, count) => {
    return duplicateScore * (count == 1 ? 1 : Math.pow(.8, count));
  }, 1);

  const lettersRank = letterRanks.reduce((score, [ letter, letterScore ]) => {
    return score + letterScore;
  }, 0) / 5;

  if (lettersRank < .85) {
    // with low confidence penetalize
    // duplicate letters
    return lettersRank * duplicateModifier;
  } else {
    return lettersRank;
  }

}

/**
 * @param { string[] } words
 * @param { ScoredLetters } letters
 *
 * @return {string} word
 */
function findWord(words, letters) {

  const wordsRanked = words.map(
    word => /** @type { [ word: string, rank: number ] } */ ([ word, wordRank(word, letters) ])
  ).sort(rank);

  return wordsRanked[0][0];
}


/**
 * @param { History } history
 * @param { string[] } words
 *
 * @return { { letters: ScoredLetters, progress: Progress } }
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

  const search = Math.min(
    (
        matched.filter(m => m).length * .2
      + contained.flat().length * .01
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

  if (remainingWords.length === 1) {
    return {
      letters: getLetterDistribution(remainingWords),
      progress
    };
  }

  const letters = getLetterDistribution(
    remainingWords.map(
      word => Array.from(word).map(
        (letter, idx) => matched[idx] ? '_' : letter
      )
    )
  );

  if (remainingWords.length > 2) {

    const containedLetters = contained.flat();

    const unknownLettersDistribution = remainingLetters.filter(
      letter => !containedLetters.includes(letter)
    ).reduce(
      (lettersDistribution, letter) => {

        const letterDistribution = letters.reduce((score, columnDistribution) => {
          return score + (columnDistribution[letter] || 0);
        }, 0);

        lettersDistribution[letter] = letterDistribution / 5;

        return lettersDistribution;
      }, {}
    );

    // inject unknown letters where we area already certain
    // this way we may exclude them from the final dataset
    letters.forEach((letterDistribution, idx) => {

      if (letterDistribution['_']) {
        Object.assign(letterDistribution, unknownLettersDistribution, { [ matched[idx] || '_' ] : 0 });
      }
    });
  }

  return {
    letters,
    progress
  };
}

/**
 * Attempt to solve wordle game, in six tries.
 *
 * @param { { input: (word: string) => Promise<WordMatch> } } game
 * @param { { words?: string[], log?: (Progress) => void } } [options]
 *
 * @return { Promise<{ history: History, win: boolean }> } result after 6 tries
 */
export async function solve(game, options={}) {

  const {
    words = allWords,
    log = null
  } = options;

  const history = [];

  let word = null;

  for (let i = 0; i < 6; i++) {

    const {
      progress,
      letters
    } = scoreLetters(history, words);

    const currentWord = word || findWord(words, letters);

    const match = await game.input(currentWord);

    history.push([ currentWord, match ]);

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
