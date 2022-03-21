import { html, css } from 'lit';
import { TheBlock } from './TheBlock.js';

export class BlockColumns extends TheBlock {
  static styles = [
    ...this.styles,
    css`
      #content {
        display: flex;
        gap: var(--space-m, 2rem);
        flex-direction: column;
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
    return html`
      <div id="wrapper">
        <slot name="title"></slot>
        <slot id="content"></slot>
      </div>
    `;
  }
}
