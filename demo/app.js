import {
  suggest
} from '../lib/index.js';

import {
  solutions,
  words
} from '../lib/dictionary.js';

import {
  html,
  render,
  useState,
  useCallback,
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
      return {
        error: {
          message: 'Enter five letter word',
          type: 'word',
          value: l1
        },
        history
      };
    }

    if (!match) {
      return {
        error: {
          message: 'Enter match string [??--+]',
          type: 'match',
          value: l2
        },
        history
      };
    }

    history.push([ word.toLowerCase(), match ]);
  }

  return {
    history
  };
}

const PLACEHOLDER = `SOARE
?+---
HANDS
----?`

function WordleSolver(props) {

  const [ suggestion, setSuggestion ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ progress, setProgress ] = useState(null);

  const [ text, setText ] = useState(getTextFromUrl(`SOARE
`));

  useEffect(() => {
    setTextToUrl(text);
  }, [ text ]);

  useEffect(() => {

    const lines = text.split(/\n/);

    const {
      error,
      history
    } = parseHistory(lines);

    if (history) {

      const {
        progress,
        word,
        wordsByRank
      } = suggest(history, words, solutions);

      setError(null);
      setSuggestion(error && error.type === 'match' ? null : {
        word,
        wordsByRank
      });

      setProgress(progress);
    }

    if (error) {
      setError(error);
    }

  }, [ text ]);

  const handleKeyUp = useCallback(() => {
    event.preventDefault();

    setText(event.target.value);
  }, []);

  return html`
    <div class="solver">
      <div class="column input-column">
        <textarea autoFocus placeholder=${ PLACEHOLDER } spellCheck="false" onKeyup=${ handleKeyUp } value=${text}></textarea>
      </div>

      <div class="column output-column">
        ${ error && html`
          <div class="error panel">
            <p class="text">${ error.value && html`<span class="highlight">${error.value}</span> ` }${ error.message }</p>
          </div>
        ` }
        <div class="details">
          <div class="column">
            ${ progress && html`
              <div class="suggestion panel">
                <h3>Matched</h3>

                <p class="text">
                  <span class="highlight">${ progress.matched.map(m => m || '_').join('') }</span>
                </p>
              </div>
            ` }
            ${ progress && html`
              <div class="suggestion panel">
                <h3>Remaining words</h3>

                <p class="text">
                  ${ progress.remainingWords.length > 24
                    ? html`[...](${ progress.remainingWords.length })`
                    : html`[ ${ progress.remainingWords.map(w => html`<span class="entry">${w}</span>`) } ]`
                  }
                </p>
              </div>
            ` }
            ${ progress && html`
              <div class="suggestion panel">
                <h3>Remaining letters</h3>

                <p class="text">
                  ${ progress.remainingLetters.length > 12
                    ? html`[...](${ progress.remainingLetters.length })`
                    : html`[ ${ progress.remainingLetters.map(w => html`<span class="entry">${w}</span>`) } ]`
                  }
                </p>
              </div>
            ` }
            ${ suggestion && html`
              <div class="suggestion panel">
                <h3>Suggested word</h3>

                <p class="text">
                  <span class="highlight">${ suggestion.word }</span>
                </p>
              </div>
            ` }
          </div>

          ${ suggestion && html`
            <div class="column details-column">
                <div class="suggestion panel">
                  <h3>Word ranks</h3>

                  <ul class="text">
                    ${ suggestion.wordsByRank.slice(0, 10).map(([word, rank]) => html`
                      <li class="entry">${word} (${ Number(rank).toFixed(3) })</li>
                    `) }
                  </p>
                </div>
            </div>
          ` }
        </div>
      </div>
    </div>
  `
}

render(html`<${WordleSolver} />`, document.querySelector('#widget'));


// helpers ////////////

function getTextFromUrl(fallbackText) {
  const url = new URL(window.location.href);

  const params = url.searchParams;

  return params.get('h') || fallbackText;
}

function setTextToUrl(text) {
  const url = new URL(window.location.href);

  const params = url.searchParams;

  if (!text.trim()) {
    params.delete('h');
  } else {
    params.set('h', text);
  }

  window.history.pushState({}, null, url.toString());
}