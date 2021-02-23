import { LitElement, html, css } from 'lit-element';
import frame from './frame.svg.js';

const DEVICES = {
  contentFlow: {
    name: 'Content Flow',
    system: 'web',
    width: 'auto',
    height: 'auto',
    dpr: 1,
  },
  webSmall: {
    name: 'Web Small',
    system: 'web',
    width: 360,
    height: 640,
    dpr: 1,
  },
  pixel2: {
    name: 'Pixel 2',
    system: 'android',
    width: 411,
    height: 731,
    dpr: 2.6,
  },
  galaxyS5: {
    name: 'Galaxy 5',
    system: 'android',
    width: 360,
    height: 640,
    dpr: 3,
  },
  iphoneX: {
    name: 'iPhone X',
    system: 'ios',
    width: 375,
    height: 812,
    dpr: 3,
  },
};

export class DevicePreview extends LitElement {
  static get properties() {
    return {
      jsCode: { type: String },
      device: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    this.jsCode = '';
    this.device = 'pixel2';
    this.iframe = null;
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;
          position: relative;
        }
        iframe {
          border: none;
          background: #fff;
          background: green;
        }
        :host([device='pixel2']) iframe {
          width: 411px;
          height: 640px;
        }
        div,
        iframe {
          position: absolute;
        }
        iframe {
          top: 100px;
          left: 100px;
        }
        svg {
          width: 587px;
        }
      `,
    ];
  }

  update(changedProperties) {
    super.update(changedProperties);

    if (this.iframe) {
      const iframeContent = `
        <html>
          <head>
            <script type="importmap">
            {
              "imports": {
                "lit-html": "http://localhost:8000/__wds-outside-root__/1/node_modules/lit-html/lit-html.js",
                "@rocket/launch/inline-notification-element": "http://localhost:8000/__wds-outside-root__/1/packages/launch/inline-notification/inline-notification.js"
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
            ${this.jsCode}
          </script>
          <body></body>
        </html>
      `;
      this.iframe.src = `data:text/html;charset=utf-8,${encodeURIComponent(iframeContent)}`;
    }
  }

  firstUpdated() {
    this.iframe = this.shadowRoot.querySelector('iframe');
  }

  render() {
    return html`
      <iframe
        sandbox="allow-scripts"
        csp="script-src localhost:8000 'unsafe-inline'; connect-src 'none'"
      ></iframe>
      <div>${frame(html)}</div>
    `;
  }
}
