import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import got, { RequestError } from 'got';

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

  localPath = '';

  localSourcePath = '';

  /** @type {import('../../types/main.js').FullAssetOptions} */
  options = {
    originUrl: '',
    originPath: '',
    localPath: '',
    localSourcePath: '',
    fetch,
    assetManager: undefined,
    isLocalUrl: url => url.startsWith(this.options.originUrl),
    skip: false,
  };

  /**
   *
   * @param {URL} url
   * @param {import('../../types/main.js').AssetOptions} options
   */
  constructor(url, options) {
    this.options = { ...this.options, ...options };
    this.url = url;
    this.localPath = this.options.localPath;

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
        this.options.assetManager?.fetchQueue
          .add(async () => await this.executeExists())
          .finally(() => {
            resolve(this.status > ASSET_STATUS.unknown && this.status < ASSET_STATUS.missing);
          });
      }
    });
  }

  async executeExists() {
    if (this.options.skip) {
      return;
    }
    // TODO: detect server redirects (301, 302, etc)?
    // const fetching = fetch(this.url.href, { method: 'HEAD', redirect: "error" });
    try {
      await got(this.url.href, { method: 'HEAD' });
      this.status = ASSET_STATUS.existsExternal;
    } catch (err) {
      if (err instanceof RequestError) {
        this.status =
          /** @type {AssetStatus} */ (err?.response?.statusCode) || ASSET_STATUS.missing;
      }
    }
  }

  isLocal() {
    return this.status === ASSET_STATUS.existsLocal || this.status === ASSET_STATUS.parsedLocal;
  }
}
