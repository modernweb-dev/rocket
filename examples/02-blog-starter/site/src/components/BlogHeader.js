import { html, css, LitElement } from 'lit';
import { shared } from '../styles/shared.js';

export class BlogHeader extends LitElement {
  static properties = {
    name: { type: String },
    href: { type: String },
  };

  render() {
    return html`
      <header class="wrapper">
        <article>
          <h1>
            <a href="/">
              <img src="resolve:@rocket/engine/assets/logo.svg" class="logo" />
              <span>My Blog</span>
            </a>
          </h1>
        </article>
      </header>
    `;
  }

  static styles = [
    shared,
    css`
      header {
        padding-top: 1rem;
        padding-bottom: 1rem;
        height: 5rem;
      }
      article {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .header-subitem {
        display: flex;
        flex-grow: 0;
        gap: 0.5em;
        align-items: center;
        justify-content: center;
        color: var(--theme-text-lighter);
        font-size: initial;
        padding: 0.5rem;
      }
      .header-subitem:hover {
        color: var(--theme-accent);
      }
      .header-subitem svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      @media (max-width: 32em) {
        .header-subitem {
          display: none;
        }
      }

      h1 {
        margin: 0;
        font-size: 1.5rem;
        max-width: 100%;
        display: flex;
        flex-grow: 1;
      }

      img {
        width: 2.5rem;
        height: 2.5rem;
      }

      span {
        margin-left: 0.5rem;
      }

      h1 a {
        text-decoration: none;
        display: inline-flex;
      }
    `,
  ];
}

customElements.define('blog-header', BlogHeader);
