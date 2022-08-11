import { html, css, LitElement } from 'lit';
import { shared } from '../styles/shared.js';

export class SiteFooter extends LitElement {
  render() {
    return html`
      <footer>
        <div class="wrapper">
          <a href="./about.rocket.md">About</a>
        </div>
      </footer>
    `;
  }

  static styles = [
    shared,
    css`
      :host {
        display: block;
        background: #dcdcdc;
        padding: 20px;
      }
    `,
  ];
}
