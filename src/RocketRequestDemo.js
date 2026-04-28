/** Runs on: client */
import { LitElement, css, html } from 'lit';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

/** @type {Record<string, string>} */
const copyButtonLabels = {
  copy: 'Copy request path',
  success: 'Copied request path',
  error: 'Unable to copy request path',
};

const DEFAULT_REQUEST_DEMO_HEIGHT = 240;
const MIN_REQUEST_DEMO_HEIGHT = 120;

export class RocketRequestDemo extends LitElement {
  static properties = {
    url: { type: String },
    label: { type: String },
    height: { type: String },
    _copyState: { type: String, state: true },
    _responseHeight: { type: Number, state: true },
  };

  constructor() {
    super();
    this.url = '';
    this.label = '';
    this.height = '';
    this._copyState = 'copy';
    /** @type {number | undefined} */
    this._responseHeight = undefined;
    this.copyStateResetDelay = 2000;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this.copyStateResetTimeout = undefined;
  }

  /**
   * @param {Map<PropertyKey, unknown>} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has('height')) {
      this._responseHeight = undefined;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearCopyStateResetTimeout();
  }

  get requestPath() {
    return this.url || '';
  }

  get frameHeight() {
    return this.height && /^[1-9]\d*$/.test(this.height)
      ? Number(this.height)
      : DEFAULT_REQUEST_DEMO_HEIGHT;
  }

  get responseHeight() {
    return this._responseHeight ?? this.frameHeight;
  }

  openRequest() {
    if (!this.requestPath) {
      return;
    }

    window.open(this.requestPath, '_blank', 'noopener,noreferrer');
  }

  async copyRequestPath() {
    if (!this.requestPath) {
      return;
    }

    this.clearCopyStateResetTimeout();
    try {
      await navigator.clipboard.writeText(this.requestPath);
      this._copyState = 'success';
    } catch {
      this._copyState = 'error';
    }
    this.scheduleCopyStateReset();
  }

  /**
   * @param {PointerEvent} ev
   */
  handleResizePointerDown(ev) {
    const iframe = this.renderRoot.querySelector('iframe');
    if (!(iframe instanceof HTMLIFrameElement)) {
      return;
    }
    const target = /** @type {HTMLElement} */ (ev.currentTarget);
    const startY = ev.clientY;
    const startHeight = iframe.getBoundingClientRect().height || this.responseHeight;

    ev.preventDefault();
    target.setPointerCapture(ev.pointerId);
    const pointerMoveHandler = (/** @type {PointerEvent} */ ev) => {
      const diff = ev.clientY - startY;
      this.setResponseHeight(startHeight + diff);
    };
    const pointerUpHandler = (/** @type {PointerEvent} */ ev) => {
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener('pointermove', pointerMoveHandler);
      target.removeEventListener('pointerup', pointerUpHandler);
      target.removeEventListener('pointercancel', pointerUpHandler);
    };

    target.addEventListener('pointermove', pointerMoveHandler);
    target.addEventListener('pointerup', pointerUpHandler);
    target.addEventListener('pointercancel', pointerUpHandler);
  }

  /**
   * @param {KeyboardEvent} ev
   */
  handleResizeKeyDown(ev) {
    const step = ev.shiftKey ? 64 : 16;
    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.setResponseHeight(this.responseHeight - step);
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.setResponseHeight(this.responseHeight + step);
    }
  }

  /**
   * @param {number} height
   */
  setResponseHeight(height) {
    this._responseHeight = Math.max(MIN_REQUEST_DEMO_HEIGHT, Math.round(height));
  }

  scheduleCopyStateReset() {
    this.copyStateResetTimeout = setTimeout(() => {
      this.copyStateResetTimeout = undefined;
      this._copyState = 'copy';
    }, this.copyStateResetDelay);
  }

  clearCopyStateResetTimeout() {
    if (this.copyStateResetTimeout !== undefined) {
      clearTimeout(this.copyStateResetTimeout);
      this.copyStateResetTimeout = undefined;
    }
  }

  render() {
    const copyLabel = copyButtonLabels[this._copyState] || copyButtonLabels.copy;
    const copyIconName =
      this._copyState === 'success' ? 'check' : this._copyState === 'error' ? 'xmark' : 'copy';
    const copyIconVariant = this._copyState === 'copy' ? 'regular' : 'solid';

    return html`
      <figure id="frame" part="frame" class="rocket-request-demo-frame">
        <figcaption id="header" part="header">
          <span id="request" part="request">
            <span>GET</span>
            <code>${this.requestPath}</code>
          </span>
        </figcaption>
        <div id="response" part="response">
          <iframe
            part="iframe"
            src=${this.requestPath}
            loading="lazy"
            title=${`Request Demo response for ${this.requestPath}`}
            style=${`height: ${this.responseHeight}px`}
          ></iframe>
          <button
            id="resize-request-demo"
            part="resize-handle"
            type="button"
            aria-label="Resize Request Demo response height"
            title="Resize Request Demo response height"
            @pointerdown=${(/** @type {PointerEvent} */ ev) => this.handleResizePointerDown(ev)}
            @keydown=${(/** @type {KeyboardEvent} */ ev) => this.handleResizeKeyDown(ev)}
          >
            <wa-icon name="grip-lines" variant="solid" aria-hidden="true"></wa-icon>
          </button>
        </div>
        <div id="source-row" part="source-row">
          <details id="source" part="source">
            <summary>Source</summary>
            <slot></slot>
          </details>
          <div id="request-actions" part="actions" aria-label="Request path actions">
            <wa-button
              id="open-request-demo"
              part="open-button"
              appearance="plain"
              title="Open Request"
              aria-label="Open Request"
              @click=${() => this.openRequest()}
            >
              <wa-icon name="arrow-up-right-from-square" variant="solid"></wa-icon>
            </wa-button>
            <wa-button
              id="copy-request-demo"
              part="copy-button"
              appearance="plain"
              title=${copyLabel}
              aria-label=${copyLabel}
              @click=${() => this.copyRequestPath()}
            >
              <wa-icon name=${copyIconName} variant=${copyIconVariant}></wa-icon>
            </wa-button>
          </div>
        </div>
      </figure>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        box-sizing: border-box;
        --request-action-size: 2.75rem;
        --request-actions-width: calc(var(--request-action-size) * 2);
        --border-color: var(--rocket-request-demo-border, #dbe3ec);
        --border: 1px solid var(--border-color);
        --border-radius: var(--rocket-request-demo-radius, 8px);
        --frame-header: var(--rocket-request-demo-header, #f8fafc);
        --frame-muted: var(--rocket-request-demo-muted, #57606a);
        --frame-text: var(--rocket-request-demo-text, #24292f);
        margin: var(--rocket-request-demo-margin, 1.3rem 0);
        overflow: hidden;
        border: var(--border);
        border-radius: var(--border-radius);
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      #frame {
        margin: 0;
        background: white;
      }

      #header {
        display: flex;
        min-block-size: 2.75rem;
        align-items: center;
        border-bottom: var(--border);
        background: var(--frame-header);
        color: var(--frame-text);
      }

      #request {
        display: inline-flex;
        min-inline-size: 0;
        flex: 1 1 auto;
        align-items: center;
        gap: 0.45rem;
        color: var(--frame-muted);
        font-size: 0.875rem;
        padding: 0.5rem 0.85rem;
      }

      #request > span {
        font-weight: 700;
        letter-spacing: 0;
      }

      #request code {
        display: inline;
        overflow-wrap: anywhere;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
        font-family: 'Fira Code', Consolas, monospace;
        font-size: 1em;
        line-height: inherit;
        padding: 0;
      }

      #response {
        position: relative;
        background: white;
      }

      iframe {
        display: block;
        box-sizing: border-box;
        inline-size: 100%;
        border: 0;
        background: white;
      }

      #resize-request-demo {
        appearance: none;
        -webkit-appearance: none;
        display: grid;
        block-size: 0.95rem;
        inline-size: 100%;
        min-block-size: 0;
        min-height: 0;
        place-items: center;
        border: 0;
        border-block: var(--border);
        border-radius: 0;
        background: white;
        color: var(--frame-muted);
        cursor: ns-resize;
        font: inherit;
        line-height: 1;
        padding: 0;
        touch-action: none;
      }

      #resize-request-demo wa-icon {
        block-size: 0.72rem;
        inline-size: 0.72rem;
      }

      #source-row {
        position: relative;
      }

      #source {
        display: block;
        min-inline-size: 0;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
      }

      #source summary {
        display: flex;
        min-block-size: var(--request-action-size);
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        box-sizing: border-box;
        cursor: pointer;
        color: var(--frame-muted);
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.2;
        list-style: none;
        padding-block: 0;
        padding-inline: var(--request-actions-width);
      }

      #source summary::marker {
        content: '';
      }

      #source summary::-webkit-details-marker {
        display: none;
      }

      #source summary::after {
        content: '';
        display: inline-block;
        flex: 0 0 auto;
        box-sizing: border-box;
        inline-size: 0.52rem;
        block-size: 0.52rem;
        border: solid currentColor;
        border-width: 0 2px 2px 0;
        transform: rotate(-45deg);
        transform-origin: center;
        transition: transform 120ms ease-in-out;
      }

      #source[open] summary {
        border-bottom: var(--border);
      }

      #source[open] summary::after {
        transform: rotate(45deg);
      }

      #request-actions {
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0;
        display: flex;
        align-items: stretch;
        block-size: var(--request-action-size);
        border-left: var(--border);
      }

      #open-request-demo,
      #copy-request-demo {
        inline-size: var(--request-action-size);
      }

      #open-request-demo::part(base),
      #copy-request-demo::part(base) {
        display: inline-grid;
        inline-size: 100%;
        min-block-size: var(--request-action-size);
        place-items: center;
        border: none;
        border-radius: 0;
        padding: 0;
      }

      #copy-request-demo::part(base) {
        border-left: var(--border);
        border-radius: 0;
      }

      ::slotted(pre) {
        font-size: 0.9rem;
        border-radius: 0;
      }

      ::slotted(rocket-code-block) {
        --rocket-code-border-radius: 0 0 calc(var(--border-radius) - 1px)
          calc(var(--border-radius) - 1px);
        --rocket-code-frame-border: none;
        --rocket-code-margin: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        #source summary::after {
          transition: none;
        }
      }
    `,
  ];
}
