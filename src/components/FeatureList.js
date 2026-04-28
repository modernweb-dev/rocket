import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/** @typedef {import('@rocket/js/types.js').Feature} Feature */

export class FeatureList extends LitElement {
  static properties = {
    features: { type: Array },
  };

  constructor() {
    super();
    /** @type {Feature[]} */
    this.features = [];
  }

  static styles = css`
    :host {
      display: block;
      margin: 4rem auto 200px auto;
      max-width: 1200px;
      width: 100%;
      --color-white: white;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2.5rem;
    }
    .feature-card {
      background: var(--color-white);
      padding: 2rem 3rem;
      border-radius: 1rem;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease-in-out;
    }
    .feature-card:hover {
      transform: translateY(-4px);
    }
    .feature-card span {
      font-size: 1.8rem;
      margin-right: 0.5rem;
    }
    .feature-card h3 {
      font-size: 1.6rem;
      margin: 0.5rem 0;
      color: var(--primary-text-color);
    }
    .feature-card p {
      font-size: 1.2rem;
    }
    /* stagger every even card downwards */
    .feature-card:nth-child(2n) {
      transform: translateY(50%);
    }
    .feature-card:nth-child(2n):hover {
      transform: translateY(calc(50% - 4px));
    }
    span svg {
      width: 1em;
      transform: translateY(5px);
    }

    @media (max-width: 910px) {
      :host {
        margin-bottom: 100px;
      }

      .features {
        grid-template-columns: 1fr;
        padding: 0 1.5rem;
        gap: 1.5rem;
      }

      .feature-card {
        padding: 1.5rem 2rem;
      }

      .feature-card:nth-child(2n) {
        transform: none; /* disable stagger */
      }

      .feature-card:nth-child(2n):hover {
        transform: translateY(-4px);
      }

      .feature-card h3 {
        font-size: 1.4rem;
      }

      .feature-card p {
        font-size: 1rem;
      }
    }
  `;

  render() {
    return html`
      <div class="features">
        ${this.features.map(
          card => html`
            <div class="feature-card">
              <h3>
                <span> ${card.icon.startsWith('<svg') ? unsafeHTML(card.icon) : card.icon} </span>
                ${card.title}
              </h3>
              <p>${card.description}</p>
            </div>
          `,
        )}
      </div>
    `;
  }
}
