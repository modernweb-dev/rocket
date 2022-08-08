import { LitElement, html, css } from 'lit';

export class RocketCard extends LitElement {
  render() {
    return html`
      <slot name="title"></slot>
      <slot></slot>
      <slot name="cta"></slot>
    `;
  }

  static styles = [
    css`
      :host {
        margin-bottom: 5rem;
        padding: 3rem 1rem;
        border: 1px solid #9fa3ae;
        border-radius: 20px;
        background-color: #ffffff;
        text-align: center;
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        min-width: 20ch;
      }
    `,
  ];
}
