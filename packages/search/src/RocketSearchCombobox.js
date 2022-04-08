/* eslint-disable @typescript-eslint/ban-ts-comment */
import { css } from '@lion/core';
import { LionCombobox } from '@lion/combobox';
import { withDropdownConfig } from '@lion/overlays';

const closeBtnTmpl = document.createElement('template');
closeBtnTmpl.innerHTML = `
  <button close-btn aria-label="Back">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
`;

const searchBtnTmpl = document.createElement('template');
searchBtnTmpl.innerHTML = `
  <button search-btn aria-label="Search">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129">
      <path d="M51.6 96.7c11 0 21-3.9 28.8-10.5l35 35c.8.8 1.8 1.2 2.9 1.2s2.1-.4 2.9-1.2c1.6-1.6 1.6-4.2 0-5.8l-35-35c6.5-7.8 10.5-17.9 10.5-28.8 0-24.9-20.2-45.1-45.1-45.1-24.8 0-45.1 20.3-45.1 45.1 0 24.9 20.3 45.1 45.1 45.1zm0-82c20.4 0 36.9 16.6 36.9 36.9C88.5 72 72 88.5 51.6 88.5S14.7 71.9 14.7 51.6c0-20.3 16.6-36.9 36.9-36.9z"/>
    </svg>
  </button>
`;

/**
 * @cssprop [--rocket-search-fill-color=#000]
 * @cssprop [--rocket-search-background-color=#fff]
 * @cssprop [--rocket-search-input-overlay-border-color=#ccc]
 * @cssprop [--rocket-search-input-border-color=#dfe1e5]
 * @cssprop [--rocket-search-input-border-radius=24px]
 * @slot prefix
 * @slot label
 * @slot listbox
 * @slot input
 * @type {String}
 */
export class RocketSearchCombobox extends LionCombobox {
  static get styles() {
    return [
      super.styles,
      css`
        ::slotted([slot='label']) {
          display: none;
        }

        ::slotted([slot='prefix']) {
          width: 25px;
          font-family: inherit; /* 1 */
          font-size: 100%; /* 1 */
          line-height: 1.15; /* 1 */
          margin: 0; /* 2 */
          background: none;
          color: inherit;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
          fill: var(--rocket-search-fill-color, #000);
          display: flex;
          align-items: center;
        }

        ::slotted([slot='prefix'][close-btn]) {
          height: 25px;
          display: none;
        }

        ::slotted([slot='listbox']) {
          max-height: calc(100vh - 70px);
          background: var(--rocket-search-background-color, #fff);
        }

        .input-group__container {
          border: none;
        }

        .input-group {
          display: flex;
          flex-flow: column;
          justify-content: center;
        }

        ::slotted([slot='input']) {
          font-size: 25px;
          line-height: 25px;
          margin: 0;
          background: transparent;
          color: inherit;
        }

        .input-group__input {
          display: none;
        }

        /** Showing the input */

        :host([show-input]) {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100vh;
          background: var(--rocket-search-background-color, #fff);
        }

        :host([show-input]) ::slotted([slot='prefix'][close-btn]) {
          display: block;
        }

        :host([show-input]) ::slotted([slot='prefix'][search-btn]) {
          display: none;
        }

        :host([show-input]) .input-group {
          height: 70px;
          border-bottom: 1px solid var(--rocket-search-input-overlay-border-color, #ccc);
        }

        :host([show-input]) .input-group__prefix {
          padding: 0 20px 0 10px;
        }

        :host([show-input]) .input-group__input {
          display: block;
        }

        /** Undo Popper only for mobile */
        @media screen and (max-width: 1024px) {
          #overlay-content-node-wrapper {
            position: static !important;
            width: auto !important;
            transform: none !important;
          }
        }

        @media screen and (min-width: 1024px) {
          /* desktop */

          :host {
            background: transparent;
          }

          .input-group__input {
            display: block;
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

          #overlay-content-node-wrapper {
            max-height: 60vh;
            overflow: auto;
            box-shadow: 0 4px 6px rgba(32, 33, 36, 0.28);
          }

          ::slotted([slot='listbox']) {
            max-height: none;
          }
        }
      `,
    ];
  }

  static get properties() {
    return /** @type {typeof LionCombobox['properties'] & { showInput: import("lit").PropertyDeclaration } } */ ({
      showInput: { type: Boolean, reflect: true, attribute: 'show-input' },
    });
  }

  _connectSlotMixin() {
    if (!this.__isConnectedSlotMixin) {
      Object.keys(this.slots).forEach(slotName => {
        if (!this.querySelector(`[slot=${slotName}]`)) {
          const slotFactory = this.slots[slotName];
          /** @type {HTMLElement | undefined | HTMLElement[]} */
          // @ts-ignore
          let slotEls = slotFactory();
          if (!slotEls) return;
          if (!Array.isArray(slotEls)) {
            slotEls = [slotEls];
          }
          for (const slotEl of slotEls) {
            // ignore non-elements to enable conditional slots
            if (slotEl instanceof Element) {
              slotEl.setAttribute('slot', slotName);
              this.appendChild(slotEl);
              // @ts-expect-error: explicitly using private field on LionCombobox
              this.__privateSlots.add(slotName);
            }
          }
        }
      });
      this.__isConnectedSlotMixin = true;
    }
  }

  _defineOverlayConfig() {
    /** @type {'bottom'} */
    const placement = 'bottom';
    return {
      ...withDropdownConfig(),
      popperConfig: {
        placement,
      },
    };
  }

  /** @type {LionCombobox['slots']} */
  get slots() {
    return {
      ...super.slots,
      prefix: () => {
        // @ts-ignore
        const [closeButton] = closeBtnTmpl.content.cloneNode(true).children;
        closeButton.addEventListener('click', () => {
          if (window.innerWidth < 1024) {
            this.showInput = false;
          }
        });

        // @ts-ignore
        const [searchButton] = searchBtnTmpl.content.cloneNode(true).children;

        searchButton.addEventListener('click', () => {
          if (window.innerWidth < 1024) {
            this.showInput = true;
            this.updateComplete.then(() => {
              this._inputNode.focus();
            });
          } else {
            this._inputNode.focus();
          }
        });

        return [closeButton, searchButton];
      },
    };
  }

  focus() {
    this._inputNode.focus();
  }

  constructor() {
    super();
    /** @type {'none'} */
    this.autocomplete = 'none';
    this.selectionFollowsFocus = false;
    this.rotateKeyboardNavigation = false;
    this.showInput = false;
  }
}

customElements.define('rocket-search-combobox', RocketSearchCombobox);
