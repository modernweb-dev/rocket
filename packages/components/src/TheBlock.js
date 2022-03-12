import { LitElement, html, css } from 'lit';

export class TheBlock extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        padding: var(--space-2xl-3xl, 8em) 0;
      }
      #wrapper {
        max-width: 960px;
        margin: 0 auto;
        padding: 0 var(--space-2xs, 0.8em);
      }
      :host([full-width]) {
        max-width: 100%;
      }
      slot {
        display: block;
      }
      slot[name='title'] {
        text-align: center;
        max-width: 33em;
        margin: 0 auto;
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
