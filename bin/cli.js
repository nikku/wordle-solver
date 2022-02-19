import readline from 'readline';
import pc from 'picocolors';

import {
  solve,
  printProgress
} from '../lib/index.js';


const highlight = (val) => pc.bold(pc.blue(val));
const secondary = (val) => pc.red(val);

const green = (val) => pc.bold(pc.green(val));
const yellow = (val) => pc.bold(pc.yellow(val));
const gray = (val) => pc.bold(pc.black(val));


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
${ highlight('@nikku/wordle') } solves a ${highlight('Wordle')} for you.

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

  const solved = await solve(game, {
    log: printProgress
  });

  if (!solved) {
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