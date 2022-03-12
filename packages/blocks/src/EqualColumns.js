import { LitElement, html, css } from 'lit';

export class EqualColumns extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-2xl-3xl, 8em) 0;
    }
    #wrapper {
      max-width: 960px;
      margin: 0 auto;
    }
    :host([full-width]) {
      max-width: 100%;
    }
    slot {
      display: block;
    }
    #content {
      display: flex;
    }
    slot[name='title'] {
      text-align: center;
    }

    ::slotted(*) {
      flex: 1;
    }
  `;

  render() {
    return html`
      <div id="wrapper">
        <slot name="title"></slot>
        <slot id="content"></slot>
      </div>
    `;
  }
}
