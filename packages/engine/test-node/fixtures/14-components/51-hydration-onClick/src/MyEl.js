import { LitElement, html, css } from 'lit';

export class MyEl extends LitElement {
  static properties = {
    msg: { type: String },
    hydrated: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.hydrated = false;
  }

  updated(props) {
    super.updated(props);
    this.hydrated = true;
  }

  render() {
    return html`<p>Hello World</p>`;
  }

  static styles = css`
    :host([hydrated]) {
      background: green;
      display: block;
    }
  `;
}
