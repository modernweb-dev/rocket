import { readFileSync } from 'fs';
import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/**
 * @param {string} brandName
 * @returns {import('lit/directive.js').DirectiveResult}
 */
function getIcon(brandName) {
  const brand = brandName.toLowerCase();
  const fileContent = readFileSync(new URL(`./assets/${brand}.svg`, import.meta.url), 'utf8');
  return unsafeHTML(fileContent.toString());
}

export class RocketSocialLink extends LitElement {
  static properties = {
    url: { type: String },
    name: { type: String },
    siteName: { type: String },
  };

  render() {
    return html`
      <a
        class="social-link"
        href="${this.url}"
        aria-label="${this.siteName} on ${this.name}"
        rel="noopener noreferrer"
        target="_blank"
        slot="social"
      >
        <span class="sr-only">${this.name}</span>
        ${getIcon(this.name)}
      </a>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        width: 30px;
        height: 30px;
        margin-right: 15px;
      }

      svg {
        color: var(--primary-text-color);
        transition: color 0.3s ease-in-out;
      }
      svg:hover {
        color: var(--primary-color);
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      :host([dark-background]) svg {
        color: #fff;
      }
      :host([dark-background]) svg:hover {
        color: var(--primary-text-color);
      }
    `,
  ];
}
