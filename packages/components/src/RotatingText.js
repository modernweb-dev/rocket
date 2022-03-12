import { LitElement, html, css } from 'lit';

export class RotatingText extends LitElement {
  static properties = {
    items: { type: Array },
    activeIndex: { type: Number, reflect: true, attribute: 'active-index' },
  };

  constructor() {
    super();
    this.activeIndex = 0;
  }

  next() {
    if (this.activeIndex < this.items.length - 1) {
      this.activeIndex++;
    } else {
      this.activeIndex = 0;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.next();
    }, 2000);
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

      .anim-in {
        transform: translate3d(0, -120%, 0);
        animation: textAnimIn 0.6s 0.3s forwards;
      }

      .anim-out {
        transform: translate3d(0, 0%, 0);
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

  render() {
    return html`${this.items.map(
      (item, index) =>
        html`<p class="${index === this.activeIndex ? 'anim-in' : 'anim-in anim-out'}">${item}</p>`,
    )}`;
  }
}
