/** Runs on: client */
import { css, html } from 'lit';
import { LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import { until } from 'lit/directives/until.js';
import { standaloneDemoPath, standaloneDemoUrl } from './standalone-demo-url.js';

export { standaloneDemoUrl };

/** @type {Record<string, string>} */
const copyButtonLabels = {
  copy: 'Copy Standalone Demo URL',
  success: 'Copied Standalone Demo URL',
  error: 'Unable to copy Standalone Demo URL',
};

/**
 * @param {string} parentUrl
 * @param {string} demoName
 */
export function standaloneDemoPathFromUrl(parentUrl, demoName) {
  return standaloneDemoPath(new URL(parentUrl).pathname, demoName);
}

export class RocketJsDemo extends LitElement {
  static properties = {
    demo: { type: Function },
    singleDemo: { type: Boolean, attribute: 'single-demo', reflect: true },
    _copyState: { type: String, state: true },
  };

  constructor() {
    super();
    /** @type {(options: { wrapperRef?: import('lit/directives/ref.js').Ref }) => import('lit').TemplateResult } */
    this.demo = () => html`<p>Loading...</p>`;
    this.preview = createRef();
    this.singleDemo = false;
    this._copyState = 'copy';
    this.copyStateResetDelay = 2000;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this.copyStateResetTimeout = undefined;
  }

  get demoName() {
    return this.getAttribute('demo-name') || '';
  }

  get standaloneDemoPath() {
    if (!this.demoName) {
      return '';
    }
    return standaloneDemoPathFromUrl(window.location.href, this.demoName);
  }

  openStandaloneDemo() {
    const url = this.standaloneDemoPath;
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async copyStandaloneDemoUrl() {
    const url = this.standaloneDemoPath;
    if (!url) {
      return;
    }

    this.clearCopyStateResetTimeout();
    try {
      await navigator.clipboard.writeText(url);
      this._copyState = 'success';
    } catch {
      this._copyState = 'error';
    }
    this.scheduleCopyStateReset();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearCopyStateResetTimeout();
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

  /**
   * @param {PointerEvent} ev
   */
  handleResizePointerDown(ev) {
    const startX = ev.clientX;
    const element = this.preview.value;
    if (!element) {
      return;
    }
    const startWidth = element.getBoundingClientRect().width;
    const target = /** @type {HTMLElement} */ (ev.currentTarget);

    ev.preventDefault();
    target.setPointerCapture(ev.pointerId);
    const pointerMoveHandler = (/** @type {PointerEvent} */ ev) => {
      const diff = ev.clientX - startX;
      this.setPreviewWidth(startWidth + diff);
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
    if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      this.resizePreviewBy(-step);
    } else if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      this.resizePreviewBy(step);
    }
  }

  /**
   * @param {number} delta
   */
  resizePreviewBy(delta) {
    const element = this.preview.value;
    if (!element) {
      return;
    }
    this.setPreviewWidth(element.getBoundingClientRect().width + delta);
  }

  /**
   * @param {number} width
   */
  setPreviewWidth(width) {
    const element = this.preview.value;
    if (!(element instanceof HTMLElement)) {
      return;
    }
    const maxWidth = element.parentElement?.getBoundingClientRect().width ?? width;
    const clampedWidth = Math.min(Math.max(width, 160), maxWidth);
    element.style.width = `${Math.round(clampedWidth)}px`;
  }

  render() {
    if (this.singleDemo) {
      return html`
        <div ${ref(this.preview)}>
          ${until(this.demo({ wrapperRef: this.preview }), 'loading...')}
        </div>
      `;
    }
    return html`
      <div id="bg">
        <div ${ref(this.preview)} id="wrapper">
          ${until(this.demo({ wrapperRef: this.preview }), 'loading...')}
          <button
            type="button"
            id="resize"
            aria-label="Resize JavaScript Demo width"
            title="Resize JavaScript Demo width"
            @pointerdown=${(/** @type {PointerEvent} */ ev) => this.handleResizePointerDown(ev)}
            @keydown=${(/** @type {KeyboardEvent} */ ev) => this.handleResizeKeyDown(ev)}
          >
            <wa-icon name="grip-vertical" variant="solid"></wa-icon>
          </button>
        </div>
      </div>
      <div id="bottom">
        <div id="source-row">
          <details id="source">
            <summary>Source</summary>
            <slot></slot>
          </details>
          <div id="standalone-actions" aria-label="Standalone Demo URL actions">
            <wa-button
              id="open-standalone-demo"
              appearance="plain"
              title="Open Standalone Demo URL"
              aria-label="Open Standalone Demo URL"
              @click=${() => this.openStandaloneDemo()}
            >
              <wa-icon name="arrow-up-right-from-square" variant="solid"></wa-icon>
            </wa-button>
            <wa-button
              id="copy-standalone-demo"
              appearance="plain"
              title=${copyButtonLabels[this._copyState] || copyButtonLabels.copy}
              aria-label=${copyButtonLabels[this._copyState] || copyButtonLabels.copy}
              @click=${() => this.copyStandaloneDemoUrl()}
            >
              <wa-icon
                name=${this._copyState === 'success'
                  ? 'check'
                  : this._copyState === 'error'
                    ? 'xmark'
                    : 'copy'}
                variant=${this._copyState === 'copy' ? 'regular' : 'solid'}
              ></wa-icon>
            </wa-button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    css`
      :host(:not([single-demo])) {
        display: block;
        --resize-width: 1.5rem;
        --border-color: #dbe3ec;
        --border: 1px solid var(--border-color);
        --border-radius: 8px;
        --frame-header: #f8fafc;
        --frame-muted: #57606a;
        --frame-text: #24292f;
        border: var(--border);
        border-radius: var(--border-radius);
        margin-bottom: var(--wa-content-spacing);
        overflow: hidden;
      }

      #bg {
        background-color: #eee;
        width: 100%;
        overflow: hidden;
      }

      #resize {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: var(--resize-width);
        border-left: var(--border);
        border-top: 0;
        border-right: 0;
        border-bottom: 0;
        cursor: ew-resize;
        background: white;
        color: var(--frame-muted);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        touch-action: none;
      }

      #wrapper {
        position: relative;
        padding: 1rem calc(1rem + var(--resize-width)) 1rem 1rem;
        box-sizing: border-box;
        max-width: 100%;
        min-width: min-content;
        background: white;
      }

      #bottom {
        position: relative;
        --standalone-action-size: 2.75rem;
        --standalone-actions-width: calc(var(--standalone-action-size) * 2);
        border-top: var(--border);
      }

      #source-row {
        position: relative;
      }

      #source {
        display: block;
        min-inline-size: 0;
      }

      #source summary {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        min-block-size: var(--standalone-action-size);
        box-sizing: border-box;
        cursor: pointer;
        color: var(--frame-muted);
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.2;
        list-style: none;
        padding-block: 0;
        padding-inline: var(--standalone-actions-width);
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

      #standalone-actions {
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0;
        display: flex;
        align-items: stretch;
        block-size: var(--standalone-action-size);
        border-left: var(--border);
      }

      #open-standalone-demo,
      #copy-standalone-demo {
        inline-size: var(--standalone-action-size);
      }

      #open-standalone-demo::part(base),
      #copy-standalone-demo::part(base) {
        display: inline-grid;
        place-items: center;
        min-block-size: var(--standalone-action-size);
        inline-size: 100%;
        border: none;
        border-radius: 0;
        padding: 0;
      }

      #copy-standalone-demo::part(base) {
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
