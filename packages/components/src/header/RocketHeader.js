import { LitElement, html, css } from 'lit';

export class RocketHeader extends LitElement {
  render() {
    return html`
      <div id="content-area">
        <slot name="logo"></slot>
        <slot name="search"></slot>
        <slot id="content"></slot>
        <slot name="mobile-menu"></slot>
        <slot name="social"></slot>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        align-items: center;
        padding: 20px 0;
        top: 0;
        position: sticky;
        z-index: 100;
        background-color: var(--page-background);
        box-shadow: var(--shadow-2);
        --shadow-color: 220 3% 15%;
        --shadow-strength: 1%;
        --shadow-2: 0 3px 5px -2px hsl(var(--shadow-color) / calc(var(--shadow-strength) + 3%)),
          0 7px 14px -5px hsl(var(--shadow-color) / calc(var(--shadow-strength) + 5%));
      }
      slot[name='logo']::slotted(*) {
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
      @media screen and (min-width: 1024px) {
        slot[name='search']::slotted(*),
        #content::slotted(*) {
          margin-right: 40px;
        }
      }
      /** content-area */
      #content-area {
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      @media screen and (min-width: 1024px) {
        #content-area {
          max-width: 1200px;
          margin: 0 auto;
        }
      }
      slot[name='social']::slotted(*:last-child) {
        margin-right: 0;
      }
      slot[name='social'],
      slot[name='logo'],
      slot[name='search'] {
        display: none;
      }
      @media screen and (min-width: 1024px) {
        slot[name='social'],
        slot[name='logo'],
        slot[name='search'] {
          display: contents;
        }
        slot[name='mobile-menu'] {
          display: none;
        }
      }
      /** Home Variation ********/
      :host([hide-logo]) slot[name='logo'] {
        visibility: hidden;
      }
      :host([no-background]) {
        background-color: transparent;
        box-shadow: none;
      }
      @media screen and (min-width: 1024px) {
        :host([dark-background]) #content::slotted(a) {
          color: #fff;
        }
        :host([dark-background]) #content::slotted(a:hover) {
          color: var(--primary-text-color);
        }
      }
      :host([not-sticky]) {
        position: static;
      }
    `,
  ];
}
