import { readFileSync } from 'fs';
import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { createRequire } from 'module';

const { resolve } = createRequire(new URL('.', import.meta.url));

export class CardIcon extends LitElement {
  static properties = {
    icon: { type: String },
    variation: { type: String },
  };

  constructor() {
    super();
    this.icon = 'solid/exclamation-triangle';
  }

  static styles = css`
    :host {
      display: block;
    }

    :host {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      display: grid;
      place-items: center;

      fill: #8763ee;
      background-color: #efebfd;
    }

    .icon {
      width: 53%;
    }

    :host([variation='green']) {
      background-color: #defaeb;
      fill: #00d462;
    }

    :host([variation='blue']) {
      background-color: #e2ebfd;
      fill: #1f68f3;
    }
  `;

  render() {
    const iconString = readFileSync(resolve(`fontawesome-free/svgs/${this.icon}.svg`)).toString();

    return html` <div class="icon">${unsafeHTML(iconString)}</div> `;
  }
}
