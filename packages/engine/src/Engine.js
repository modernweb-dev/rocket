/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').EngineOptions} EngineOptions */
import { existsSync } from 'fs';
// TODO: implement copy without extra dependency
import fse from 'fs-extra';
import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { startDevServer } from '@web/dev-server';
import { diary } from 'diary';

import { applyPlugins } from 'plugins-manager';

import { gatherFiles } from './gatherFiles.js';
import { cleanupWorker, renderViaWorker } from './renderViaWorker.js';
import { updateRocketHeader } from './updateRocketHeader.js';
import { Watcher } from './Watcher.js';

import { PageTree } from './web-menu/PageTree.js';
import {
  sourceRelativeFilePathToOutputRelativeFilePath,
  sourceRelativeFilePathToUrl,
  urlToSourceFilePath,
} from './urlPathConverter.js';
import { AdjustAssetUrls } from './index.js';

const logRendering = diary('engine:rendering');

export class Engine {
  /** @type {EngineOptions} */
  options = {
    plugins: undefined,
    defaultPlugins: [],
    setupPlugins: [],
    renderMode: 'development',
    open: false,
  };

  events = new EventEmitter();

  /**
   * @param {Partial<EngineOptions>} [options]
   */
  constructor(options = {}) {
    this.setOptions({ ...this.options, ...options });
  }

  /**
   * @param {Partial<EngineOptions>} newOptions
   */
  setOptions(newOptions) {
    if (!newOptions) {
      return;
    }

    const setupPlugins = [...(newOptions.setupPlugins || []), ...(this.options.setupPlugins || [])];
    this.options = {
      ...this.options,
      ...newOptions,
      setupPlugins,
    };

    const { docsDir: userDocsDir, outputDir: userOutputDir, watchDir: userWatchDir } = this.options;
    this.docsDir = userDocsDir ? path.resolve(userDocsDir) : path.join(process.cwd(), 'docs');
    this.outputDir = userOutputDir
      ? path.resolve(userOutputDir)
      : path.join(this.docsDir, '..', '_site-dev');
    this.watchDir = userWatchDir ? path.resolve(userWatchDir) : process.cwd();
  }

  async build() {
    await this.prepare();
    const pageTree = new PageTree({ inputDir: this.docsDir, outputDir: this.outputDir });

    // write files
    const sourceFiles = await gatherFiles(this.docsDir);

    if (sourceFiles.length > 0) {
      for (const sourceFilePath of sourceFiles) {
        await updateRocketHeader(sourceFilePath, this.docsDir);
        const { sourceRelativeFilePath } = await this.renderFile(sourceFilePath);
        await pageTree.add(sourceRelativeFilePath);
      }

      await pageTree.save();

      if (pageTree.pageTreeChangedOnSave) {
        for (const sourceFilePath of sourceFiles) {
          await this.renderFile(sourceFilePath);
        }
      }
    }

    await this.stop();
  }

  async clearOutputDir() {
    await rm(this.outputDir, { recursive: true, force: true });
  }

  async prepare({ clearOutputDir = true } = {}) {
    const defaultPlugins = this.options.defaultPlugins ? [...this.options.defaultPlugins] : [];
    this.options = applyPlugins(this.options, defaultPlugins);

    // prepare outputDir
    if (!existsSync(this.outputDir)) {
      await mkdir(this.outputDir, { recursive: true });
    } else if (clearOutputDir) {
      await this.clearOutputDir();
    }

    // copy public files
    const publicDir = path.join(this.docsDir, '__public');
    if (existsSync(publicDir)) {
      await fse.copy(publicDir, this.outputDir);
    }

    // copy public files of plugins
    for (const plugin of this.options.plugins) {
      const publicFolder = plugin.constructor.publicFolder;
      if (publicFolder && existsSync(publicFolder)) {
        await fse.copy(publicFolder, this.outputDir);
      } else {
        console.log(
          `Plugin ${plugin.constructor.name} defined a public folder ${publicFolder} but it does not exist.`,
        );
      }
    }
  }

  async start(options = {}) {
    await this.prepare(options);
    const files = await gatherFiles(this.docsDir);

    const pageTree = new PageTree({ inputDir: this.docsDir, outputDir: this.outputDir });
    await pageTree.restore();

    const registerTabPlugin = () => {
      return {
        name: 'register-tab-plugin',
        injectWebSocket: true,
        serve: async context => {
          if (context.path === '/ws-register-tab.js') {
            return "import { sendMessage } from '/__web-dev-server__web-socket.js';\n export default () => { sendMessage({ type: 'register-tab', pathname: document.location.pathname }); }";
          }

          // generating files on demand
          const sourceFilePath = await this.getSourceFilePathFromUrl(context.path);
          if (sourceFilePath) {
            const outputFilePath = this.getOutputFilePath(sourceFilePath);
            if (!existsSync(outputFilePath)) {
              const sourceRelativeFilePath = path.relative(this.docsDir, sourceFilePath);
              await updateRocketHeader(sourceFilePath, this.docsDir);
              logRendering.info(
                `${sourceRelativeFilePath} because it got requested by a browser tab.`,
              );
              await this.renderFile(sourceFilePath);
              await pageTree.add(sourceRelativeFilePath);
              await pageTree.save();
              if (pageTree.needsAnotherRenderingPass) {
                logRendering.info(`${sourceRelativeFilePath} again as the pageTree was modified.`);
                await this.renderFile(sourceFilePath);
                await this.renderAllOpenedFiles({ triggerSourceFilePath: sourceFilePath });
                pageTree.needsAnotherRenderingPass = false;
              }
            }
          }
        },
      };
    };

    const devServerAdjustAssetUrls = () => {
      const adjustAssetUrl = new AdjustAssetUrls({
        adjustAssetUrl: async ({
          url,
          /* sourceFilePath, sourceRelativeFilePath, */ outputFilePath,
        }) => {
          if (url.startsWith('./') || url.startsWith('../')) {
            const assetFilePath = path.join(path.dirname(outputFilePath), url);
            let relPath = path.relative(this.outputDir, assetFilePath);
            let count = 0;
            while (relPath.startsWith('../')) {
              relPath = relPath.substring(3);
              count += 1;
            }
            return `/__wds-outside-root__/${count}/${relPath}`;
          }
          return url;
        },
      });

      return {
        name: 'dev-server-adjust-asset-urls',
        transform: async context => {
          const sourceFilePath = await this.getSourceFilePathFromUrl(context.path);
          if (sourceFilePath) {
            const outputFilePath = this.getOutputFilePath(sourceFilePath);
            const sourceRelativeFilePath = path.relative(this.docsDir, sourceFilePath);
            const outputRelativeFilePath = path.relative(this.outputDir, outputFilePath);
            const newBody = await adjustAssetUrl.transform(context.body, {
              sourceFilePath,
              sourceRelativeFilePath,
              outputFilePath,
              outputRelativeFilePath,
              url: sourceRelativeFilePathToUrl(sourceRelativeFilePath),
            });
            return newBody;
          }
        },
      };
    };

    this.devServer = await startDevServer({
      config: {
        open: this.options.open,
        nodeResolve: true,
        watch: true,
        rootDir: this.outputDir,
        clearTerminalOnReload: false,
        plugins: [registerTabPlugin(), devServerAdjustAssetUrls()],
      },
      logStartMessage: false,
      readCliArgs: false,
      readFileConfig: false,
      // argv: this.__argv,
    });

    this.devServer.webSockets.on('message', async ({ webSocket, data }) => {
      const sourceFilePath = await this.getSourceFilePathFromUrl(data.pathname);
      this.watcher?.addWebSocketToPage(sourceFilePath, webSocket);
    });

    this.devServer.webSockets.webSocketServer.on('connection', webSocket => {
      webSocket.on('close', () => {
        this.watcher?.removeWebSocket(webSocket);
      });

      webSocket.send(
        JSON.stringify({ type: 'import', data: { importPath: '/ws-register-tab.js' } }),
      );
    });

    this.watcher = new Watcher();
    await this.watcher.init(this.watchDir, { ignore: [this.outputDir], inputDir: this.docsDir });
    await this.watcher.addPages(files);

    this.watcher.watchPages({
      onPageSavedOrOpenedTabAndServerDependencyChanged: async page => {
        await updateRocketHeader(page.sourceFilePath, this.docsDir);
        try {
          await this.renderFile(page.sourceFilePath);
          const sourceRelativeFilePath = path.relative(this.docsDir, page.sourceFilePath);

          await pageTree.add(sourceRelativeFilePath);
          await pageTree.save();

          if (pageTree.needsAnotherRenderingPass) {
            logRendering.info(`${sourceRelativeFilePath} again as the pageTree was modified.`);
            await this.renderFile(page.sourceFilePath);
            await this.renderAllOpenedFiles({ triggerSourceFilePath: page.sourceFilePath });
            pageTree.needsAnotherRenderingPass = false;
          }
        } catch (error) {
          console.log(error);
          await this.writeErrorAsHtmlToOutput(page.sourceFilePath, error);
        }
        // reload happens by web dev server automatically
      },
      onPageServerDependencySaved: async page => {
        await updateRocketHeader(page.sourceFilePath, this.docsDir);
        // no need to render as the page itself is not saved nor is the page open in any browser tab
        // we however clear the current output file as it's now out of date and will be rerendered on demand
        await this.deleteOutputOf(page.sourceFilePath);
      },
      onPageDeleted: async page => {
        await this.deleteOutputOf(page.sourceFilePath);
      },
      onDone: async () => {
        this.events.emit('rocketUpdated');
      },
    });
  }

  async stop() {
    this?.watcher?.cleanup();
    this.devServer?.stop();
    await cleanupWorker();
  }

  /**
   * @param {string} sourceFilePath
   */
  async deleteOutputOf(sourceFilePath) {
    await rm(this.getOutputFilePath(sourceFilePath), { force: true });
  }

  getOutputFilePath(sourceFilePath) {
    const sourceRelativeFilePath = path.relative(this.docsDir, sourceFilePath);
    const outputRelativeFilePath = sourceRelativeFilePathToOutputRelativeFilePath(
      sourceRelativeFilePath,
    );
    return path.join(this.outputDir, outputRelativeFilePath);
  }

  async getSourceFilePathFromUrl(url) {
    return await urlToSourceFilePath(url, this.docsDir);
  }

  async writeErrorAsHtmlToOutput(sourceFilePath, error) {
    function escape(input) {
      let escaped = input;
      escaped = escaped.replace(/</g, '&gt;');
      escaped = escaped.replace(/>/g, '&lt;');
      return escaped;
    }
    const outputFilePath = this.getOutputFilePath(sourceFilePath);
    const errorHtml = `
      <html>
        <head>
          <title>${error.message}</title>
        </head>
        <body>
          <h1>${error.message}</h1>
          <pre>${escape(error.stack)}</pre>
        </body>
      </html>
    `;
    const outputFilePathDir = path.dirname(outputFilePath);

    if (!existsSync(outputFilePathDir)) {
      await mkdir(outputFilePathDir, { recursive: true });
    }

    await writeFile(outputFilePath, errorHtml);
  }

  async renderAllOpenedFiles({ deleteOtherFiles = true, triggerSourceFilePath = '' } = {}) {
    if (this.watcher) {
      for (const [sourceFilePath, page] of this.watcher.pages.entries()) {
        if (triggerSourceFilePath && triggerSourceFilePath === sourceFilePath) {
          // no need to rerender the file that triggered it
          continue;
        }
        const isOpenedInBrowser = !!page.webSockets?.size ?? false;
        if (isOpenedInBrowser) {
          logRendering.info(
            `${path.relative(
              this.docsDir,
              sourceFilePath,
            )} because it is opened in a browser tab and the page tree has changed.`,
          );
          await this.renderFile(sourceFilePath);
          // reload happens by web dev server automatically
        } else if (deleteOtherFiles === true) {
          await this.deleteOutputOf(sourceFilePath);
        }
      }
    }
  }

  async renderFile(filePath, { writeFileToDisk = true } = {}) {
    const result = await renderViaWorker({
      filePath,
      outputDir: this.outputDir,
      writeFileToDisk,
      renderMode: this.options.renderMode,
    });
    return result;
  }
}
