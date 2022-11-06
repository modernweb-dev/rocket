import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import mime from 'mime-types';

import { Asset, ASSET_STATUS } from './Asset.js';
import { HtmlPage } from './HtmlPage.js';
import { normalizeUrl, normalizeToLocalUrl } from '../helpers/normalizeUrl.js';
import { decodeNumberHtmlEntities } from '../helpers/decodeNumberHtmlEntities.js';
import { Queue } from '../helpers/Queue.js';
import EventEmitter from 'events';

/** @typedef {import('../plugins/Plugin.js').Plugin} Plugin */

const classMap = {
  Asset,
  HtmlPage,
};

/**
 * @param {string} url
 * @returns {URL}
 */
function getUrl(url) {
  try {
    return new URL(url);
  } catch (e) {
    // handle html encoded mailto links like <a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;">
    const decoded = decodeNumberHtmlEntities(url);
    return new URL(decoded);
  }
}

export class AssetManager {
  /** @type {Map<string, Asset | HtmlPage>} */
  assets = new Map();

  /**
   * @readonly
   */
  events = new EventEmitter();

  /** Queue *************************/
  parsingQueue = new Queue({
    concurrency: 1,
  });

  fetchQueue = new Queue({
    concurrency: 20,
    carryoverConcurrencyCount: true,
    interval: 500,
    intervalCap: 20,
  });

  /** @type {import('../../types/main.js').FullAssetManagerOptions} */
  options = {
    originUrl: '',
    originPath: '',
    fetch,
    plugins: [],
    isLocalUrl: url => url.startsWith(this.options.originUrl),
    onParseElementCallbacks: [],
  };

  /**
   * @param {import('../../types/main.js').AssetManagerOptions} [options]
   */
  constructor(options) {
    this.options = { ...this.options, ...options };

    this.parsingQueue.on('idle', () => {
      this.events.emit('idle');
    });
    this.fetchQueue.on('idle', () => {
      this.events.emit('idle');
    });
  }

  /**
   * @param {string} localPath
   * @returns {Asset | HtmlPage}
   */
  addFile(localPath) {
    const url = pathToFileURL(localPath); // new URL('file://' + localPath);
    return this.addUrl(url);
  }

  /**
   * It does not check if the asset actually exits.
   * ONLY call it for asset urls you know exist.
   *
   * @param {URL} fileUrl
   * @return {Asset | HtmlPage}
   */
  addExistingFile(fileUrl) {
    const filePath = fileURLToPath(fileUrl);
    const rel = path.relative(this.options.originPath, filePath);
    const url = new URL(rel, this.options.originUrl);
    const localPath = path.join(this.options.originPath, rel);
    if (this.has(url.href)) {
      const found = this.get(url.href);
      if (found) {
        return found;
      }
    }

    const mimeType = mime.lookup(fileUrl.pathname);

    /** @type {keyof classMap} */
    let typeClass = 'Asset';
    if (mimeType === 'text/html') {
      typeClass = 'HtmlPage';
    }
    const asset = new classMap[typeClass](url, {
      assetManager: this,
      localPath,
      originPath: this.options.originPath,
      originUrl: this.options.originUrl,
      onParseElementCallbacks: this.options.onParseElementCallbacks,
    });
    asset.status = ASSET_STATUS.existsLocal;
    this.assets.set(this.normalizeUrl(url.href), asset);

    for (const plugin of this.options.plugins) {
      plugin.onNewParsedAsset(asset);
    }

    return asset;
  }

  /**
   * @param {URL | string} url
   * @param {{ mimeType?: string }} options
   * @returns {Asset | HtmlPage}
   */
  addUrl(url, { mimeType = '' } = {}) {
    const useUrl = typeof url === 'string' ? getUrl(url) : url;
    if (this.has(useUrl.href)) {
      return /** @type {Asset | HtmlPage} */ (this.get(useUrl.href));
    }

    /** @type {keyof classMap} */
    let typeClass = 'Asset';
    if (mimeType === 'text/html') {
      typeClass = 'HtmlPage';
    }
    const asset = new classMap[typeClass](useUrl, {
      assetManager: this,
      originPath: this.options.originPath,
      originUrl: this.options.originUrl,
      onParseElementCallbacks: this.options.onParseElementCallbacks,
    });

    this.assets.set(this.normalizeUrl(useUrl.href), asset);

    for (const plugin of this.options.plugins) {
      plugin.onNewParsedAsset(asset);
    }

    return asset;
  }

  /**
   * @param {string} url
   * @returns {string}
   */
  normalizeUrl(url) {
    if (this.options.isLocalUrl(url)) {
      return normalizeToLocalUrl(url);
    }
    return normalizeUrl(url);
  }

  /**
   * @param {string} url
   * @returns
   */
  get(url) {
    return this.assets.get(this.normalizeUrl(url));
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  has(url) {
    return this.assets.has(this.normalizeUrl(url));
  }

  get size() {
    return this.assets.size;
  }

  /**
   * @param {string} url
   * @returns {Asset | HtmlPage}
   */
  getAsset(url) {
    let asset = this.get(url);
    if (!asset) {
      asset = this.addUrl(new URL(url));
    }
    return asset;
  }

  getAll() {
    return Array.from(this.assets.values());
  }

  get isIdle() {
    return this.fetchQueue.isIdle && this.parsingQueue.isIdle;
  }
}
