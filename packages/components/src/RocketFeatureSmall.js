import { LitElement, html, css } from 'lit';

export class RocketFeatureSmall extends LitElement {
  static styles = css`
    :host {
      display: block;
      text-align: center;
    }

    slot[name='icon']::slotted(*) {
      margin: 0 auto;
      margin-bottom: var(--space-l, 1rem);
    }
  `;

  render() {
    return html`
      <slot name="icon"></slot>
      <slot name="title"></slot>
      <slot name="description"></slot>
    `;
  }
}
