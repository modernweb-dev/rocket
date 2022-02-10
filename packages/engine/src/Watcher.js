import watcher from '@parcel/watcher';
import path from 'path';
import { debuglog } from 'util';
import { readFile } from 'fs/promises';

// TODO: why importing this let's us run tests? delays loading maybe?
import '@mdjs/core';

import { findJsDependencies } from './helpers/findJsDependencies.js';
import { getServerCodeFromMd } from './helpers/getServerCodeFromMd.js';

const logRendering = debuglog('engine:rendering');

/**
 * @param {string} sourceFilePath
 * @returns {Promise<string[]>}
 */
async function getJsDependencies(sourceFilePath) {
  let toImportFilePath = sourceFilePath;

  let source = await readFile(sourceFilePath, 'utf8');
  if (sourceFilePath.endsWith('.rocket.md')) {
    source = getServerCodeFromMd(source);
  }

  const jsDependencies = await findJsDependencies(toImportFilePath, { source });
  return jsDependencies;
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isRocketPageFile(filePath) {
  return (
    filePath.endsWith('.rocket.js') ||
    filePath.endsWith('.rocket.md') ||
    filePath.endsWith('.rocket.html')
  );
}

export class Watcher {
  /**
   * @type {Map<string, { jsDependencies: string[], webSockets?: Set<import('@web/dev-server-core').WebSocket> }>}
   */
  pages = new Map();

  acceptPageUpdates = true;

  /**
   * @type {Map<string, { type: string, jsDependencies?: string[], webSockets?: Set<import('@web/dev-server-core').WebSocket> }>}
   */
  _taskQueue = new Map();

  /**
   * @param {string} initDir
   * @param {{ ignore: string[], inputDir: string }} options
   */
  async init(initDir, { ignore = [], inputDir }) {
    this.inputDir = inputDir;
    this.subscription = await watcher.subscribe(
      initDir,
      async (err, events) => {
        if (this.acceptPageUpdates) {
          for (const event of events) {
            if (event.type === 'create') {
              await this.addCreateTask(event.path);
            }
            if (event.type === 'update') {
              await this.addUpdateTask(event.path);
            }
            if (event.type === 'delete') {
              await this.addDeleteTask(event.path);
            }
          }
          await this.executeTaskQueue();
        } else {
          for (const event of events) {
            if (
              this._taskQueue.has(event.path) ||
              event.path.endsWith('pageTreeData.rocketGenerated.json') ||
              event.path.endsWith('rocketGeneratedMdInJs.js') ||
              event.path.endsWith('rocketGeneratedFromMd.js')
            ) {
              // file is either in queue or is the pageTreeData.rocketGenerated.json file
            } else {
              console.log(
                `You saved ${event.path} while Rocket was busy building. Automatic rebuilding is not yet implemented please save again.`,
              );
            }
          }
        }
      },
      { ignore },
    );
  }

  /**
   * @param {string} sourceFilePath
   */
  async addUpdateTask(sourceFilePath) {
    for (const [pageSourceFilePath, page] of this.pages) {
      if (pageSourceFilePath === sourceFilePath) {
        this._taskQueue.set(pageSourceFilePath, { ...page, type: 'update' });
      }
      if (page.jsDependencies.includes(sourceFilePath)) {
        this._taskQueue.set(pageSourceFilePath, { ...page, type: 'update-in-server-dependency' });
      }
    }
  }

  /**
   * @param {string} sourceFilePath
   */
  async addCreateTask(sourceFilePath) {
    if (isRocketPageFile(sourceFilePath)) {
      this._taskQueue.set(sourceFilePath, { type: 'create' });
    }
  }

  /**
   * @param {string} sourceFilePath
   */
  async addDeleteTask(sourceFilePath) {
    for (const [pageSourceFilePath /*, page */] of this.pages) {
      if (pageSourceFilePath === sourceFilePath) {
        this._taskQueue.set(pageSourceFilePath, { type: 'delete' });
      }
    }
  }

  async executeTaskQueue() {
    if (this._taskQueue.size === 0) {
      return;
    }
    if (!this.inputDir) {
      return;
    }
    this.acceptPageUpdates = false;
    for (const [sourceFilePath, info] of this._taskQueue) {
      if (info.type === 'create') {
        logRendering(
          `${path.relative(this.inputDir, sourceFilePath)} because the file got created.`,
        );
        await this.callbacks?.onPageSavedOrOpenedTabAndServerDependencyChanged({ sourceFilePath });
        await this.createPage(sourceFilePath);
      }
      if (info.type === 'update') {
        logRendering(
          `${path.relative(this.inputDir, sourceFilePath)} because the file got saved/updated.`,
        );
        await this.callbacks?.onPageSavedOrOpenedTabAndServerDependencyChanged({
          ...info,
          sourceFilePath,
        });
        await this.updatePage(sourceFilePath);
      }
      if (info.type === 'update-in-server-dependency') {
        const isOpenedInBrowser = !!info.webSockets?.size ?? false;
        if (isOpenedInBrowser) {
          logRendering(
            `${path.relative(this.inputDir, sourceFilePath)} because a dependency changed.`,
          );
          // if opened in browser, we treat it as an update to the page itself
          await this.callbacks?.onPageSavedOrOpenedTabAndServerDependencyChanged({
            ...info,
            sourceFilePath,
          });
        } else {
          await this.callbacks?.onPageServerDependencySaved({ sourceFilePath });
        }
        await this.updatePage(sourceFilePath);
      }
      if (info.type === 'delete') {
        await this.callbacks?.onPageDeleted({ sourceFilePath });
        await this.deletePage(sourceFilePath);
      }
    }
    await this.callbacks?.onDone();
    this._taskQueue.clear();
    this.acceptPageUpdates = true;
  }

  /**
   * @param {string} sourceFilePath
   */
  async updatePage(sourceFilePath) {
    if (this.pages.has(sourceFilePath)) {
      const page = this.pages.get(sourceFilePath);
      if (page) {
        try {
          page.jsDependencies = await getJsDependencies(sourceFilePath);
        } catch (error) {
          // ok we just don't update it
        }
        this.pages.set(sourceFilePath, page);
      }
    } else {
      throw new Error(`Page not found in watch index while trying to update: ${sourceFilePath}`);
    }
  }

  /**
   * @param {string} sourceFilePath
   * @param {import('@web/dev-server-core').WebSocket} webSocket
   */
  addWebSocketToPage(sourceFilePath, webSocket) {
    if (this.pages.has(sourceFilePath)) {
      const page = this.pages.get(sourceFilePath);
      if (page) {
        if (!page.webSockets) {
          page.webSockets = new Set();
        }
        page.webSockets.add(webSocket);
        this.pages.set(sourceFilePath, page);
      }
    } else {
      throw new Error(
        `Page not found in watch index while trying to add websocket: ${sourceFilePath}`,
      );
    }
  }

  /**
   * @param {import('@web/dev-server-core').WebSocket} webSocket
   */
  removeWebSocket(webSocket) {
    for (const [sourceFilePath, page] of this.pages.entries()) {
      if (page.webSockets && page.webSockets.has(webSocket)) {
        page.webSockets.delete(webSocket);
        this.pages.set(sourceFilePath, page);
      }
    }
  }

  /**
   * @param {string} sourceFilePath
   */
  async createPage(sourceFilePath, options = {}) {
    const page = {
      ...options,
      /** @type {string[]} */
      jsDependencies: [],
    };
    try {
      page.jsDependencies = await getJsDependencies(sourceFilePath);
    } catch (error) {
      // ok we can't get them so it will be empty
    }

    this.pages.set(sourceFilePath, page);
    return page;
  }

  /**
   * @param {string} sourceFilePath
   */
  async deletePage(sourceFilePath) {
    if (this.pages.has(sourceFilePath)) {
      this.pages.delete(sourceFilePath);
    } else {
      throw new Error(`Page not found in watch index while trying to delete: ${sourceFilePath}`);
    }
  }

  /**
   * @param {string[]} sourceFilePaths
   */
  async addPages(sourceFilePaths) {
    for (const sourceFilePath of sourceFilePaths) {
      await this.createPage(sourceFilePath);
    }
  }

  /**
   * @param {object} callbacks
   * @param {function} callbacks.onPageSavedOrOpenedTabAndServerDependencyChanged Gets called when a page is saved OR when a the page is open in a tab and a page dependency is changed
   * @param {function} callbacks.onPageServerDependencySaved Gets called when a page has a server dependency that has been saved
   * @param {function} callbacks.onPageDeleted
   * @param {function} callbacks.onDone
   */
  async watchPages(callbacks) {
    this.callbacks = callbacks;
  }

  async cleanup() {
    await this?.subscription?.unsubscribe();
    this.pages.clear();
    this._taskQueue.clear();
    this.acceptPageUpdates = true;
  }
}
