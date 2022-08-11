import { LitElement, html, css } from 'lit';

export class RocketContentArea extends LitElement {
  render() {
    return html`
      <div id="rocket-content-area">
        <slot></slot>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        padding: var(--rocket-content-area-padding, 0);
      }

      :host([no-padding]) {
        padding: 0;
      }

      /** rocket-content-area */
      #rocket-content-area {
        padding: 0 20px;
        display: block;
        justify-content: space-between;
        align-items: center;
      }
      @media screen and (min-width: 1024px) {
        #rocket-content-area {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }
      }
    `,
  ];
}
