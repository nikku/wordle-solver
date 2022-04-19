# Wordle Solver

[![CI](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml)

Get a little help solving your [Wordle](https://www.nytimes.com/games/wordle/index.html) puzzles. 


## Usage

Try the [demo](https://nikku.github.io/wordle-solver/index.html).

Alternatively, use module exports:

```javascript
import {
  suggest
} from '@nikku/wordle-solver';

const words = [ ... ];

const history = [
  [ 'hands', Array.from('??--+') ]
];

const {
  word,
  progress
} = suggest(history, words);

// then
console.log('Suggested pick: %s', word);
```


## How it Works

The solver is implemented in [`lib/solver.js`](./lib/solver.js).

### Algorithm

Every pick it chooses the next word in order to reduce the solution space as much as possible.

* Accounts for historic picks (match, not matched, contained)
* Scores letter occurance per column
* Derives a word score
* Adds a penalty for letter duplicates
* Uses matched slots to guess / exclude likely letters

### Performance

Solves __100%__ of all puzzles in an average of __3.6 steps__.

```
$ npm run bench
...
W=1.000 S=3.559 R=1500
```

Solves __99%__ of all puzzles in an average of __4.1 steps__ when accepting the full dictionary as a solution:

```
$ FULL_DATA_SET=1 npm run bench
...
W=0.990 S=4.115 R=1500
```