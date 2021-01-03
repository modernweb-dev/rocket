import { css } from '@lion/core';
import { LionCombobox } from '@lion/combobox';
import { withDropdownConfig } from '@lion/overlays';

const tmpl = document.createElement('template');
tmpl.innerHTML = `
  <button arrow-left>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <path d="M34 20a.872.872 0 00-.428-.751L20.31 6.25a.875.875 0 00-1.226 1.25l11.861 11.625H6.875a.876.876 0 000 1.75H31.02L19.158 32.5a.877.877 0 00.613 1.5.87.87 0 00.612-.25l13.353-13.089a.876.876 0 00.264-.626l-.001-.017L34 20z" />
    </svg>
  </button>
`;

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
        }

        ::slotted([slot='prefix'][arrow-left]) {
          transform: rotate(180deg);
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

        :host([show-input]) ::slotted([slot='prefix'][arrow-left]) {
          display: block;
        }

        :host([show-input]) ::slotted([slot='prefix'][magnifying-glass]) {
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
            border-radius: 24px;
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
    return {
      showInput: { type: Boolean, reflect: true, attribute: 'show-input' },
    };
  }

  _connectSlotMixin() {
    if (!this.__isConnectedSlotMixin) {
      Object.keys(this.slots).forEach(slotName => {
        if (!this.querySelector(`[slot=${slotName}]`)) {
          const slotFactory = this.slots[slotName];
          let slotEls = slotFactory();
          if (!Array.isArray(slotEls)) {
            slotEls = [slotEls];
          }
          for (const slotEl of slotEls) {
            // ignore non-elements to enable conditional slots
            if (slotEl instanceof Element) {
              slotEl.setAttribute('slot', slotName);
              this.appendChild(slotEl);
              this.__privateSlots.add(slotName);
            }
          }
        }
      });
      this.__isConnectedSlotMixin = true;
    }
  }

  _defineOverlayConfig() {
    return {
      ...withDropdownConfig(),
      popperConfig: {
        placement: 'bottom-center',
        // modifiers: {
        //   ...parentConfig?.popperConfig?.modifiers,
        //   offset: {
        //     offset: 100,
        //     enabled: false,
        //   },
        //   keepTogether: {
        //     enabled: true,
        //   },
        //   arrow: {
        //     enabled: true,
        //   }
        // },
      },
    };
  }

  get slots() {
    return {
      ...super.slots,
      prefix: () => {
        const arrowLeft = document.importNode(tmpl.content, true).children[0];
        arrowLeft.addEventListener('click', () => {
          if (window.innerWidth < 1024) {
            this.showInput = false;
          }
        });

        tmpl.innerHTML = `
          <button magnifying-glass>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129">
              <path d="M51.6 96.7c11 0 21-3.9 28.8-10.5l35 35c.8.8 1.8 1.2 2.9 1.2s2.1-.4 2.9-1.2c1.6-1.6 1.6-4.2 0-5.8l-35-35c6.5-7.8 10.5-17.9 10.5-28.8 0-24.9-20.2-45.1-45.1-45.1-24.8 0-45.1 20.3-45.1 45.1 0 24.9 20.3 45.1 45.1 45.1zm0-82c20.4 0 36.9 16.6 36.9 36.9C88.5 72 72 88.5 51.6 88.5S14.7 71.9 14.7 51.6c0-20.3 16.6-36.9 36.9-36.9z"/>
            </svg>
          </button>
        `;
        const magnifyingClass = document.importNode(tmpl.content, true).children[0];

        magnifyingClass.addEventListener('click', () => {
          if (window.innerWidth < 1024) {
            this.showInput = true;
            this.updateComplete.then(() => {
              this._inputNode.focus();
            });
          } else {
            this._inputNode.focus();
          }
        });

        return [arrowLeft, magnifyingClass];
      },
    };
  }

  focus() {
    this._inputNode.focus();
  }

  constructor() {
    super();
    this.autocomplete = 'none';
    this.selectionFollowsFocus = false;
    this.rotateKeyboardNavigation = false;
    this.showInput = false;
  }
}
customElements.define('rocket-search-combobox', RocketSearchCombobox);
