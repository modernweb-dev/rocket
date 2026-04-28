import { css, html, LitElement } from 'lit';

export class Header extends LitElement {
  render() {
    return html`
      <header>
        <div id="content-area">
          <slot name="logo"></slot>
          <slot name="search"></slot>
          <slot id="content"></slot>
          <slot name="mobile-menu"></slot>
          <slot name="navigation"></slot>
          <slot name="social"></slot>
        </div>
      </header>
    `;
  }

  static styles = [
    css`
      header {
        padding: 20px 0;
        position: sticky;
        top: 0;
        --shadow-color-dark: 220 3% 15%;
        box-shadow:
          0 3px 5px -2px hsl(var(--shadow-color-dark) / 4%),
          0 7px 14px -5px hsl(var(--shadow-color-dark) / 6%);
        background-color: hsl(0 0% 100% / 0.6);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        z-index: 999;
      }

      #content-area {
        max-height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      slot[name='logo']::slotted(*) {
        margin-right: auto;
      }
      slot[name='social']::slotted(*) {
        margin-right: 15px;
      }
      slot[name='social']::slotted(*:last-child) {
        margin-right: 0;
      }

      slot[name='social'],
      slot[name='logo'],
      slot[name='search'],
      slot[name='navigation'] {
        display: flex;
      }
      slot[name='navigation'] {
        align-items: center;
        margin-left: auto;
        margin-right: 28px;
      }
      slot[name='mobile-menu'] {
        display: none;
      }

      #content {
        height: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: auto;
      }
      #content::slotted(a) {
        text-decoration: none;
        color: var(--primary-text-color);
        transition: color 0.3s ease-in-out;
        font-weight: bold;
      }
      #content::slotted(a:hover),
      #content::slotted(a[aria-current='page']) {
        color: var(--primary-color);
      }

      @media (max-width: 768px) {
        slot[name='social'] {
          display: flex;
        }
        slot[name='social']::slotted(*:nth-of-type(n + 3)) {
          display: none;
        }
        slot[name='social']::slotted(*:nth-of-type(n + 2)) {
          margin-right: 0;
        }
        :host([hide-social-mobile]) slot[name='social'] {
          display: none;
        }
        slot[name='navigation'] {
          display: none;
        }
        slot[name='mobile-menu'] {
          display: flex;
          order: 1;
        }
      }

      :host([hide-logo]) slot[name='logo'] {
        visibility: hidden;
      }
      :host([no-background]) {
        background-color: transparent;
        box-shadow: none;
      }
      :host([not-sticky]) header {
        position: static;
      }
    `,
  ];
}
