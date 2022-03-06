/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main.js').EngineOptions} EngineOptions */
/** @typedef {import('../types/main.js').DevServerPlugin} DevServerPlugin */
/** @typedef {import('../types/main.js').DevServerMiddleware} DevServerMiddleware */

import { existsSync } from 'fs';
// TODO: implement copy without extra dependency
import fse from 'fs-extra';
import { mkdir, rm } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { startDevServer } from '@web/dev-server';
import { debuglog } from 'util';

import { applyPlugins } from 'plugins-manager';

import { gatherFiles } from './gatherFiles.js';
import { cleanupRenderWorker, renderViaWorker } from './worker/renderViaWorker.js';
import { updateRocketHeader } from './file-header/updateRocketHeader.js';
import { Watcher } from './Watcher.js';

import { PageTree } from './web-menu/PageTree.js';
import {
  sourceRelativeFilePathToOutputRelativeFilePath,
  urlToSourceFilePath,
} from './file-header/urlPathConverter.js';
import { cleanupAutoGeneratedFiles } from './formats/cleanupAutoGeneratedFiles.js';
import { cleanupImportWorker } from './worker/importViaWorker.js';
import { devServerRegisterTab } from './dev-server/devServerRegisterTab.js';
import { devServerAdjustAssetUrls } from './dev-server/devServerAdjustAssetUrls.js';

const logRendering = debuglog('engine:rendering');

export class Engine {
  /** @type {Partial<EngineOptions>} */
  options = {
    defaultPlugins: [],
    setupPlugins: [],
    renderMode: 'development',
    open: false,
  };

  events = new EventEmitter();

  docsDir = path.join(process.cwd(), 'docs');
  outputDir = path.join(process.cwd(), '_site-dev');
  watchDir = process.cwd();

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

  async build({ autoStop = true } = {}) {
    await this.prepare();
    const pageTree = new PageTree({ inputDir: this.docsDir, outputDir: this.outputDir });

    // write files
    const sourceFiles = await gatherFiles(this.docsDir);

    if (sourceFiles.length > 0) {
      for (const sourceFilePath of sourceFiles) {
        await updateRocketHeader(sourceFilePath, this.docsDir);
        const result = await this.renderFile(sourceFilePath);
        await pageTree.add(result.sourceRelativeFilePath);
        await cleanupAutoGeneratedFiles(result);
      }
      await pageTree.save();

      if (pageTree.pageTreeChangedOnSave) {
        for (const sourceFilePath of sourceFiles) {
          const result = await this.renderFile(sourceFilePath);
          await cleanupAutoGeneratedFiles(result);
        }
      }
    }

    if (autoStop) {
      await this.stop();
    }
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
    await this.copyPublicFilesTo(this.outputDir);
  }

  /**
   * @param {string} targetDir
   */
  async copyPublicFilesTo(targetDir) {
    // copy public files
    const publicDir = path.join(this.docsDir, '..', 'public');
    if (existsSync(publicDir)) {
      await fse.copy(publicDir, targetDir);
    }
    // copy public files of plugins
    if (this.options.plugins) {
      for (const plugin of this.options.plugins) {
        // @ts-ignore
        const publicFolder = plugin.constructor.publicFolder;
        if (publicFolder && existsSync(publicFolder)) {
          await fse.copy(publicFolder, targetDir);
        } else {
          console.log(
            `Plugin ${plugin.constructor.name} defined a public folder ${publicFolder} but it does not exist.`,
          );
        }
      }
    }
  }

  async start(options = {}) {
    await this.prepare(options);
    const files = await gatherFiles(this.docsDir);

    const pageTree = new PageTree({ inputDir: this.docsDir, outputDir: this.outputDir });
    await pageTree.restore();

    /** @type {any[]} */
    let devServerPluginsMeta = [
      {
        plugin: devServerRegisterTab,
        options: {
          getSourceFilePathFromUrl: this.getSourceFilePathFromUrl.bind(this),
          getOutputFilePath: this.getOutputFilePath.bind(this),
          inputDir: this.docsDir,
          pageTree,
          renderFile: this.renderFile.bind(this),
          renderAllOpenedFiles: this.renderAllOpenedFiles.bind(this),
        },
      },
      {
        plugin: devServerAdjustAssetUrls,
        options: {
          outputDir: this.outputDir,
          getSourceFilePathFromUrl: this.getSourceFilePathFromUrl.bind(this),
          getOutputFilePath: this.getOutputFilePath.bind(this),
          inputDir: this.docsDir,
        },
      },
    ];

    if (Array.isArray(this.options.setupDevServerPlugins)) {
      for (const setupFn of this.options.setupDevServerPlugins) {
        devServerPluginsMeta = setupFn(devServerPluginsMeta);
      }
    }

    /** @type {DevServerPlugin[]} */
    const devServerPlugins = [];
    for (const pluginObj of devServerPluginsMeta) {
      /** @type {DevServerPlugin} */
      let pluginInst = pluginObj.options
        ? // @ts-ignore
          new pluginObj.plugin(pluginObj.options)
        : // @ts-ignore
          new pluginObj.plugin();
      devServerPlugins.push(pluginInst);
    }

    /** @type {any[]} */
    let devServerMiddlewareMeta = [];
    if (Array.isArray(this.options.setupDevServerMiddleware)) {
      for (const setupFn of this.options.setupDevServerMiddleware) {
        devServerMiddlewareMeta = setupFn(devServerMiddlewareMeta);
      }
    }

    /** @type {DevServerMiddleware[]} */
    const devServerMiddleware = [];
    for (const pluginObj of devServerMiddlewareMeta) {
      /** @type {DevServerMiddleware} */
      let pluginInst = pluginObj.options
        ? // @ts-ignore
          new pluginObj.plugin(pluginObj.options)
        : // @ts-ignore
          new pluginObj.plugin();
      devServerMiddleware.push(pluginInst);
    }

    /** @type {import('@web/dev-server').DevServerConfig} */
    const devServerConfig = {
      open: this.options.open,
      nodeResolve: true,
      watch: true,
      rootDir: this.outputDir,
      clearTerminalOnReload: false,
      plugins: devServerPlugins,
      middleware: devServerMiddleware,
    };
    const config = this.options.adjustDevServerOptions
      ? this.options.adjustDevServerOptions(devServerConfig)
      : devServerConfig;

    this.devServer = await startDevServer({
      config,
      logStartMessage: false,
      readCliArgs: false,
      readFileConfig: false,
      // argv: this.__argv,
    });

    this.devServer.webSockets.on(
      'message',
      /**
       * @param {object} options
       * @param {import('@web/dev-server-core').WebSocket} options.webSocket
       * @param {import('@web/dev-server-core').WebSocketData} options.data
       */
      async ({ webSocket, data }) => {
        const typedData = /** @type {{ pathname: string }} */ (/** @type {unknown} */ (data));
        const sourceFilePath = await this.getSourceFilePathFromUrl(typedData.pathname);
        if (sourceFilePath) {
          this.watcher?.addWebSocketToPage(sourceFilePath, webSocket);
        }
      },
    );

    this.devServer.webSockets.webSocketServer.on(
      'connection',
      /**
       * @param {import('@web/dev-server-core').WebSocket} webSocket
       */
      webSocket => {
        webSocket.on('close', () => {
          this.watcher?.removeWebSocket(webSocket);
        });

        webSocket.send(
          JSON.stringify({ type: 'import', data: { importPath: '/ws-register-tab.js' } }),
        );
      },
    );

    this.watcher = new Watcher();
    await this.watcher.init(this.watchDir, { ignore: [this.outputDir], inputDir: this.docsDir });
    await this.watcher.addPages(files);

    this.watcher.watchPages({
      onPageSavedOrOpenedTabAndServerDependencyChanged:
        /** @param {{ sourceFilePath: string }} options */
        async ({ sourceFilePath }) => {
          await updateRocketHeader(sourceFilePath, this.docsDir);
          try {
            const result = await this.renderFile(sourceFilePath);
            const sourceRelativeFilePath = path.relative(this.docsDir, sourceFilePath);
            await pageTree.add(sourceRelativeFilePath);
            await pageTree.save();
            await cleanupAutoGeneratedFiles(result);

            if (pageTree.needsAnotherRenderingPass) {
              logRendering(`${sourceRelativeFilePath} again as the pageTree was modified.`);
              const result = await this.renderFile(sourceFilePath);
              await cleanupAutoGeneratedFiles(result);
              await this.renderAllOpenedFiles({ triggerSourceFilePath: sourceFilePath });
              pageTree.needsAnotherRenderingPass = false;
            }
          } catch (error) {
            // nothing as we show the error in the browser
          }
          // reload happens by web dev server automatically
        },
      onPageServerDependencySaved:
        /** @param {{ sourceFilePath: string }} options */
        async ({ sourceFilePath }) => {
          await updateRocketHeader(sourceFilePath, this.docsDir);
          // no need to render as the page itself is not saved nor is the page open in any browser tab
          // we however clear the current output file as it's now out of date and will be rerendered on demand
          await this.deleteOutputOf(sourceFilePath);
        },
      onPageDeleted:
        /** @param {{ sourceFilePath: string }} options */
        async ({ sourceFilePath }) => {
          await this.deleteOutputOf(sourceFilePath);
          const sourceRelativeFilePath = path.relative(this.docsDir, sourceFilePath);
          await pageTree.remove(sourceRelativeFilePath);
          await pageTree.save();
          await this.renderAllOpenedFiles({ triggerSourceFilePath: sourceFilePath });
        },
      onDone: async () => {
        this.events.emit('rocketUpdated');
      },
    });
  }

  /**
   * @param {object} options
   * @param {boolean} [options.hard]
   */
  async stop({ hard = true } = {}) {
    await this?.watcher?.cleanup();
    await this.devServer?.stop();
    if (hard) {
      await cleanupRenderWorker();
      await cleanupImportWorker();
    }
  }

  /**
   * @param {string} sourceFilePath
   */
  async deleteOutputOf(sourceFilePath) {
    await rm(this.getOutputFilePath(sourceFilePath), { force: true });
  }

  /**
   * @param {string} sourceFilePath
   */
  getOutputFilePath(sourceFilePath) {
    const sourceRelativeFilePath = path.relative(this.docsDir, sourceFilePath);
    const outputRelativeFilePath = sourceRelativeFilePathToOutputRelativeFilePath(
      sourceRelativeFilePath,
    );
    return path.join(this.outputDir, outputRelativeFilePath);
  }

  /**
   * @param {string} url
   */
  async getSourceFilePathFromUrl(url) {
    return await urlToSourceFilePath(url, this.docsDir);
  }

  /**
   * @param {object} [options]
   * @param {string} [options.triggerSourceFilePath]
   * @param {boolean} [options.deleteOtherFiles]
   */
  async renderAllOpenedFiles({ deleteOtherFiles = true, triggerSourceFilePath = '' } = {}) {
    if (this.watcher) {
      for (const [sourceFilePath, page] of this.watcher.pages.entries()) {
        if (triggerSourceFilePath && triggerSourceFilePath === sourceFilePath) {
          // no need to rerender the file that triggered it
          continue;
        }
        const isOpenedInBrowser = !!page.webSockets?.size ?? false;
        if (isOpenedInBrowser) {
          logRendering(
            `${path.relative(
              this.docsDir,
              sourceFilePath,
            )} because it is opened in a browser tab and the page tree has changed.`,
          );
          try {
            const result = await this.renderFile(sourceFilePath);
            await cleanupAutoGeneratedFiles(result);
          } catch (error) {
            // nothing already shown in the browser
          }
          // reload happens by web dev server automatically
        } else if (deleteOtherFiles === true) {
          await this.deleteOutputOf(sourceFilePath);
        }
      }
    }
  }

  /**
   * @param {string} sourceFilePath
   * @returns {Promise<import('../types/main.js').renderWorkerResult>}
   */
  async renderFile(sourceFilePath) {
    const result = await renderViaWorker({
      sourceFilePath,
      inputDir: this.docsDir,
      outputDir: this.outputDir,
      renderMode: this.options.renderMode || 'development',
    });
    return result;
  }
}
