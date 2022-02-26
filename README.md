# Wordle Solver

[![CI](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml)

Get a little help solving your [Wordle](https://www.nytimes.com/games/wordle/index.html) puzzles. 


## Usage

Try the [demo](https://cdn.statically.io/gh/nikku/wordle-solver/v0.0.7/demo/index.html).

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

Solves __99.9%__ of all puzzles in an average of __3.7 steps__.

```
$ npm run bench
...
W=0.999 S=3.760 R=1500
```

Solves __99.1%__ of all puzzles in an average of __4.3 steps__ when accepting the full dictionary as a solution:

```
$ FULL_DATA_SET=1 npm run bench
...
W=0.991 S=4.373 R=1500
