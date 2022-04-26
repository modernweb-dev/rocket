import { LitElement, html, css } from 'lit';

let i = 0;
const fullText = [...'to this wonderful world of progressive hydration 🤯'];

export class HelloTyper extends LitElement {
  static properties = {
    msg: { type: String },
    counter: { type: Number },
  };

  constructor() {
    super();
    this.msg = ' ';
    this.counter = 0;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (i < fullText.length) {
      setTimeout(() => {
        this.msg += fullText[i];
        i += 1;
      }, Math.floor(Math.random() * 50) + 40);
    }
  }

  render() {
    return html`
      <p>🤔 Hello <span>${this.msg}</span>${'🤯'.repeat(this.counter)}</p>
      <button @click=${this._inc}>+</button>
    `;
  }

  _inc() {
    if (i >= fullText.length) {
      this.counter += 1;
    }
  }

  static styles = [
    css`
      button {
        font-size: 200%;
        width: 64px;
        height: 64px;
        border: none;
        border-radius: 10px;
        background-color: seagreen;
        color: white;
      }
    `,
  ];
}
