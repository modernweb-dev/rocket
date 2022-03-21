import { css } from 'lit';
import { BlockColumns } from '@rocket/components';

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
