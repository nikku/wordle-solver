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
Enter result [+-???]: -?--?

  ⬜🟨⬜⬜🟨    cares    p=0.00, matched=_____, letters=[...](26), words=[...](12947)

Attempt #2 --- Choose spalt
Enter result [+-???]: ?-??-

  🟨⬜🟨🟨⬜    spalt    p=0.02, matched=_____, letters=[...](21), words=[...](196)

Attempt #3 --- Choose usual
Enter result [+-???]: +++++

  🟩🟩🟩🟩🟩    usual    p=0.05, matched=_____, letters=[ u, s, a, l, y ], words=[ usual, lyssa ]

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

The algorithm __solves 99%__ of all puzzles in an average of __4.4 steps__.

```
$ npm run bench
...
W=0.991 S=4.433 R=1500
```