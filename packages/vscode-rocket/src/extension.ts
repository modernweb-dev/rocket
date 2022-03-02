// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';

// import { startDevServer } from "@web/dev-server";

import { PreviewViewProvider } from './WebDevServerPanel';

export async function activate(context: vscode.ExtensionContext) {
  const rootDir = vscode?.workspace?.workspaceFolders?.[0]?.uri?.fsPath || '';

  if (!rootDir) {
    vscode.window.showErrorMessage(`VS Code Web Dev Server only works with a single workspace`);
  }

  console.log({ rootDir });
  const workspaceRoot = path.resolve(rootDir);

  // @ts-ignore
  const { Engine } = await import('@rocket/engine/server');

  const engine = new Engine();
  engine.setOptions({
    docsDir: path.join(rootDir, 'docs'),
    outputDir: path.join(rootDir, '_site-dev'),
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
  const preview = new PreviewViewProvider(context.extensionUri, url);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(PreviewViewProvider.viewType, preview),
  );

  vscode.window.onDidChangeActiveTextEditor(ev => {
    const fsPath = ev?.document?.uri?.fsPath || '';
    if (fsPath.endsWith('.html') && fsPath.startsWith(rootDir)) {
      const newPathname = path.relative(rootDir, fsPath);
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

// this method is called when your extension is deactivated
export function deactivate() {}
