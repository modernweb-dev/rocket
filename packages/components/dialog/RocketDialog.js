import { LitElement, html, css } from 'lit';

export class RocketDialog extends LitElement {
  render() {
    return html`
      <div class="dialog">
        <h2>hey</h2>
        <slot></slot>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];
}
