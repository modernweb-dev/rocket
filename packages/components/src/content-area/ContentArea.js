import { LitElement, html, css } from 'lit';

export class ContentArea extends LitElement {
  render() {
    return html`
      <div id="content-area">
        <slot></slot>
      </div>
    `;
  }

  static styles = [
    css`
      /** content-area */
      #content-area {
        padding: 0 20px;
        display: block;
        justify-content: space-between;
        align-items: center;
      }
      @media screen and (min-width: 1024px) {
        #content-area {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }
      }
    `,
  ];
}
