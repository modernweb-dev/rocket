import { readFileSync } from 'fs';
import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { createRequire } from 'module';

const { resolve } = createRequire(new URL('.', import.meta.url));

export class ServerIcon extends LitElement {
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
      line-height: 1;
      vertical-align: middle;
    }
    svg {
      width: 1em;
      height: 1em;
    }
  `;

  render() {
    const iconString = readFileSync(resolve(`fontawesome-free/svgs/${this.icon}.svg`)).toString();

    return html`${unsafeHTML(iconString)}`;
  }
}
