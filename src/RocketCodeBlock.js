import { LitElement, css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

const shellLanguages = new Set([
  'bash',
  'console',
  'sh',
  'shell',
  'shell-session',
  'terminal',
  'zsh',
]);

const copyIconStates = [
  { state: 'copy', name: 'copy', label: 'Copy code' },
  { state: 'success', name: 'check-lg', label: 'Copied code' },
  { state: 'error', name: 'x-circle', label: 'Unable to copy code' },
];

export class RocketCodeBlock extends LitElement {
  static copyTransitionId = 0;

  static properties = {
    label: { type: String },
    language: { type: String },
    encodedCode: { type: String, attribute: 'encoded-code' },
    _copyState: { type: String, state: true },
    _copyTransitionName: { type: String, state: true },
  };

  constructor() {
    super();
    this.label = '';
    this.language = '';
    this.encodedCode = '';
    this._copyState = 'copy';
    this._copyTransitionName = '';
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this.copyResetTimeout = undefined;
  }

  async copyCode() {
    this.clearCopyResetTimeout();
    try {
      await globalThis.navigator?.clipboard?.writeText(this.copyText);
      await this.setCopyState('success');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy code:', err);
      await this.setCopyState('error');
    }
    this.scheduleCopyReset();
  }

  firstUpdated() {
    this.syncSlottedCodeStyles();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearCopyResetTimeout();
  }

  /**
   * @param {Map<PropertyKey, unknown>} changedProperties
   */
  updated(changedProperties) {
    if (changedProperties.has('language')) {
      this.syncSlottedCodeStyles();
    }
  }

  syncSlottedCodeStyles() {
    const slot = this.renderRoot.querySelector('slot');
    const assignedElements = slot?.assignedElements({ flatten: true }) ?? [];

    for (const element of assignedElements) {
      if (element.localName !== 'pre') {
        continue;
      }

      this.syncPreStyles(/** @type {HTMLElement} */ (element));
    }
  }

  /**
   * @param {HTMLElement} pre
   */
  syncPreStyles(pre) {
    const code = pre.querySelector('code');

    pre.style.margin = '0';
    pre.style.borderRadius = '0';

    if (isShellLanguage(this.language)) {
      pre.style.backgroundColor = '#0d1117';
      pre.style.color = '#e6edf3';
      pre.style.setProperty('--rocket-code-line-number-color', '#8b949e');
      pre.style.setProperty('--rocket-code-highlight-background', 'rgba(56, 139, 253, 0.16)');
      pre.style.setProperty('--rocket-code-highlight-border', '#58a6ff');
      pre.style.setProperty('--rocket-code-inserted-background', 'rgba(46, 160, 67, 0.18)');
      pre.style.setProperty('--rocket-code-deleted-background', 'rgba(248, 81, 73, 0.16)');
    } else {
      pre.style.removeProperty('background-color');
      pre.style.removeProperty('color');
      pre.style.removeProperty('--rocket-code-line-number-color');
      pre.style.removeProperty('--rocket-code-highlight-background');
      pre.style.removeProperty('--rocket-code-highlight-border');
      pre.style.removeProperty('--rocket-code-inserted-background');
      pre.style.removeProperty('--rocket-code-deleted-background');
    }

    if (code instanceof HTMLElement) {
      code.style.display = 'block';
      code.style.background = 'transparent';
      code.style.padding = '0';
      code.style.borderRadius = '0';
      code.style.font = 'inherit';
      code.style.lineHeight = 'inherit';
      code.style.color = isShellLanguage(this.language) ? 'inherit' : '';
    }
  }

  get copyText() {
    return decodeBase64(this.encodedCode);
  }

  get copyButtonLabel() {
    return copyIconStates.find(icon => icon.state === this._copyState)?.label ?? 'Copy code';
  }

  /**
   * @param {string} state
   */
  async setCopyState(state) {
    if (this._copyState === state) {
      return;
    }

    const startViewTransition = this.startViewTransition;
    if (!this.isConnected || !startViewTransition) {
      this._copyState = state;
      return;
    }

    const transitionName = `rocket-code-copy-${RocketCodeBlock.copyTransitionId++}`;
    this._copyTransitionName = transitionName;

    try {
      await this.updateComplete;
      const transition = startViewTransition(async () => {
        this._copyState = state;
        await this.updateComplete;
      });
      transition.finished
        .finally(() => {
          if (this._copyTransitionName === transitionName) {
            this._copyTransitionName = '';
          }
        })
        .catch(() => {});
      await transition.updateCallbackDone;
    } catch {
      this._copyState = state;
      if (this._copyTransitionName === transitionName) {
        this._copyTransitionName = '';
      }
    }
  }

  get startViewTransition() {
    if (!this.ownerDocument) {
      return undefined;
    }
    const ownerDocument = /** @type {Document & ViewTransitionDocument} */ (this.ownerDocument);
    const startViewTransition = /** @type {unknown} */ (ownerDocument.startViewTransition);
    const prefersReducedMotion = ownerDocument.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (typeof startViewTransition !== 'function' || prefersReducedMotion) {
      return undefined;
    }

    return startViewTransition.bind(ownerDocument);
  }

  scheduleCopyReset() {
    this.copyResetTimeout = setTimeout(() => {
      this.copyResetTimeout = undefined;
      this.setCopyState('copy');
    }, 2000);
  }

  clearCopyResetTimeout() {
    if (this.copyResetTimeout) {
      clearTimeout(this.copyResetTimeout);
      this.copyResetTimeout = undefined;
    }
  }

  /**
   * @param {string} state
   */
  copyIconTransitionStyle(state) {
    if (this._copyTransitionName && this._copyState === state) {
      return `view-transition-name: ${this._copyTransitionName};`;
    }
    return undefined;
  }

  render() {
    const hasLabel = Boolean(this.label);
    const isTerminal = isShellLanguage(this.language);
    const languageBadge = this.language ? this.language.toUpperCase() : 'TEXT';
    const framePart = isTerminal ? 'frame terminal-frame' : 'frame';
    const codePart = isTerminal ? 'code terminal-code' : 'code';
    const copyButton = html`
      <button
        type="button"
        part=${hasLabel ? 'copy-button' : 'copy-button body-copy-button'}
        class=${hasLabel ? 'header-copy-button' : 'body-copy-button'}
        data-copy-state=${this._copyState}
        aria-label=${this.copyButtonLabel}
        title=${this.copyButtonLabel}
        @click=${() => this.copyCode()}
      >
        <span class="copy-button-icons" aria-hidden="true">
          ${copyIconStates.map(
            icon => html`
              <rocket-icon
                library="bootstrap"
                name=${icon.name}
                aria-hidden="true"
                ?data-active=${this._copyState === icon.state}
                style=${ifDefined(this.copyIconTransitionStyle(icon.state))}
              ></rocket-icon>
            `,
          )}
        </span>
      </button>
    `;

    return html`
      <figure part=${framePart} class=${isTerminal ? 'terminal' : ''}>
        ${hasLabel
          ? html`
              <figcaption part="caption">
                <span part="label">${this.label}</span>
                <span part="language-badge">${languageBadge}</span>
                ${copyButton}
              </figcaption>
            `
          : ''}
        <div part=${codePart}>
          <slot @slotchange=${() => this.syncSlottedCodeStyles()}></slot>
          ${hasLabel ? '' : copyButton}
        </div>
      </figure>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      margin: var(--rocket-code-margin, 1.3rem 0);
      --rocket-code-border: #dbe3ec;
      --rocket-code-border-radius: 8px;
      --rocket-code-frame-border: 1px solid var(--rocket-code-border);
      --rocket-code-header: #f8fafc;
      --rocket-code-surface: #fbfcfe;
      --rocket-code-text: #24292f;
      --rocket-code-muted: #57606a;
      --rocket-code-terminal-background: #0d1117;
      --rocket-code-terminal-text: #e6edf3;
      box-sizing: border-box;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    figure {
      margin: 0;
      overflow: hidden;
      border: var(--rocket-code-frame-border);
      border-radius: var(--rocket-code-border-radius);
      background: var(--rocket-code-surface);
    }

    figcaption {
      display: flex;
      min-height: 2.4rem;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--rocket-code-border);
      background: var(--rocket-code-header);
      color: var(--rocket-code-text);
      font-size: 0.875rem;
      line-height: 1.2;
      padding: 0.5rem 0.75rem;
    }

    [part='label'] {
      min-width: 0;
      flex: 1 1 auto;
      overflow-wrap: anywhere;
      font-weight: 600;
    }

    [part='language-badge'] {
      flex: 0 0 auto;
      border: 1px solid var(--rocket-code-border);
      border-radius: 999px;
      color: var(--rocket-code-muted);
      font-size: 0.6875rem;
      font-weight: 700;
      line-height: 1;
      padding: 0.25rem 0.45rem;
    }

    button {
      flex: 0 0 auto;
      display: inline-grid;
      inline-size: 2rem;
      block-size: 2rem;
      place-items: center;
      border: 1px solid var(--rocket-code-border);
      border-radius: 4px;
      background: white;
      color: var(--rocket-code-text);
      cursor: pointer;
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      line-height: 1;
      padding: 0;
    }

    button:hover {
      background: #eef2f6;
    }

    button[data-copy-state='success'] {
      border-color: #2da44e;
      background: #f0fff4;
      color: #1a7f37;
    }

    button[data-copy-state='success']:hover {
      background: #dcffe4;
    }

    button[data-copy-state='error'] {
      border-color: #cf222e;
      background: #fff1f1;
      color: #cf222e;
    }

    button[data-copy-state='error']:hover {
      background: #ffebe9;
    }

    .copy-button-icons {
      display: grid;
      inline-size: 1rem;
      block-size: 1rem;
      place-items: center;
    }

    .copy-button-icons rocket-icon {
      grid-area: 1 / 1;
      inline-size: 1rem;
      block-size: 1rem;
      opacity: 0;
      transform: scale(0.86);
      transition:
        opacity 140ms ease,
        transform 140ms ease;
    }

    .copy-button-icons rocket-icon[data-active] {
      opacity: 1;
      transform: scale(1);
    }

    [part~='code'] {
      position: relative;
      background: var(--rocket-code-surface);
    }

    .body-copy-button {
      position: absolute;
      top: 0.65rem;
      right: 0.65rem;
      z-index: 1;
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease-in-out;
    }

    figure:hover .body-copy-button,
    figure:focus-within .body-copy-button,
    .body-copy-button:focus-visible {
      opacity: 1;
      pointer-events: auto;
    }

    .terminal {
      --rocket-code-border: #30363d;
      --rocket-code-header: #161b22;
      --rocket-code-text: var(--rocket-code-terminal-text);
      --rocket-code-muted: #8b949e;
      background: var(--rocket-code-terminal-background);
    }

    .terminal [part~='code'] {
      background: var(--rocket-code-terminal-background);
    }

    .terminal button {
      background: #21262d;
      color: #f0f6fc;
    }

    .terminal button:hover {
      background: #30363d;
    }

    .terminal button[data-copy-state='success'] {
      border-color: #238636;
      background: #1f3528;
      color: #3fb950;
    }

    .terminal button[data-copy-state='success']:hover {
      background: #263f30;
    }

    .terminal button[data-copy-state='error'] {
      border-color: #da3633;
      background: #3d2226;
      color: #ff7b72;
    }

    .terminal button[data-copy-state='error']:hover {
      background: #4a292d;
    }

    ::slotted(pre) {
      display: block;
      max-width: 100%;
      margin: 0 !important;
      padding: 1rem 1.1rem !important;
      border-radius: 0 !important;
      overflow-x: auto;
    }

    .terminal ::slotted(pre) {
      --rocket-code-line-number-color: #8b949e;
      --rocket-code-highlight-background: rgba(56, 139, 253, 0.16);
      --rocket-code-highlight-border: #58a6ff;
      --rocket-code-inserted-background: rgba(46, 160, 67, 0.18);
      --rocket-code-deleted-background: rgba(248, 81, 73, 0.16);
      background: var(--rocket-code-terminal-background) !important;
      color: var(--rocket-code-terminal-text) !important;
    }

    @media (hover: none), (pointer: coarse) {
      .body-copy-button {
        opacity: 1;
        pointer-events: auto;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .body-copy-button,
      .copy-button-icons rocket-icon {
        transition: none;
      }
    }
  `;
}

/**
 * @typedef {{
 *   startViewTransition?: (
 *     updateCallback: () => void | Promise<void>,
 *   ) => {
 *     finished: Promise<void>;
 *     updateCallbackDone: Promise<void>;
 *   };
 * }} ViewTransitionDocument
 */

/**
 * @param {string} value
 */
function decodeBase64(value) {
  if (!value) {
    return '';
  }

  const binary = atob(value);
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
}

/**
 * @param {string} language
 */
function isShellLanguage(language) {
  return shellLanguages.has(language.toLowerCase());
}
