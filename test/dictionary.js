import {
  words
} from '../lib/dictionary.js';


export {
  words
};

/**
 * @param {string[]} words
 * @return {string}
 */
export function randomWord(_words = words) {
  return _words[Math.trunc(Math.random() * _words.length)];
}