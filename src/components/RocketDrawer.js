import { LitElement, html, css } from 'lit';

export class RocketDrawer extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.open = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onDocClick = this._onDocClick.bind(this);
    document.addEventListener('click', this._onDocClick, { capture: true });
  }
  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick, { capture: true });
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot name="invoker">
        <button
          class="burger-menu"
          @click=${this.toggle}
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-label=${this.open ? 'Close menu' : 'Open menu'}
          title=${this.open ? 'Close menu' : 'Open menu'}
        >
          <span class="sr-only">${this.open ? 'Close Menu' : 'Show Menu'}</span>
          ${this.open ? this.#iconClose() : this.#iconBurger()}
        </button>
      </slot>

      <dialog ?open=${this.open} id="rd-dialog">
        <div id="content">
          <slot></slot>
        </div>
      </dialog>
    `;
  }

  // Close when clicking anywhere outside the dialog or the invoker
  /**
   * @param {any} ev
   */
  _onDocClick(ev) {
    if (!this.open) return;
    const path = ev.composedPath();
    const dlg = this.shadowRoot?.getElementById('rd-dialog');
    const invoker = this.shadowRoot?.querySelector('slot[name="invoker"]');

    const clickInsideDialog = path.includes(dlg);
    const clickOnInvoker =
      path.includes(invoker) ||
      path.some((/** @type {{ assignedSlot: Element | null | undefined; }} */ n) => {
        if (n?.assignedSlot && n.assignedSlot === invoker) return true;
        return false;
      });

    if (!clickInsideDialog && !clickOnInvoker) this.close();
  }

  close() {
    this.open = false;
  }
  toggle() {
    this.open = !this.open;
  }

  #iconBurger() {
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>`;
  }

  #iconClose() {
    return html`<svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="icon"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>`;
  }

  static styles = css`
    :host {
      display: block;
      --rd-text-1: #2c3e50;
      --rd-ease-3: cubic-bezier(0.25, 0, 0.3, 1);
      --rd-target-width: 80%;
    }
    * {
      box-sizing: border-box;
    }

    .burger-menu {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      line-height: 0;
      cursor: pointer;
      color: var(--rd-text-1);
      position: relative;
      z-index: 101;
    }
    .icon {
      width: 2.3rem;
      display: block;
      transition: transform 0.2s ease;
    }
    .burger-menu[aria-expanded='true'] .icon {
      transform: rotate(90deg);
    }

    dialog {
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      left: auto;
      height: 100vh;
      width: 0;
      margin: 0;
      padding: 0;
      border: none;
      color: var(--rd-text-1);
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.35);
      z-index: 100;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition:
        width 0.35s var(--rd-ease-3),
        opacity 0.35s var(--rd-ease-3);
      will-change: width;
    }
    dialog[open] {
      width: var(--rd-target-width);
      opacity: 1;
      pointer-events: auto;
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
      transition: opacity 0.35s var(--rd-ease-3);
      opacity: 0;
    }
    dialog[open]::backdrop {
      opacity: 1;
    }

    #content {
      height: 100%;
      padding: 1rem;
      max-width: var(--rd-target-width);
      overflow-y: auto;
    }

    @media (prefers-reduced-motion: reduce) {
      dialog,
      dialog::backdrop {
        transition: none;
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
  `;
}
