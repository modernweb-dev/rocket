import { css } from 'lit';
import { BlockColumns } from '@rocket/components/block-columns.js';

export class BlockColumnsGray extends BlockColumns {
  static styles = [
    ...this.styles,
    css`
      :host {
        background-color: #f9f8f8;
      }
    `,
  ];
}
