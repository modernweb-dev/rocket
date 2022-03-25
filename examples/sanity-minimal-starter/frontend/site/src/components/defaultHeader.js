import { html, css, LitElement } from 'lit';
import { rocketWordmark } from '../icons/rocketWordmark.js';

class DefaultHeader extends LitElement {
  static styles = css`
    :host {
      display: flex;
    }
    header {
      display: flex;
    }
    .logo__container svg {
      height: 72px;
      width: auto;
    }
  `;

  render() {
    return html`
      <header>
        <div class="logo__container">${rocketWordmark}</div>
      </header>
    `;
  }
}

customElements.define('default-header', DefaultHeader);
