import * as vscode from 'vscode';
import { getNonce } from './getNonce';

/**
 * Manages cat coding webview panels
 */
export class PreviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'rocket.previewView';

  private _view?: vscode.WebviewView;
  private _url: string = 'http://localhost:3000/';

  constructor(private readonly _extensionUri: vscode.Uri, url: string) {
    this._url = url;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._update();
  }

  public set url(url: string) {
    if (!this._view) {
      return;
    }
    this._view.webview.postMessage({ type: 'update-url', url });
  }

  private async _update() {
    if (!this._view) {
      return;
    }
    const fullWebServerUri = await vscode.env.asExternalUri(vscode.Uri.parse(this._url));
    // const fullWebServerUri = `http://localhost:${dynamicWebServerPort}`;

    const cspSource = this._view.webview.cspSource;
    const scriptUri = this._view.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'),
    );
    const nonce = getNonce();

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

  // public static createOrShow(extensionUri: vscode.Uri) {
  //   const column = vscode.window.activeTextEditor
  //     ? vscode.window.activeTextEditor.viewColumn
  //     : undefined;

  //   // If we already have a panel, show it.
  //   if (WebDevServerPanel.currentPanel) {
  //     WebDevServerPanel.currentPanel._panel.reveal(column);
  //     return;
  //   }

  //   // Otherwise, create a new panel.
  //   const panel = vscode.window.createWebviewPanel(
  //     WebDevServerPanel.viewType,
  //     "Cat Coding",
  //     vscode.ViewColumn.Two,
  //     {
  //       enableScripts: true,
  //       retainContextWhenHidden: true,
  //     }
  //   );

  //   WebDevServerPanel.currentPanel = new WebDevServerPanel(panel, extensionUri);
  // }
}
