'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PreviewViewProvider = void 0;
const vscode = __importStar(require('vscode'));
const getNonce_1 = require('./getNonce');
/**
 * Manages cat coding webview panels
 */
class PreviewViewProvider {
  constructor(_extensionUri, url) {
    this._extensionUri = _extensionUri;
    this._url = 'http://localhost:3000/';
    this._url = url;
  }
  resolveWebviewView(webviewView, context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    this._update();
  }
  set url(url) {
    if (!this._view) {
      return;
    }
    this._view.webview.postMessage({ type: 'update-url', url });
  }
  async _update() {
    if (!this._view) {
      return;
    }
    const fullWebServerUri = await vscode.env.asExternalUri(vscode.Uri.parse(this._url));
    // const fullWebServerUri = `http://localhost:${dynamicWebServerPort}`;
    const cspSource = this._view.webview.cspSource;
    const scriptUri = this._view.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'),
    );
    const nonce = (0, getNonce_1.getNonce)();
    this._view.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Preview</title>
          <style>
            iframe { position: absolute; right: 0; bottom: 0; left: 0; top: 38px; border: 0; background-color: white; }
            div { text-align: center; position: absolute; right: 0; bottom: 0; left: 0; top: 0; }
            input { border-radius: 10px; border: 1px solid #333; padding: 4px 10px; width: calc(100vw - 50px); background: #333; color: #ddd; margin: 5px 0; }
          </style>
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${cspSource} https:; script-src ${cspSource} 'nonce-${nonce}'; style-src ${cspSource};"
          />
          
      </head>
      <body>
        <div>
          <input type="text" readonly value="${this._url}" />
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <iframe src="${fullWebServerUri}" frameBorder="0" width="100%" height="100%" />        
      </body>
      </html>
    `;
  }
}
exports.PreviewViewProvider = PreviewViewProvider;
PreviewViewProvider.viewType = 'rocket.previewView';
//# sourceMappingURL=WebDevServerPanel.js.map
