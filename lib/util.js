import {
  MATCH,
  NO_MATCH,
  CONTAINED
} from './game.js';

import pc from 'picocolors';

const tileColorMap = {
  [ MATCH ] : pc.green,
  [ NO_MATCH ] : pc.gray,
  [ CONTAINED ]: pc.yellow
};

const letterColorMap = {
  [ MATCH ] : (val) => pc.green(pc.bold(val)),
  [ NO_MATCH ] : pc.gray,
  [ CONTAINED ]: pc.yellow
};

/**
 * @param {import('./solver').WordMatch} match
 *
 * @return {string}
 */
export function formatMatch(match) {
  return match.map((field, idx) => tileColorMap[field]('■')).join('');
}

/**
 * @param {import('./solver').WordMatch} match
 * @param {string} word
 *
 * @return {string}
 */
export function formatWord(match, word) {
  return match.map((field, idx) => letterColorMap[field](word[idx])).join('');
}

/**
 * @param {import('./solver').Progress} progress
 * @param { (...any) => void } [log]
 */
export function printProgress(progress, log=console.log) {

  const {
    history,
    search,
    matched,
    remainingLetters,
    remainingWords
  } = progress;

  const [ word, match ] = history.slice(-1)[0];

  log(
    '  %s    %s    %s',
    formatMatch(match),
    formatWord(match, word),
    pc.gray([
      `p=${ pc.bold(search.toFixed(2)) }`,
      `matched=${ pc.bold(matched.map(l => l || '_').join('')) }`,
      `letters=${ remainingLetters.length > 6 ? `[...](${remainingLetters.length})` : `[ ${ remainingLetters.map(pc.bold).join(', ') } ]` }`,
      `words=${ remainingWords.length > 6 ? `[...](${remainingWords.length})` : `[ ${ remainingWords.map(pc.bold).join(', ') } ]` }`
    ].join(', '))
  );
}