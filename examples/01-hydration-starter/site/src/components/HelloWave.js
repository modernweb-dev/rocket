import { LitElement, html, css } from 'lit';

export class HelloWave extends LitElement {
  render() {
    return html`<h2>Hello 👋</h2>`;
  }

  static styles = css`
    h2 {
      color: #e03131;
    }
  `;
}
