import {
  fileURLToPath
} from 'url';

import {
  Worker, isMainThread, parentPort, workerData
} from 'worker_threads';

import {
  createGame
} from './game.js';

import {
  solve
} from '../lib/index.js';

import {
  randomWord,
  words as allWords
} from './dictionary.js';

const __filename = fileURLToPath(import.meta.url);


function pickWords(range) {

  if (range === 'random') {

    const words = [];

    for (let i = 0; i < 50; i++) {
      words.push(randomWord(allWords));
    }

    return words;
  }

  const [ start, end ] = range;

  return allWords.slice(start, end);
}


async function solveAll(words, report) {

  const runs = [];

  const flush = () => {
    report(runs.slice());

    runs.length = 0;
  };

  for (const word of words) {

    const game = createGame(word);

    const {
      win,
      history
    } = await solve(game, allWords);

    runs.push([ word, win, history.length ]);

    if (runs.length % 25 === 0) {
      flush();
    }
  }

  flush();
}

const runs = [];

let steps = 0;
let wins = 0;

async function spawnWorker(range) {

  console.log('Spawning worker for <%s> range', Array.isArray(range) ? range.join(':') : range);

  return new Promise((resolve, reject) => {

    const worker = new Worker(__filename, {
      workerData: range
    });

    worker.on('message', (workerRuns) => {

      workerRuns.forEach(
        ([word, _win, _steps]) => {

          if (_win) {
            wins++;
          }

          if (_win) {
            steps += _steps;
          }
        }
      );

      runs.push(...workerRuns);

      console.log('W=%s S=%s R=%s', (wins / runs.length).toFixed(3), (steps / wins).toFixed(3), runs.length);
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

function scaffold() {
  const random = !!process.env.RANDOM_WORDS;

  if (random) {
    return spawnWorker('random');
  } else {

    const workers = [];

    const slices = 8;
    const slice = Math.trunc(allWords.length / slices);

    for (let i = 0; i < slices; i++) {
      workers.push(spawnWorker([ slice * i, slice * i + slice - 1]));
    }

    return Promise.all(workers);
  }
}

if (isMainThread) {

  scaffold().catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  const range = workerData;

  const words = pickWords(range);

  const report = (runs) => parentPort.postMessage(runs);

  solveAll(words, report).catch(err => {
    console.error(err);
    process.exit(1);
  });
}