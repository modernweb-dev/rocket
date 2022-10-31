import { EventEmitter } from 'events';
import fetch from 'node-fetch';

/** @typedef {import('../../types/main.js').AssetStatus} AssetStatus */

export const ASSET_STATUS = /** @type {const} */ ({
  unknown: 0,

  // 200+ exists
  exists: 200,
  existsLocal: 220,
  existsExternal: 230,

  // 250+ parsed
  parsed: 250,
  parsedLocal: 260,
  parsedExternal: 270,

  // 300+ redirect
  redirect: 300,

  // 400+ error
  missing: 400,
});

export class Asset {
  /**
   * The full page URL.
   *
   * Example: `https://docs.astro.build/en/getting-started/`
   * @type {URL}
   */
  url;

  /**
   * @type {string}
   */
  urlNormalized = '';

  /**
   * @type {AssetStatus}
   */
  #status = ASSET_STATUS.unknown;

  /**
   * @param {AssetStatus} status
   */
  set status(status) {
    this.#status = status;
    this.events.emit('status-changed');
  }

  get status() {
    return this.#status;
  }

  /**
   * @readonly
   */
  events = new EventEmitter();

  /**
   * Absolute path to the HTML file on the local filesystem
   * @type {string}
   */
  localPath = '';

  /**
   * Absolute path to the optional source file that generated the asset file
   * @type {string}
   */
  localSourcePath = '';

  options = {
    originUrl: '',
    originPath: '',
    localPath: '',
    urlNormalized: '',
    fetch,
    /** @type {import('./AssetManager.js').AssetManager | undefined} */
    assetManager: undefined,
    /** @param {string} url */
    isLocalUrl: url => url.startsWith(this.options.originUrl),
  };

  /**
   *
   * @param {URL} url
   * @param {*} options
   */
  constructor(url, options) {
    this.options = { ...this.options, ...options };
    this.url = url;
    this.localPath = this.options.localPath;
    this.urlNormalized = this.options.urlNormalized;

    if (this.url.protocol === 'file:') {
      throw new Error(`File protocol is not supported. Used by ${this.url.href}`);
    }
  }

  exists() {
    return new Promise(resolve => {
      if (this.status > ASSET_STATUS.unknown && this.status < ASSET_STATUS.missing) {
        resolve(true);
      } else if (this.options.isLocalUrl(this.url.href)) {
        // Local assets need to be added upfront and are not dynamically discovered - potentially a feature for later
        resolve(false);
      } else {
        this.options.assetManager?.existsQueue.add(this, () => {
          resolve(this.status > ASSET_STATUS.unknown && this.status < ASSET_STATUS.missing);
        });
      }
    });
  }

  async executeExists() {
    let timeoutTimer;
    const timeout = new Promise(resolve => {
      timeoutTimer = setTimeout(resolve, 10000);
    });
    // TODO: detect server redirects (301, 302, etc)?
    // const fetching = fetch(this.url.href, { method: 'HEAD', redirect: "error" });

    const fetching = fetch(this.url.href, { method: 'HEAD' });
    const response = await Promise.race([fetching, timeout]);
    if (response && response.ok) {
      this.status = ASSET_STATUS.existsExternal;
    } else {
      this.status = ASSET_STATUS.missing;
    }

    // clear timeout so node process does not need to wait for the timeout to finish
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
  }

  isLocal() {
    return this.status === ASSET_STATUS.existsLocal || this.status === ASSET_STATUS.parsedLocal;
  }
}
