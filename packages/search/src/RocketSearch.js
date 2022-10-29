import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { repeat } from 'lit/directives/repeat.js';
import MiniSearch from 'minisearch';
import { highlightSearchTerms, joinTitleHeadline } from './utils-shared.js';

/** @typedef {import('../types/main.js').RocketSearchResult} RocketSearchResult */

/**
 * Wait for all dialog animations to complete their promises
 *
 * @param {HTMLElement} element
 */
function animationsComplete(element) {
  return Promise.allSettled(element.getAnimations().map(animation => animation.finished));
}

export class RocketSearch extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    jsonUrl: { type: String, attribute: 'json-url' },
    search: { type: String },
    results: { type: Array },
    maxResults: { type: Number, attribute: 'max-results' },
    noResultsText: { type: String },
    selectedIndex: { type: Number },
  };

  constructor() {
    super();
    this.open = false;
    this.jsonUrl = '';
    this.search = '';
    this.maxResults = 10;
    this.selectedIndex = -1;
    this.noResultsText = 'No results found';
    this.__isSetup = false;
    /**
     * @type {RocketSearchResult[]}
     */
    this.results = [];
    /** @type {MiniSearch|null} */
    this.miniSearch = null;
  }

  /**
   * Fetches the search index at `this.jsonUrl` and sets up the search engine.
   *
   * @return {Promise<void>}
   */
  async setupSearch() {
    if (this.__isSetup) {
      return;
    }
    if (!this.jsonUrl) {
      throw new Error(
        'You need to provide a URL to your JSON index. For example: <rocket-search json-url="https://.../search-index.json"></rocket-search>',
      );
    }

    let responseText;
    try {
      const response = await fetch(this.jsonUrl);
      responseText = await response.text();
    } catch (e) {
      throw new Error(`The given json-url "${this.jsonUrl}" could not be fetched.`);
    }

    if (responseText[0] !== '{') {
      throw new Error(`The given json-url "${this.jsonUrl}" could not be fetched.`);
    }

    // @ts-ignore
    this.miniSearch = MiniSearch.loadJSON(responseText, {
      fields: ['title', 'headline', 'body'],
      searchOptions: {
        boost: { headline: 3, title: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
    this.__isSetup = true;
  }

  render() {
    return html`
      <slot name="invoker">
        <div class="input-group__container">
          <div class="input-group__prefix">
            <label for="search-input" id="search-label">
              <span class="sr-only">Search:</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129">
                <path
                  d="M51.6 96.7c11 0 21-3.9 28.8-10.5l35 35c.8.8 1.8 1.2 2.9 1.2s2.1-.4 2.9-1.2c1.6-1.6 1.6-4.2 0-5.8l-35-35c6.5-7.8 10.5-17.9 10.5-28.8 0-24.9-20.2-45.1-45.1-45.1-24.8 0-45.1 20.3-45.1 45.1 0 24.9 20.3 45.1 45.1 45.1zm0-82c20.4 0 36.9 16.6 36.9 36.9C88.5 72 72 88.5 51.6 88.5S14.7 71.9 14.7 51.6c0-20.3 16.6-36.9 36.9-36.9z"
                />
              </svg>
            </label>
          </div>
          <div class="input-group__input">
            <input
              type="text"
              id="search-input"
              @input=${this._onInput}
              @focusin=${this.setupSearch}
              @keydown=${this._onKeyDown}
            />
          </div>
        </div>
      </slot>
      <dialog @close=${this.close}>
        <div id="close">
          <slot name="close">
            <button class="close" aria-label="close" @click=${this.close}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.775 460.775">
                <path
                  d="M285.08 230.397 456.218 59.27c6.076-6.077 6.076-15.911 0-21.986L423.511 4.565a15.55 15.55 0 0 0-21.985 0l-171.138 171.14L59.25 4.565a15.551 15.551 0 0 0-21.985 0L4.558 37.284c-6.077 6.075-6.077 15.909 0 21.986l171.138 171.128L4.575 401.505c-6.074 6.077-6.074 15.911 0 21.986l32.709 32.719a15.555 15.555 0 0 0 21.986 0l171.117-171.12 171.118 171.12a15.551 15.551 0 0 0 21.985 0l32.709-32.719c6.074-6.075 6.074-15.909 0-21.986L285.08 230.397z"
                />
              </svg>
            </button>
          </slot>
        </div>
        <div id="content">
          ${repeat(
            this.results,
            result => result.id,
            (result, index) => html`
              <a
                href="${result.id}"
                rel="noopener noreferrer"
                class="result"
                ?selected=${this.selectedIndex === index}
              >
                <span class="result__title"
                  >${unsafeHTML(getTitle({ result, search: this.search }))}</span
                >
                <span class="result__text"
                  >${unsafeHTML(getText({ result, search: this.search }))}</span
                >
              </a>
            `,
          )}
        </div>
      </dialog>
    `;
  }

  /** @param {Event & { target: HTMLInputElement }} ev */
  _onInput(ev) {
    this.search = ev.target.value;
    this.selectedIndex = -1;
  }

  /**
   *
   * @param {KeyboardEvent} ev
   */
  _onKeyDown(ev) {
    switch (ev.code) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowDown':
        this.selectedIndex =
          this.selectedIndex < this.results.length - 1 ? this.selectedIndex + 1 : 0;
        ev.preventDefault();
        break;
      case 'ArrowUp':
        this.selectedIndex =
          this.selectedIndex > 0 ? this.selectedIndex - 1 : this.results.length - 1;
        ev.preventDefault();
        break;
      case 'Enter':
        if (this.selectedIndex >= 0) {
          document.location = this.results[this.selectedIndex].id;
        }
    }
  }

  close() {
    this.open = false;
  }

  show() {
    this.open = true;
  }

  /** @param {import('lit-element').PropertyValues } changedProperties */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('open')) {
      if (this.open) {
        this.showModal();
      } else {
        this._close();
      }
    }
  }

  /** @param {import('lit-element').PropertyValues } changedProperties */
  update(changedProperties) {
    if (this.miniSearch && changedProperties.has('search')) {
      if (this.search.length > 1) {
        this.results = /** @type {RocketSearchResult[]} */ (
          // @ts-ignore
          this.miniSearch.search(this.search)
        ).slice(0, this.maxResults);
        if (this.results.length > 0) {
          this.open = true;
        }
      } else {
        this.open = false;
      }
    }

    super.update(changedProperties);
  }

  alignDialogToInvoker() {
    if (!this._dialog) {
      return;
    }
    const bounds = this.getBoundingClientRect();
    let left = bounds.left + bounds.width / 2 - this._dialog.clientWidth / 2 - 10;
    if (left < 0) {
      left = 10;
    }
    this._dialog.style.marginTop = `${bounds.y + bounds.height + 5}px`;
    if (window.innerWidth >= 768) {
      this._dialog.style.marginLeft = left + 'px';
    }
  }

  /** @param {import('lit-element').PropertyValues } changedProperties */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (!this.shadowRoot) {
      return;
    }
    this._dialog = this.shadowRoot.querySelector('dialog');
    this._searchInput = this.shadowRoot.querySelector('input');
  }

  async _close() {
    if (this._dialog) {
      this._dialog.setAttribute('inert', '');
      this._dialog.dispatchEvent(new Event('closing'));
      await animationsComplete(this._dialog);
      this._dialog.dispatchEvent(new Event('closed'));
      // @ts-ignore
      this._dialog.close();
    }
  }

  async showModal() {
    if (!this._dialog || !this._searchInput) {
      return;
    }

    this.alignDialogToInvoker();
    // @ts-ignore
    this._dialog.show();
    this._dialog.dispatchEvent(new Event('opening'));
    this._searchInput.focus();
    await animationsComplete(this._dialog);
    this._dialog.dispatchEvent(new Event('opened'));
    this._dialog.removeAttribute('inert');

    // const focusTarget = this.querySelector('[autofocus]');
    // focusTarget ? focusTarget.focus() : this.shadowRoot.querySelector('button.close').focus();
  }

  async toggle() {
    this.open = !this.open;
  }

  focus() {
    if (this._searchInput) {
      this._searchInput.focus();
    }
  }

  static styles = [
    css`
      :host {
        display: block;
        --rd-surface-1: var(--surface-1, #f8f9fa);
        --rd-surface-2: var(--surface-2, #e9ecef);
        --rd-surface-3: var(--surface-3, #dee2e6);
        --rd-text-1: var(--text-1, #212529);
        /* shadow */
        --rd-shadow-color: 220 3% 15%;
        --rd-shadow-strength: 1%;
        --rd-shadow-2: 0 3px 5px -2px hsl(var(--rd-shadow-color) /
                calc(var(--rd-shadow-strength) + 3%)),
          0 7px 14px -5px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 5%));
        --rd-shadow-6: 0 -1px 2px 0 hsl(var(--rd-shadow-color) /
                calc(var(--rd-shadow-strength) + 2%)),
          0 3px 2px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 3%)),
          0 7px 5px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 3%)),
          0 12px 10px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 4%)),
          0 22px 18px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 5%)),
          0 41px 33px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 6%)),
          0 100px 80px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 7%));
        /* size */
        --rd-size-3: var(--size-3, 1rem);
        --rd-size-5: var(--size-5, 1.5rem);
        /* animations */
        --rd-ease-3: cubic-bezier(0.25, 0, 0.3, 1);
        --rd-animation-slide-out-down: var(
          --animation-slide-out-down,
          slide-out-down 0.5s var(--rd-ease-3)
        );
        --rd-animation-slide-in-up: var(--animation-slide-in-up, slide-in-up 0.5s var(--rd-ease-3));
      }

      #close {
        position: absolute;
        right: 0;
        top: 0;
      }

      button {
        background: none;
        border: none;
        width: 30px;
        fill: var(--rd-text-1);
        padding: 5px;
        margin: 5px;
        display: block;
      }

      button svg {
        display: block;
      }

      /*****************************
      * input
      *****************************/
      #search-input {
        display: block;
        padding: 0;
        margin-right: 15px;
        font-size: 22px;
        border: none;
        outline: none;
        width: 15ch;
      }

      .input-group__container {
        position: relative;
        background: var(--rocket-search-background-color, #fff);
        display: flex;
        border: 1px solid var(--rocket-search-input-border-color, #dfe1e5);
        box-shadow: none;
        border-radius: var(--rocket-search-input-border-radius, 24px);
        padding: 5px 0;
      }

      .input-group {
        margin-bottom: 16px;
        max-width: 582px;
        margin: auto;
        font-size: 20px;
        line-height: 20px;
      }

      .input-group__prefix,
      .input-group__suffix {
        display: flex;
        place-items: center;
        padding: 0 10px 0 15px;
      }

      .input-group__input {
        display: flex;
        place-items: center;
      }

      #search-label svg {
        width: 20px;
        height: 20px;
        display: block;
      }

      /** no way to override https://twitter.com/daKmoR/status/1528305586466697216?s=20&t=wBoqkZc3jfjFIJZJd21p_g
      @media (prefers-color-scheme: dark) {
        :host {
          --rd-surface-1: var(--surface-1, #212529);
          --rd-surface-2: var(--surface-2, #343a40);
          --rd-surface-3: var(--surface-3, #495057);
          --rd-text-1: var(--text-1, #f1f3f5);
          --rd-shadow-color: 220 40% 2%;
          --rd-shadow-strength: 25%;
        }
      }
      */

      dialog {
        display: block;
        background: var(--rd-surface-2);
        color: var(--rd-text-1);
        width: 100vw;
        max-height: 100vh;
        margin: 0;
        padding: 0;
        position: fixed;
        inset: 0;
        border: none;
        box-shadow: var(--rd-shadow-6);
        z-index: 2147483647;
        overflow: hidden;
        transition: opacity 0.5s var(--rd-ease-3);
      }

      @media screen and (min-width: 1024px) {
        dialog {
          width: min(80vw, 60ch);
        }
      }

      @media (prefers-reduced-motion: no-preference) {
        dialog {
          animation: var(--rd-animation-slide-out-down) forwards;
          animation-timing-function: var(--ease-squish-3);
        }
      }

      /** no way to override https://twitter.com/daKmoR/status/1528305586466697216?s=20&t=wBoqkZc3jfjFIJZJd21p_g
      @media (prefers-color-scheme: dark) {
        dialog {
          -webkit-border-before: 1px solid var(--_rg-surface-3);
          border-block-start: 1px solid var(--_rg-surface-3);
        }
      }
      */

      dialog:not([open]) {
        pointer-events: none;
        opacity: 0;
      }

      dialog::-webkit-backdrop {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        -webkit-transition: -webkit-backdrop-filter 0.5s ease;
        transition: -webkit-backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease;
      }

      dialog::backdrop {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        transition: -webkit-backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease;
      }

      @media (prefers-reduced-motion: no-preference) {
        dialog[open] {
          animation: var(--rd-animation-slide-in-up) forwards;
        }
      }

      @keyframes slide-in-up {
        from {
          transform: translateY(100%);
        }
      }

      @keyframes slide-out-down {
        to {
          transform: translateY(100%);
        }
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      .result {
        display: block;
        color: var(--rd-text-1);
        padding: 10px 10px 9px 10px;
        text-decoration: none;
        border: 1px solid transparent;
        border-bottom-color: #ccc;
      }

      .result:last-child {
        border-bottom-color: transparent;
      }

      .result__title {
        display: block;
        font-size: 1.15rem;
        padding-bottom: 3px;
      }

      .result__text {
        font-size: 0.85rem;
      }

      .result[selected] {
        border-color: blue;
      }
    `,
  ];
}

/**
 * @param {object} options
 * @param {RocketSearchResult} options.result
 * @param {string} options.search
 */
function getTitle({ result, search }) {
  const { terms, title, headline } = result;

  const header = joinTitleHeadline(title, headline);
  return highlightSearchTerms({ text: header, search, terms });
}

/**
 * @param {object} options
 * @param {RocketSearchResult} options.result
 * @param {string} options.search
 */
function getText({ result, search }) {
  const { terms, body } = result;

  return highlightSearchTerms({ text: body, search, terms, addEllipsis: true });
}
