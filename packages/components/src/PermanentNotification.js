import { LitElement, css, html } from 'lit';

export class PermanentNotification extends LitElement {
  static properties = {
    href: { type: String },
    type: { type: String, reflect: true },
  };

  constructor() {
    super();
    this.href = '';
    this.type = 'high';
  }

  static styles = [
    css`
      :host {
        position: fixed;
        left: -95px;
        background: #cb181a;
        top: 200px;
        padding: 5px 10px 3px 10px;
        transform: rotate(-90deg);
        box-shadow: rgb(0 0 0 / 24%) -5px 5px 8px;
        color: #fff;
      }

      a {
        color: #fff;
        text-decoration: none;
      }

      a:hover {
        color: #000;
      }

      :host([type='low']) {
        background-color: var(--permanent-notification-low-background-color, #42b983);
      }

      :host([type='medium']) {
        background-color: var(--permanent-notification-medium-background-color, #b29400);
      }

      :host([type='high']) {
        background-color: var(--permanent-notification-high-background-color, #900);
      }

      :host([type='medium']),
      :host([type='medium']) a {
        color: var(--permanent-notification-medium-text-color, #fff);
      }

      :host([type='high']),
      :host([type='high']) a {
        color: var(--permanent-notification-high-text-color, #fff);
      }
    `,
  ];

  render() {
    if (this.href) {
      return html`<a href=${this.href}><slot></slot></a>`;
    } else {
      return html`<slot></slot>`;
    }
  }
}
