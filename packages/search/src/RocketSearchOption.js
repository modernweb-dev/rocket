/* eslint-disable @typescript-eslint/ban-ts-comment */
import { css, html, unsafeHTML } from '@lion/core';
import { LionOption } from '@lion/listbox';
import { LinkMixin } from './LinkMixin.js';

const icons = {
  guides: new URL('../assets/guides.svg', import.meta.url).href,
  docs: new URL('../assets/docs.svg', import.meta.url).href,
  blog: new URL('../assets/blog.svg', import.meta.url).href,
  others: new URL('../assets/others.svg', import.meta.url).href,
};

/**
 * @param {string} section
 */
function getIcon(section) {
  const typedSection = /** @type {keyof icons} */ (section);
  return icons[typedSection] ? icons[typedSection] : icons['others'];
}

// @ts-expect-error https://github.com/microsoft/TypeScript/issues/40110
export class RocketSearchOption extends LinkMixin(LionOption) {
  static get properties() {
    return {
      title: {
        type: String,
      },
      text: {
        type: String,
      },
      section: {
        type: String,
      },
    };
  }

  constructor() {
    super();
    this.title = '';
    this.text = '';
    this.section = '';
  }

  static get styles() {
    return [
      css`
        :host([hidden]) {
          display: none;
        }

        :host(:hover) {
          background-color: var(--rocket-search-hover-background-color, #eee);
        }
        :host([active]) {
          background-color: var(--rocket-search-hover-background-color, #eee);
        }
        /* :host:hover,
        :host([active]) {
          background: #eee !important;
        } */

        :host([disabled]) {
          color: #adadad;
        }

        :host {
          display: block;
          cursor: pointer;
          position: relative;
          padding: 12px 10px;
          display: flex;
          align-items: center;
          font-weight: normal;
        }

        .icon {
          width: 50px;
          margin-right: 15px;
          flex-shrink: 0;
          align-self: start;
        }

        .title {
          margin-bottom: 4px;
        }

        .text {
          font-size: 14px;
        }

        strong {
          color: var(--rocket-search-highlight-color, #6c63ff);
        }

        @media screen and (min-width: 1024px) {
          :host {
            max-width: 600px;
          }
        }
      `,
    ];
  }

  render() {
    return html`
      <img class="icon" src=${getIcon(this.section)} />
      <div class="choice-field__label">
        <div class="title">${unsafeHTML(this.title)}</div>
        <div class="text">${unsafeHTML(this.text)}</div>
      </div>
    `;
  }
}
