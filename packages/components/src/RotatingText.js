import { LitElement, html, css } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

export class RotatingText extends LitElement {
  static properties = {
    items: { type: Array },
    inIndex: { type: Number, reflect: true, attribute: 'in-index' },
  };

  constructor() {
    super();
    this.initIndex = 0;
    this.inIndex = 0;
    this.outIndex = -1;
  }

  next() {
    this.outIndex = this.inIndex;
    if (this.inIndex < this.items.length - 1) {
      this.inIndex += 1;
    } else {
      this.inIndex = 0;
    }
  }

  firstUpdated() {
    this.initIndex = -1;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.next();
    }, 2000);
  }

  render() {
    return html`${this.items.map(
      (item, index) =>
        html`<p
          class=${classMap({
            'anim-in': index !== this.initIndex && index === this.inIndex,
            'anim-out': index === this.outIndex,
            'anim-static': index === this.initIndex,
          })}
        >
          ${item}
        </p>`,
    )}`;
  }

  static styles = [
    css`
      @keyframes textAnimIn {
        0% {
          transform: translate3d(0, -120%, 0);
        }

        100% {
          transform: translate3d(0, 0%, 0);
        }
      }

      @keyframes textAnimOut {
        0% {
          transform: translate3d(0, 0%, 0);
        }

        50% {
          transform: translate3d(0, -20%, 0);
        }

        100% {
          transform: translate3d(0, 120%, 0);
        }
      }

      p {
        position: absolute;
        top: 0;
        margin: 0;
        transform: translate3d(0, -120%, 0);
      }

      .anim-static {
        transform: translate3d(0, 0, 0);
      }

      .anim-in {
        animation: textAnimIn 0.6s 0.3s forwards;
      }

      .anim-out {
        animation: textAnimOut 0.6s forwards;
      }

      :host {
        position: block;
        position: relative;
        overflow: hidden;
        display: block;
        height: 1.5em;
      }
      div {
        display: flex;
        max-width: 960px;
        margin: 0 auto;
      }
      slot {
        display: block;
        flex: 1;
      }
    `,
  ];
}
