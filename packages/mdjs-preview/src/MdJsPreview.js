import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

/**
 * @typedef {object} StoryOptions
 * @property {ShadowRoot | null} StoryOptions.shadowRoot
 */

/** @typedef {(options?: StoryOptions) => ReturnType<LitElement['render']>} LitHtmlStoryFn */

/**
 * Renders a story within a preview frame
 *
 * @element mdjs-preview
 * @prop {StoryFn} [story=(() => TemplateResult)] Function that returns the story
 */
export class MdJsPreview extends LitElement {
  static get properties() {
    return {
      story: {
        attribute: false,
      },
      code: {
        type: String,
      },
      codeHasHtml: {
        type: Boolean,
      },
      showCode: {
        type: Boolean,
        attribute: 'show-code',
        reflect: true,
      },
    };
  }

  toggleShowCode() {
    this.showCode = !this.showCode;
  }

  constructor() {
    super();
    this.code = '';
    /** @type {LitHtmlStoryFn} */
    this.story = () => html` <p>Loading...</p> `;
    this.codeHasHtml = false;
  }

  render() {
    return html`
      <div id="wrapper">
        <div>${this.story({ shadowRoot: this.shadowRoot })}</div>
        <button id="showCodeButton" @click=${this.toggleShowCode}>show code</button>
      </div>
      ${this.codeHasHtml ? unsafeHTML(this.code) : html`<pre><code>${this.code}</code></pre>`}
    `;
  }

  static get styles() {
    return css`
      :host {
        border: 1px solid #ccc;
        display: block;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px;
      }

      #showCodeButton {
        position: absolute;
        right: 5px;
        bottom: 5px;
        font-size: 12px;
        line-height: 20px;
        color: #24292e;
        background-color: #eff3f6;
        background-image: linear-gradient(-180deg, #fafbfc, #eff3f6 90%);
        display: inline-block;
        padding: 3px 12px;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background-repeat: repeat-x;
        background-position: -1px -1px;
        background-size: 110% 110%;
        border: 1px solid rgba(27, 31, 35, 0.2);
        border-radius: 0.25em;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }

      #showCodeButton:hover {
        background-color: #e6ebf1;
        background-image: linear-gradient(-180deg, #f0f3f6, #e6ebf1 90%);
        background-position: -0.5em;
        border-color: rgba(27, 31, 35, 0.35);
        text-decoration: none;
        background-repeat: repeat-x;
      }

      #wrapper {
        position: relative;
        padding: 10px;
      }

      :host > pre {
        display: none;
        margin: 0;
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 3px;
      }

      :host([show-code]) > pre {
        display: block;
      }

      code[class*='language-'],
      pre[class*='language-'] {
        color: #393a34;
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
        direction: ltr;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        tab-size: 4;
        hyphens: none;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 3px;
      }

      .token.function,
      .token.class-name {
        color: #6f42c1;
      }

      .token.tag,
      .token.selector,
      .language-autohotkey .token.keyword {
        color: #22863a;
      }

      .token.entity,
      .token.url,
      .token.symbol,
      .token.number,
      .token.boolean,
      .token.variable,
      .token.constant,
      .token.property,
      .token.inserted,
      .token.punctuation,
      .token.operator {
        color: #005cc5;
      }

      .token.regex {
        color: #032f62;
      }

      .token.atrule,
      .token.keyword,
      .token.attr-name,
      .language-autohotkey .token.selector {
        color: #d73a49;
      }
    `;
  }
}
