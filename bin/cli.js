#!/usr/bin/env node

import readline from 'readline';
import colors from 'picocolors';

import {
  solve
} from '../lib/index.js';

import {
  words,
  solutions
} from '../lib/dictionary.js';

import {
  printProgress as _printProgress
} from '../lib/pretty-print.js';

const printProgress = _printProgress(colors);

const highlight = (val) => colors.bold(colors.blue(val));
const secondary = (val) => colors.red(val);

const green = (val) => colors.bold(colors.green(val));
const yellow = (val) => colors.bold(colors.yellow(val));
const gray = (val) => colors.bold(colors.black(val));


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function run() {

  let attempt = 0;

  console.log(`
${ highlight('@nikku/wordle-solver') } solves a ${highlight('Wordle')} for you.

We'll provide you with a word to input to ${ highlight('Wordle') }.
You feedback the result as a ${highlight('[+-???]')} encoded string:

  ${ green('+') } = match
  ${ yellow('?') } = contained
  ${ gray('-') } = no match

-----`);

  const game = {
    async input(word) {
      console.log(`\nAttempt ${ secondary('#' + (++attempt)) } --- Choose ${highlight(word)}`);

      do {
        const input = await ask('Enter result [+-???]: ');

        if (!/^[+-?]{5}$/.test(input)) {
          console.error(`Invalid input, expected ${secondary('/[+-?]{5}/')}`);
        } else {
          console.log();
          return Array.from(input);
        }
      } while (true);
    }
  };

  const { win } = await solve(game, words, {
    log: printProgress,
    solutions
  });

  if (!win) {
    console.warn('\nThat did not work :-(');
  } else {
    console.log('\nWell done!');
  }
}


run().catch(
  err => console.error('something went wrong!', err)
).finally(
  () => rl.close()
);