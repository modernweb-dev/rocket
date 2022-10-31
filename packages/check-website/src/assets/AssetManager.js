import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import mime from 'mime-types';

import { Asset, ASSET_STATUS } from './Asset.js';
import { HtmlPage } from './HtmlPage.js';
import { normalizeUrl, normalizeToLocalUrl } from '../helpers/normalizeUrl.js';
import { Queue } from '../helpers/Queue.js';
import { decodeNumberHtmlEntities } from '../helpers/decodeNumberHtmlEntities.js';

const classMap = {
  Asset,
  HtmlPage,
};

export class AssetManager {
  /** @type {Map<string, Asset | HtmlPage>} */
  assets = new Map();

  /** Queue *************************/
  parsingQueue = new Queue({ action: item => item.executeParse() });
  existsQueue = new Queue({ action: item => item.executeExists() });

  options = {
    originUrl: '',
    originPath: '',
    fetch,
    plugins: [],
    /** @param {string} url */
    isLocalUrl: url => url.startsWith(this.options.originUrl),
  };

  constructor(options) {
    this.options = { ...this.options, ...options };
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
   * @param {URL} fileUrl
   */
  addExistingFile(fileUrl) {
    const filePath = fileURLToPath(fileUrl);
    const rel = path.relative(this.options.originPath, filePath);
    const url = new URL(rel, this.options.originUrl);
    const localPath = path.join(this.options.originPath, rel);
    if (this.has(url.href)) {
      return this.get(url.href);
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
   * @returns {Asset | HtmlPage}
   */
  addUrl(url) {
    let useUrl = url;
    if (typeof url === 'string') {
      try {
        useUrl = new URL(url);
      } catch (e) {
        // handle html encoded mailto links like <a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;">
        const decoded = decodeNumberHtmlEntities(url);
        useUrl = new URL(decoded);
      }
    }
    if (this.has(useUrl.href)) {
      return this.get(useUrl.href);
    }

    const asset = new Asset(useUrl, {
      assetManager: this,
      ...this.options,
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
   * @returns 
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

  isDone() {
    return this.existsQueue.isDone() && this.parsingQueue.isDone();
  }
}
