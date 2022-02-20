# Wordle Solver

[![CI](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml/badge.svg)](https://github.com/nikku/wordle-solver/actions/workflows/CI.yml)

Get a little help solving your [Wordle](https://www.nytimes.com/games/wordle/index.html) puzzles. 


## Usage

Try the [demo](https://cdn.statically.io/gh/nikku/wordle-solver/v0.0.6/demo/index.html) or use via cli:

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


## The Algorithm<a name="algorithm"></a>

Chooses the next word which reduces the solution space as much as possible:

* Scores letter occurance per column
* Derives a word score
* Adds a penalty for letter duplicates 
* Uses matched slots to guess / exclude likely letters

Uses `cares` as the initial word.

Implemented in [`lib/solver.js`](./lib/solver.js), shows [decent performance](#performance).


## Performance

The [algorithm](#algorithm) __solves 99%__ of all puzzles in an average of __4.3 steps__.

```
$ npm run bench
...
W=0.991 S=4.373 R=1500
```
