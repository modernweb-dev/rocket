import { LitElement, html, css } from 'lit';

/** @typedef {import('@rocket/js/types.js').FooterSection} FooterSection */

export class Footer extends LitElement {
  static properties = {
    data: { type: Array },
  };

  constructor() {
    super();
    /** @type {FooterSection[]} */
    this.data = [];
  }

  /** @param {FooterSection} section */
  renderSection(section) {
    return html`
      <nav>
        <h3>${section.title}</h3>
        <ul>
          ${section.links.map(link => html`<li><a href=${link.href}>${link.text}</a></li>`)}
        </ul>
      </nav>
    `;
  }

  render() {
    return html`
      <footer class="main-footer">
        <div class="footer-menu">${this.data?.map(section => this.renderSection(section))}</div>
      </footer>
    `;
  }

  static styles = [
    css`
      .main-footer {
        margin-top: 112px;
        border-top: 1px solid #edf1f6;
        background-color: #f8fafc;
        color: var(--primary-text-color);
        padding: 30px 0 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .footer-menu {
        display: flex;
        justify-content: center;
        gap: clamp(2.5rem, 7vw, 5.5rem);
        flex-direction: row;
        max-width: 1200px;
        width: 100%;
        padding: 0 20px;
        text-align: center;
        flex-wrap: wrap;
      }

      .footer-menu nav {
        min-width: 150px;
      }

      .footer-menu nav h3 {
        margin: 0 0 10px;
        color: var(--primary-text-color-dark);
        font-size: 0.9rem;
        font-weight: 700;
      }

      .footer-menu ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .footer-menu li {
        margin-bottom: 4px;
      }

      .footer-menu a {
        text-decoration: none;
        color: var(--secondary-text-color, #4b5563);
        padding: 5px 0;
        display: block;
        font-size: 0.84rem;
        font-weight: 400;
        line-height: 1.4;
        transition: opacity 0.2s;
      }

      .footer-menu a:hover {
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .footer-menu {
          flex-direction: column;
          align-items: center;
          padding: 0 10px;
          gap: 1.5rem;
          text-align: center;
        }

        nav {
          width: 100%;
        }

        .footer-menu a {
          padding: 7px 0;
        }
      }
    `,
  ];
}
