import { randomWord } from '../lib/dictionary.js';

import {
  MATCH,
  CONTAINED,
  NO_MATCH
} from '../lib/game.js';


export function createGame(word = randomWord()) {

  return {
    input(str) {
      return Array.from(str).map((letter, idx) => {
        return (
          word.charAt(idx) === letter
            ? MATCH
            : word.includes(letter)
              ? CONTAINED
              : NO_MATCH
        );
      });
    }
  }
}