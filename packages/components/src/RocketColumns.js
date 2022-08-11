import { html, css, LitElement } from 'lit';

export class RocketColumns extends LitElement {
  static styles = [
    css`
      #content {
        display: flex;
        gap: var(--space-m, 2rem);
        flex-direction: column;
        flex-wrap: wrap;
      }
      ::slotted(*) {
        flex: 1;
        height: auto;
      }

      @media (min-width: 600px) {
        #content {
          flex-direction: row;
        }
      }
    `,
  ];

  render() {
    return html` <slot id="content"></slot> `;
  }
}
