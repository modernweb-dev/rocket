import { html, LitElement } from 'lit-element';

export class CodeCopyButton extends LitElement {
  static get properties() {
    return {
      /** Text content */
      textToCopy: {
        type: String,
      },
      copyButtonText: {
        type: String,
      },
    };
  }

  getCopiedText() {
    return this.textToCopy;
  }

  constructor() {
    super();
    this.textToCopy = '';
    this.is = 'code-copy';
    this.copyButtonText = 'Copy';
    this.supportsClipboard = 'clipboard' in navigator;
  }

  render() {
    return html`
      <slot></slot>
      <button id="copy-button" @click="${this.onCopy}" ?hidden="${!this.supportsClipboard}">
        ${this.copyButtonText}
      </button>
    `;
  }

  async onCopy() {
    if (this.textToCopy) {
      await navigator.clipboard.writeText(this.textToCopy.trim());
      this.copyButtonText = 'Copied ✅';
      setTimeout(() => {
        this.copyButtonText = 'Copy';
      }, 2000);
    }
  }
}

customElements.define('code-copy-button', CodeCopyButton);
