import { LitElement, html, css } from 'lit';

export class RocketDetails extends LitElement {
  render() {
    return html`
      <details>
        <summary>
          <slot name="summary"></slot>
        </summary>
        <div id="content">
          <slot></slot>
        </div>
      </details>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        padding: 1.6rem 0;
        border: none;
        border-bottom: 1px solid #cdcedd;
      }

      summary {
        color: #212529;
        cursor: pointer;
      }

      #content {
        padding-top: 0.7rem;
        padding-left: 1.2rem;
      }
    `,
  ];
}
