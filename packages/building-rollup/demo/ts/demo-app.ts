import { LitElement, html } from 'lit-element';
import { customElement } from 'lit-element/decorators.js';

const msg: string = 'TypeScript demo works';

@customElement('demo-app')
class DemoApp extends LitElement {
  render() {
    return html`
      ${msg}
    `;
  }
}
