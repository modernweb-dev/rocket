import { LitElement, html } from 'lit';

export class MyEl extends LitElement {
  static properties = {
    hydrated: { type: Boolean, reflect: true },
    focusEv: { type: Boolean, reflect: true },
    focusInEv: { type: Boolean, attribute: 'focusin-ev', reflect: true },
  };

  constructor() {
    super();
    this.hydrated = false;
    this.focusInEv = false;
  }

  updated(props) {
    super.updated(props);
    this.hydrated = true;
  }

  render() {
    return html`
      <p>Hello World</p>
      <input type="text" value="" class="shadow-input" @focusin=${this.handleFocusIn} />
    `;
  }

  handleFocusIn() {
    this.focusInEv = true;
  }
}
