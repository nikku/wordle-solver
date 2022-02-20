import {
  suggest
} from '../lib/index.js';

import {
  words
} from '../lib/dictionary.js';

import {
  html,
  render,
  useState,
  useMemo,
  useEffect
} from 'https://unpkg.com/htm/preact/standalone.module.js';


function parseHistory(lines) {
  const history = [];

  for (let i = 0; i < Math.ceil(lines.length / 2); i++) {

    const l1 = lines[i * 2];
    const l2 = lines[i * 2 + 1] || '';

    const word = /^\w{5}$/.test(l1) ? l1 : null;
    const match = /^[+-?]{5}$/.test(l2) ? Array.from(l2) : null;

    if (!word) {

      if (!l1.trim()) {
        return {
          error: 'Enter five letter word',
          history
        };
      } else {
        return {
          error: `failed to parse <${l1}>: enter 5 letter word`,
          history
        };
      }
    }

    if (!match) {
      if (!l2.trim()) {
        return {
          error: 'Enter match string [??--+]',
          history
        };
      } else {
        return {
          error: `failed to parse <${l2}>: enter match string, e.g. ?--?+`,
          history
        };
      }
    }

    history.push([ word.toLowerCase(), match ]);
  }

  return {
    history
  };
}


function WordleSolver(props) {

  const [ suggestion, setSuggestion ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ progress, setProgress ] = useState(null);

  const [ text, setText ] = useState(`CIGAR
?+---
HANDS
----?`);

  useEffect(() => {

    const lines = text.split(/\n/);

    const {
      error,
      history
    } = parseHistory(lines);

    if (history) {

      const {
        progress,
        word
      } = suggest(history, words);

      setError(null);
      setSuggestion(word);
      setProgress(progress);
    }

    if (error) {
      setError(error);
    }

  }, [ text ]);

  const handleKey = useMemo(() => {
    return (event) => {
      setText(event.target.value);
    };
  });

  return html`
    <div class="solver">
      <div class="column input-column">
        <textarea onKeyup=${ handleKey }>${text}</textarea>
      </div>

      <div class="column output-column">
        ${ error && html`
          <div class="error panel">
            <p class="text">${ error }</p>
          </div>
        `}
        ${ progress && html`
          <div class="suggestion panel">
            <h3>Matched</h3>

            <p class="text">
              ${ progress.matched.map(m => m || '_').join('') }
            </p>
          </div>
        `}
        ${ progress && html`
          <div class="suggestion panel">
            <h3>Remaining words</h3>

            <p class="text">
              ${ progress.remainingWords.length > 6
                ? html`[...](${ progress.remainingWords.length })`
                : html`[ ${ progress.remainingWords.map(w => html`<span class="entry">${w}</span>`) } ]`
              }
            </p>
          </div>
        `}
        ${ progress && html`
          <div class="suggestion panel">
            <h3>Remaining letters</h3>

            <p class="text">
              ${ progress.remainingLetters.length > 6
                ? html`[...](${ progress.remainingLetters.length })`
                : html`[ ${ progress.remainingLetters.map(w => html`<span class="entry">${w}</span>`) } ]`
              }
            </p>
          </div>
        `}
        ${ suggestion && html`
          <div class="suggestion panel">
            <h3>Suggested word</h3>

            <p class="text">
              ${ suggestion }
            </p>
          </div>
        `}
      </div>
    </div>
  `
}

render(html`<${WordleSolver} />`, document.querySelector('#widget'));