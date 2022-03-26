import { html, css, LitElement } from 'lit';

export class OpenGraphOverview extends LitElement {
  static properties = {
    pages: { type: Array },
    inputDir: { type: String, attribute: 'input-dir' },
  };

  constructor() {
    super();
    /** @type {{ url: string, sourceRelativeFilePath: string }} */
    this.pages = [];
  }

  renderPage({ url, sourceRelativeFilePath }) {
    const iframeUrl = url.endsWith('/')
      ? `${url}index.opengraph.html`
      : url.replace(/\.html$/, '.opengraph.html');

    return html`
      <div>
        <div id="bar">
          <a href="${url}">${url}</a>
          <div id="bar-icons">
            <a href="${url}" target="_blank">
              <server-icon icon="solid/external-link-alt"></server-icon>
            </a>
            <a href="${iframeUrl}" target="_blank">
              <server-icon icon="solid/image"></server-icon>
            </a>
            <a href="vscode://file${this.inputDir}${sourceRelativeFilePath}">
              <server-icon icon="solid/laptop-code"></server-icon>
            </a>
          </div>
        </div>
        <div id="iframe-wrapper">
          <iframe src="${iframeUrl}" loading="lazy" width="1200" height="628"></iframe>
        </div>
      </div>
    `;
  }

  render() {
    return this.pages.map(page => this.renderPage(page));
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex-flow: row wrap;
        gap: 20px;
      }
      #iframe-wrapper {
        position: relative;
        width: 600px;
        height: 314px;
      }
      iframe {
        transform: scale(0.5);
        position: absolute;
        left: -50%;
        top: -50%;
        border: none;
      }
      #bar {
        border: 1px solid #ccc;
        border-radius: 25px;
        padding: 5px 25px;
        margin-bottom: 10px;
        font-size: 20px;
        line-height: 1.6;
        display: flex;
        justify-content: space-between;
      }
      #bar-icons {
        display: flex;
        gap: 5px;
      }
      a {
        text-decoration: none;
        color: #333;
      }
    `,
  ];
}
