import {
  words,
  solutions
} from '../lib/dictionary.js';


export {
  words,
  solutions
};

/**
 * @param {string[]} words
 * @return {string}
 */
export function randomWord(words = solutions) {
  return words[Math.trunc(Math.random() * words.length)];
}