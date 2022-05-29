import { LitElement, html, css } from 'lit';

// wait for all dialog animations to complete their promises
const animationsComplete = element =>
  Promise.allSettled(element.getAnimations().map(animation => animation.finished));

export class RocketDrawer extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.open = false;
  }

  render() {
    return html`
      <slot name="invoker" @click=${this.toggle}>
        <button class="burger-menu">
          <span class="sr-only">Show Menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 448 512">
            <path
              fill="currentColor"
              d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"
            ></path>
          </svg>
        </button>
      </slot>
      <dialog @click=${this.closeOnOutsideClick} @close=${this.close}>
        <div id="close">
          <slot name="close">
            <button class="close" aria-label="close" @click=${this.close}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.775 460.775">
                <path
                  d="M285.08 230.397 456.218 59.27c6.076-6.077 6.076-15.911 0-21.986L423.511 4.565a15.55 15.55 0 0 0-21.985 0l-171.138 171.14L59.25 4.565a15.551 15.551 0 0 0-21.985 0L4.558 37.284c-6.077 6.075-6.077 15.909 0 21.986l171.138 171.128L4.575 401.505c-6.074 6.077-6.074 15.911 0 21.986l32.709 32.719a15.555 15.555 0 0 0 21.986 0l171.117-171.12 171.118 171.12a15.551 15.551 0 0 0 21.985 0l32.709-32.719c6.074-6.075 6.074-15.909 0-21.986L285.08 230.397z"
                />
              </svg>
            </button>
          </slot>
        </div>
        <div id="content">
          <slot></slot>
        </div>
      </dialog>
    `;
  }

  close() {
    this.open = false;
  }

  show() {
    this.open = true;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('open')) {
      if (this.open) {
        this.showModal();
      } else {
        this._close();
      }
    }
  }

  closeOnOutsideClick(ev) {
    if (ev.target === this._dialog) {
      this.close();
    }
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this._dialog = this.shadowRoot.querySelector('dialog');
    this._invoker = this.shadowRoot.querySelector('slot[name="invoker"]')?.assignedElements()[0];
  }

  async _close() {
    if (this._dialog) {
      this._dialog.setAttribute('inert', '');
      this._dialog.dispatchEvent(new Event('closing'));
      await animationsComplete(this._dialog);
      this._dialog.dispatchEvent(new Event('closed'));
      this._dialog.close();
    }
  }

  async showModal() {
    if (this._dialog) {
      this._dialog.showModal();
      this._dialog.dispatchEvent(new Event('opening'));
      await animationsComplete(this._dialog);
      this._dialog.dispatchEvent(new Event('opened'));
      this._dialog.removeAttribute('inert');

      const focusTarget = this.querySelector('[autofocus]');
      focusTarget ? focusTarget.focus() : this.shadowRoot.querySelector('button.close').focus();
    }
  }

  async toggle() {
    this.open = !this.open;
  }

  static styles = [
    css`
      :host {
        display: block;
        --rd-surface-1: var(--surface-1, #f8f9fa);
        --rd-surface-2: var(--surface-2, #e9ecef);
        --rd-surface-3: var(--surface-3, #dee2e6);
        --rd-text-1: var(--text-1, #212529);
        /* shadow */
        --rd-shadow-color: 220 3% 15%;
        --rd-shadow-strength: 1%;
        --rd-shadow-2: 0 3px 5px -2px hsl(var(--rd-shadow-color) /
                calc(var(--rd-shadow-strength) + 3%)),
          0 7px 14px -5px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 5%));
        --rd-shadow-6: 0 -1px 2px 0 hsl(var(--rd-shadow-color) /
                calc(var(--rd-shadow-strength) + 2%)),
          0 3px 2px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 3%)),
          0 7px 5px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 3%)),
          0 12px 10px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 4%)),
          0 22px 18px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 5%)),
          0 41px 33px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 6%)),
          0 100px 80px -2px hsl(var(--rd-shadow-color) / calc(var(--rd-shadow-strength) + 7%));
        /* size */
        --rd-size-3: var(--size-3, 1rem);
        --rd-size-5: var(--size-5, 1.5rem);
        /* animations */
        --rd-ease-3: cubic-bezier(0.25, 0, 0.3, 1);
        --rd-animation-slide-out-left: var(
          --animation-slide-out-left,
          slide-out-left 0.5s var(--rd-ease-3)
        );
        --rd-animation-slide-in-right: var(
          --animation-slide-in-right,
          slide-in-right 0.5s var(--rd-ease-3)
        );
      }

      #content {
        height: 100vh;
        overflow: scroll;
      }

      #close {
        position: absolute;
        right: 0;
        top: 0;
      }

      button {
        background: none;
        border: none;
        width: 30px;
        fill: var(--rd-text-1);
        padding: 5px;
        margin: 5px;
        display: block;
      }

      button.burger-menu {
        margin: 0;
        padding: 0;
        width: 20px;
      }

      button svg {
        display: block;
      }

      @media (prefers-color-scheme: darkx) {
        :host {
          --rd-surface-1: var(--surface-1, #212529);
          --rd-surface-2: var(--surface-2, #343a40);
          --rd-surface-3: var(--surface-3, #495057);
          --rd-text-1: var(--text-1, #f1f3f5);
          --rd-shadow-color: 220 40% 2%;
          --rd-shadow-strength: 25%;
        }
      }

      dialog {
        display: block;
        background: var(--rd-surface-2);
        color: var(--rd-text-1);
        width: min(80vw, 60ch);
        height: 100vh;
        max-height: 100vh;
        height: min(100svh, 100%);

        margin: 0;
        padding: 0;
        position: fixed;
        inset: 0;
        border: none;
        box-shadow: var(--rd-shadow-6);
        z-index: 2147483647;
        overflow: visible;
        transition: opacity 0.5s var(--rd-ease-3);
      }

      @media (prefers-reduced-motion: no-preference) {
        dialog {
          animation: var(--rd-animation-slide-out-left) forwards;
          animation-timing-function: var(--ease-squish-3);
        }
      }

      @media (prefers-color-scheme: dark) {
        dialog {
          -webkit-border-before: 1px solid var(--_rg-surface-3);
          border-block-start: 1px solid var(--_rg-surface-3);
        }
      }

      dialog:not([open]) {
        pointer-events: none;
        opacity: 0;
      }

      dialog::-webkit-backdrop {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        -webkit-transition: -webkit-backdrop-filter 0.5s ease;
        transition: -webkit-backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease;
      }

      dialog::backdrop {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        transition: -webkit-backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease;
        transition: backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease;
      }

      @media (prefers-reduced-motion: no-preference) {
        dialog[open] {
          animation: var(--rd-animation-slide-in-right) forwards;
        }
      }

      @keyframes slide-in-right {
        from {
          transform: translateX(-100%);
        }
      }

      @keyframes slide-out-left {
        to {
          transform: translateX(-100%);
        }
      }

      .sr-only {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `,
  ];
}
