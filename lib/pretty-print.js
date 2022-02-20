import {
  MATCH,
  NO_MATCH,
  CONTAINED
} from './game.js';


/**
 * @param { import('picocolors') } colors
 * @param { import('./solver').WordMatch } match
 *
 * @return { string }
 */
export function formatMatch(colors, match) {
  const tileColorMap = {
    [ MATCH ] : colors.green,
    [ NO_MATCH ] : colors.gray,
    [ CONTAINED ]: colors.yellow
  };

  return match.map((field, idx) => tileColorMap[field]('■')).join('');
}

/**
 * @param { import('picocolors') } colors
 * @param { import('./solver').WordMatch } match
 * @param { string } word
 *
 * @return {string}
 */
export function formatWord(colors, match, word) {
  const letterColorMap = {
    [ MATCH ] : (val) => colors.green(colors.bold(val)),
    [ NO_MATCH ] : colors.gray,
    [ CONTAINED ]: colors.yellow
  };

  return match.map((field, idx) => letterColorMap[field](word[idx])).join('');
}

/**
 * @param { import('picocolors') } colors
 *
 * @return { (progress: import('./solver').Progress, log?: ((...any) => void)) => void } print fn
 */
export function printProgress(colors) {

  /**
   * @param { import('./solver').Progress } progress
   * @param { (...any) => void } log?
   */
  return (progress, log=console.log) => {
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
      formatMatch(colors, match),
      formatWord(colors, match, word),
      colors.gray([
        `p=${ colors.bold(search.toFixed(2)) }`,
        `matched=${ colors.bold(matched.map(l => l || '_').join('')) }`,
        `letters=${ remainingLetters.length > 6 ? `[...](${remainingLetters.length})` : `[ ${ remainingLetters.map(colors.bold).join(', ') } ]` }`,
        `words=${ remainingWords.length > 6 ? `[...](${remainingWords.length})` : `[ ${ remainingWords.map(colors.bold).join(', ') } ]` }`
      ].join(', '))
    );
  };
}