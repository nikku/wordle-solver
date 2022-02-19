# Wordle Solver

[![CI](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml)

Get a little help solving your [Wordle](https://www.nytimes.com/games/wordle/index.html) puzzles.


## Usage

```
npx @nikku/wordle-solver
```


## Algorithmic Details

The [solver](./lib/solver.js) attempts to reduce the solution space (available words) with every try, as efficient as possible:

* Scores words by their contribution to _reducing the solution space_
    * Picks initial word to contain the most common letters
    * Accounts for letter occurance per position
    * Penetalizes duplicates initially
* Uses matched slots to guess / exclude likely letters


## Statistics

Considering a dataset of 12000 five letter words the algorithm __solves 96%__ of all puzzles in an average of __4.5 steps__.

```
npm run bench
```