import { LitElement, html, css } from 'lit';

export class MyEl extends LitElement {
  static properties = {
    hydrated: { type: Boolean, reflect: true },
    clicked: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.hydrated = false;
    this.clicked = false;
  }

  updated(props) {
    super.updated(props);
    this.hydrated = true;
  }

  render() {
    return html`
      <p>Hello World</p>
      <button class="shadow-button" @click=${this.handleClick}>Click me</button>
    `;
  }

  handleClick() {
    this.clicked = true;
  }

  static styles = css`
    :host([hydrated]) {
      background: green;
      display: block;
    }
  `;
}
