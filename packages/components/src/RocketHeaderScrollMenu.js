import { LitElement, html, css } from 'lit';

import { RocketContentArea } from './RocketContentArea.js';

if (!customElements.get('rocket-content-area')) {
  customElements.define('rocket-content-area', RocketContentArea);
}

export class RocketHeaderScrollMenu extends LitElement {
  render() {
    return html`
      <div class="header-inner">
        <rocket-content-area no-padding>
          <div class="header-logo"></div>
          <nav class="header-navigation">
            <slot id="content"></slot>
          </nav>
        </rocket-content-area>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        position: sticky;
        height: 100px;
        top: -50px; /* height - .header-inner height => 100-50 = 50 */
        z-index: 100;
      }

      .header-inner {
        height: 50px;
        position: sticky;
        top: 0;
        width: 100%;
        padding-right: var(--rocket-header-scroll-menu-padding-right, 0);
        text-align: var(--rocket-header-scroll-menu-text-align, center);
      }

      ::slotted(a) {
        text-decoration: none;
        padding: 0.25rem;
        line-height: 50px;
      }

      @media screen and (min-width: 1024px) {
        ::slotted(a) {
          padding: 0.75rem;
        }
      }
    `,
  ];
}
