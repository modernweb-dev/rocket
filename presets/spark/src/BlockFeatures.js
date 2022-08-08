import { css } from 'lit';
import { RocketColumns } from '@rocket/components/rocket-columns.js';

export class BlockFeatures extends RocketColumns {
  static styles = [
    ...this.styles,
    css`
      slot[name='title']::slotted(*) {
        margin-bottom: 100px;
      }
      #content {
        gap: var(--space-xl, 3rem);
      }
    `,
  ];
}
