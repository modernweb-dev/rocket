import { LitElement, css, html } from 'lit';

export class MyCounter extends LitElement {
  constructor() {
    super();
    this.counter = 0;
  }

  render() {
    return html`
      <button @click=${() => (this.counter -= 1)}>-</button>
      <span>${this.counter}</span>
      <button @click=${() => (this.counter += 1)}>+</button>
    `;
  }

  static styles = css`
    * {
      font-size: 200%;
    }

    span {
      width: 4rem;
      display: inline-block;
      text-align: center;
    }

    button {
      width: 64px;
      height: 64px;
      border: none;
      border-radius: 10px;
      background-color: seagreen;
      color: white;
    }
  `;

  static properties = {
    counter: { type: Number },
  };
}
