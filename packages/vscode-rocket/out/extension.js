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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require('vscode'));
const path_1 = __importDefault(require('path'));
// import { startDevServer } from "@web/dev-server";
const WebDevServerPanel_1 = require('./WebDevServerPanel');
async function activate(context) {
  const rootDir = vscode?.workspace?.workspaceFolders?.[0]?.uri?.fsPath || '';
  if (!rootDir) {
    vscode.window.showErrorMessage(`VS Code Web Dev Server only works with a single workspace`);
  }
  console.log({ rootDir });
  const workspaceRoot = path_1.default.resolve(rootDir);
  // @ts-ignore
  const { Engine } = await import('@rocket/engine/server');
  const engine = new Engine();
  engine.setOptions({
    docsDir: path_1.default.join(rootDir, 'docs'),
    outputDir: path_1.default.join(rootDir, '_site-dev'),
  });
  await engine.start();
  // const devServer = await startDevServer({
  //   config: {
  //     rootDir,
  //     watch: true,
  //     nodeResolve: true,
  //   },
  //   // argv: ['', '', '--config', workspaceRoot]
  // });
  const url = `http://localhost:${engine.devServer.config.port}`;
  const preview = new WebDevServerPanel_1.PreviewViewProvider(context.extensionUri, url);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WebDevServerPanel_1.PreviewViewProvider.viewType,
      preview,
    ),
  );
  vscode.window.onDidChangeActiveTextEditor(ev => {
    const fsPath = ev?.document?.uri?.fsPath || '';
    if (fsPath.endsWith('.html') && fsPath.startsWith(rootDir)) {
      const newPathname = path_1.default.relative(rootDir, fsPath);
      vscode.window.showInformationMessage(`changed to 👋! ${newPathname}`);
      // devServer.webSockets.sendImport(
      //   `data:text/javascript,window.location.pathname='${newPathname}';`
      // );
      preview.url = `${url}/${newPathname}`;
    }
  });
  let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
    vscode.window.showInformationMessage(`Howdy2 👋! ${engine.devServer.config.port}`);
  });
  // context.subscriptions.push(
  //   vscode.commands.registerCommand("helloworld.start", () => {
  //     WebDevServerPanel.createOrShow(context.extensionUri);
  //   })
  // );
  // context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
