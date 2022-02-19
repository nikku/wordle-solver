# Wordle Solver

[![CI](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml)

Get a little help solving your [Wordle](https://www.nytimes.com/games/wordle/index.html) puzzles.


## Usage

```
$ npx @nikku/wordle-solver

@nikku/wordle-solver solves a Wordle for you.

We'll provide you with a word to input to Wordle.
You feedback the result as a [+-???] encoded string:

  + = match
  ? = contained
  - = no match

-----

Attempt #1 --- Choose cares
Enter result [+-???]: +--??

  🟩⬜⬜🟨🟨    cares    p=0.00, matched=_____, letters=[...](26), words=[...](12947)

Attempt #2 --- Choose those
Enter result [+-???]: -++??

  ⬜🟩🟩🟨🟨    those    p=0.22, matched=c____, letters=[...](10), words=[...](10)

Attempt #3 --- Choose cigar
Enter result [+-???]: +++++

  🟩🟩🟩🟩🟩    cigar    p=0.64, matched=cho__, letters=[  ], words=[  ]

Well done!
```


## Algorithmic Details

The [solver](./lib/solver.js) attempts to reduce the solution space (available words) with every try, as efficient as possible:

* Scores words by their contribution to _reducing the solution space_
    * Picks initial word to contain the most common letters
    * Accounts for letter occurance per position
    * Penetalizes duplicates initially
* Uses matched slots to guess / exclude likely letters


## Statistics

In a large dataset of five letter words the algorithm __solves 96%__ of all puzzles in an average of __4.5 steps__.

```
npm run bench
```
