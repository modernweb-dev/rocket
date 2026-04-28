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
    label: { type: String },
    ariaLabel: { type: String, attribute: 'aria-label' },
    siteName: { type: String },
  };

  constructor() {
    super();
    this.url = '';
    this.name = '';
    this.label = '';
    this.ariaLabel = '';
    this.siteName = '';
  }

  get accessibleLabel() {
    if (this.ariaLabel) {
      return this.ariaLabel;
    }

    const destination = this.siteName ? `${this.siteName} on ${this.name}` : this.name;
    return this.label ? `${this.label}: ${destination}` : destination;
  }

  render() {
    return html`
      <a
        class="social-link"
        href="${this.url}"
        aria-label="${this.accessibleLabel}"
        rel="noopener noreferrer"
        target="_blank"
        slot="social"
      >
        <span class="icon" aria-hidden="true">${getIcon(this.name)}</span>
        ${this.label ? html`<span class="label">${this.label}</span>` : html``}
      </a>
    `;
  }

  static styles = [
    css`
      :host {
        display: inline-block;
        height: var(--rocket-social-link-height, 30px);
        --rocket-social-link-color: var(--primary-text-color);
        --rocket-social-link-hover-color: var(--primary-color);
        --rocket-social-link-icon-size: 30px;
        --rocket-social-link-label-font-size: 0.95rem;
        --rocket-social-link-label-font-weight: 600;
      }

      .social-link {
        display: inline-flex;
        align-items: center;
        gap: var(--rocket-social-link-gap, 0.45rem);
        height: 100%;
        color: var(--rocket-social-link-color);
        line-height: 1;
        text-decoration: none;
      }

      .icon {
        display: inline-flex;
        flex: 0 0 auto;
        width: var(--rocket-social-link-icon-size);
        height: var(--rocket-social-link-icon-size);
      }

      .social-link svg {
        color: var(--rocket-social-link-icon-color, var(--rocket-social-link-color));
        display: block;
        width: 100%;
        height: 100%;
        transition: color 0.2s ease-in-out;
      }

      .label {
        color: var(--rocket-social-link-label-color, var(--rocket-social-link-color));
        font-size: var(--rocket-social-link-label-font-size);
        font-weight: var(--rocket-social-link-label-font-weight);
        line-height: 1.2;
        transition: color 0.2s ease-in-out;
        white-space: nowrap;
      }

      .social-link:hover svg {
        color: var(--rocket-social-link-hover-color);
        transform: scale(1.04);
        transition: transform 0.2s ease-in-out;
      }

      .social-link:hover .label {
        color: var(--rocket-social-link-hover-color);
      }

      :host([dark-background]) svg {
        color: #fff;
      }

      :host([dark-background]) .label {
        color: #fff;
      }

      :host([dark-background]) .social-link:hover svg,
      :host([dark-background]) .social-link:hover .label {
        color: var(--primary-text-color);
      }
    `,
  ];
}
