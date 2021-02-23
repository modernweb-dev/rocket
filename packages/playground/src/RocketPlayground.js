import { LitElement, html, css } from 'lit-element';
import '@vanillawc/wc-monaco-editor';
import './device-preview.js';

/**
 * @typedef {object} StoryOptions
 * @property {ShadowRoot | null} StoryOptions.shadowRoot
 */

/** @typedef {(options?: StoryOptions) => ReturnType<LitElement['render']>} LitHtmlStoryFn */

/** @typedef {import('./devices.js').devices} devices */

export function createViewer(jsCode) {
  const iframeViewer = document.createElement('iframe');
  const iframeContent = `
    <html>
      <head>
        <script type="importmap">
        {
          "imports": {
            "lit-html": "http://localhost:8000/__wds-outside-root__/1/node_modules/lit-html/lit-html.js"
          }
        }
        </script>
      </head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          margin: 0;
        }
      </style>
      <script type="module">
        ${jsCode}
      </script>
      <body></body>
    </html>
  `;

  iframeViewer.setAttribute('style', `border: none; background: #fff;`);
  iframeViewer.setAttribute('sandbox', 'allow-scripts');
  iframeViewer.setAttribute('csp', "script-src localhost:8000 'unsafe-inline'; connect-src 'none'");

  // Uses a data url as when using srcdoc the iframe csp rules get ignored?
  // iframeViewer.setAttribute('srcdoc', iframeContent);
  iframeViewer.src = `data:text/html;charset=utf-8,${escape(iframeContent)}`;

  return iframeViewer;
}

/**
 * Renders a story
 *
 * @element mdjs-story
 * @prop {StoryFn} [story=(() => TemplateResult)] Function that returns the story
 */
export class RocketPlayground extends LitElement {
  static get properties() {
    return {
      story: {
        attribute: false,
      },
      jsCode: {
        type: String,
      },
      showDevices: {
        type: Array,
      },
    };
  }

  constructor() {
    super();
    /** @type {LitHtmlStoryFn} */
    this.story = () => html` <p>Loading...</p> `;

    this.jsCode = '';

    // this.story({ shadowRoot: this.shadowRoot });

    this.urlState = new URLSearchParams(document.location.search);
    // this.urlState.append('jsCode', '');

    /**
     * @type {Array<keyof devices>}
     */
    this.showDevices = ['pixel2'];
  }

  setJsCode(jsCode) {
    const encoded = flate.gzip_encode(jsCode);
    this.urlState.set('jsCode', encoded);
    this.updateUrl();
    this.jsCode = jsCode;
  }

  updateUrl() {
    history.pushState('', '', '?' + this.urlState.toString());
  }

  // createRenderRoot() {
  //   return this;
  // }

  setup() {
    this.editorWc = this.querySelector('wc-monaco-editor');
    if (this.editorWc) {
      this.editorWc.tabSize = 2;

      if (this.urlState.get('jsCode')) {
        this.jsCode = flate.gzip_decode(this.urlState.get('jsCode'));
      }

      const value = [
        "import { html, render } from 'lit-html';",
        'export const foo = () => html`',
        '  <p>hey there</p>',
        '`;',
        "render(foo(), document.querySelector('body'))",
      ].join('\n');
      this.editorWc.value = this.jsCode || value;

      this.editorWc.editor.getModel().onDidChangeRawContentFast(() => {
        this.setJsCode(this.editorWc.value);
      });
    }
  }

  firstUpdated() {
    setTimeout(() => {
      this.setup();
    }, 100);
  }

  connectedCallback() {
    super.connectedCallback();
    this.editorWc = document.createElement('wc-monaco-editor');
    this.editorWc.slot = 'editor';
    this.editorWc.setAttribute('language', 'javascript');
    this.appendChild(this.editorWc);
  }

  static get styles() {
    return [
      css`
        :host {
          display: flex;
          height: 100%;
        }
        #editor-wrapper,
        #devices-wrapper {
          width: 50%;
        }
      `,
    ];
  }

  render() {
    return html`
      <div id="editor-wrapper">
        <slot name="editor"></slot>
      </div>
      <div id="devices-wrapper">
        ${this.showDevices.map(
          device => html` <device-preview .jsCode=${this.jsCode} .device=${device}></device-preview> `,
        )}
      </div>
    `;
  }
}
