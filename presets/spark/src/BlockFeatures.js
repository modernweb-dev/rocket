import { css } from 'lit';
import { BlockColumns } from '@rocket/components';

export class BlockFeatures extends BlockColumns {
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
