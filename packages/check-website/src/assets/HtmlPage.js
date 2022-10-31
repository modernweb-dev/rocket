import fs from 'fs';

import { Asset, ASSET_STATUS } from './Asset.js';

import {
  getAttributeInfo,
  getLinksFromSrcSet,
  resolveToFullPageUrl,
} from '../helpers/sax-helpers.js';
import { parser, SaxEventType, streamOptions } from '../helpers/sax-parser.js';

/** @typedef {import('sax-wasm').Tag} Tag */
/** @typedef {import('../../types/main.js').Reference} Reference */

export class HtmlPage extends Asset {
  /**
   * @type {Reference[]}
   */
  references = [];

  /**
   * A list of hashes that can be used as URL fragments to jump to specific parts of the page.
   * @type {string[]}
   */
  hashes = [];

  /**
   * The target URL of a `<meta http-equiv="refresh" content="...">` element
   * contained on the page (if any).
   * @type {URL | undefined}
   */
  redirectTargetUrl;

  referenceSources = [
    { tagName: 'img', attribute: 'src' },
    { tagName: 'img', attribute: 'srcset' },
    { tagName: 'source', attribute: 'src' },
    { tagName: 'source', attribute: 'srcset' },
    { tagName: 'a', attribute: 'href' },
    { tagName: 'link', attribute: 'href' },
    { tagName: 'script', attribute: 'src' },
  ];

  // TODO: enable hooks for astro specifics mainContent, mainContentLang, pathnameLang, isLanguageFallback

  /**
   *
   * @param {URL} url
   * @param {*} options
   */
  constructor(url, options) {
    super(url, {
      onParseElementCallbacks: [],
      ...options,
    });
  }

  /**
   * @param {string} hash
   * @returns {boolean}
   */
  hasHash(hash) {
    const checkHash = hash.startsWith('#') ? hash.substring(1) : hash;
    return this.hashes.includes(checkHash);
  }

  async parse() {
    if (!(await this.exists())) {
      return;
    }

    return await this._parse();
  }

  #parsing = false;
  #parsingPromise = Promise.resolve(false);

  /**
   *
   * @protected
   * @returns {Promise<boolean>}
   */
  _parse() {
    if (this.#parsing) {
      return this.#parsingPromise;
    }

    this.#parsing = true;
    this.#parsingPromise = new Promise((resolve, reject) => {
      if (this.status >= ASSET_STATUS.parsed && this.status < ASSET_STATUS.missing) {
        this.#parsing = false;
        resolve(true);
      } else {
        if (!this.options.assetManager) {
          throw new Error('You need to pass an assetManager to the options');
        }
        this.options.assetManager?.parsingQueue.add(this, () => {
          this.#parsing = false;
          resolve(true);
        });
      }
    });
    return this.#parsingPromise;
  }

  async executeParse() {
    if (!(await this.exists())) {
      return;
    }
    await this._executeParse();
  }

  /**
   *
   * @protected
   * @returns {Promise<void>}
   */
  _executeParse() {
    parser.eventHandler = (ev, _data) => {
      if (ev === SaxEventType.CloseTag) {
        const data = /** @type {Tag} */ (/** @type {any} */ (_data));

        const searchTags = this.referenceSources.map(({ tagName }) => tagName);
        if (searchTags.includes(data.name)) {
          const possibleAttributes = this.referenceSources
            .map(({ attribute, tagName }) => (tagName === data.name ? attribute : undefined))
            .filter(Boolean);
          for (const possibleAttributeName of possibleAttributes) {
            if (possibleAttributeName) {
              const attribute = getAttributeInfo(data, possibleAttributeName);
              if (attribute) {
                const { value, start, end, name } = attribute;
                const entry = {
                  start,
                  end,
                  value,
                  url: resolveToFullPageUrl(this.url, value),
                  page: this,
                  attribute: name,
                  tag: data.name,
                };
                if (name === 'srcset') {
                  const links = getLinksFromSrcSet(value, this.url, entry);
                  this.references.push(...links);
                } else {
                  this.references.push(entry);
                  if (this.status === ASSET_STATUS.existsLocal) {
                    // only add "sub" assets for local files
                    this.options.assetManager.addUrl(entry.url);
                  }
                }
              }
            }
          }
        }

        const idData = getAttributeInfo(data, 'id');
        if (idData) {
          this.hashes.push(idData.value);
        }

        if (data.name === 'a') {
          const nameData = getAttributeInfo(data, 'name');
          if (nameData) {
            this.hashes.push(nameData.value);
          }
        }

        const element = {
          tagName: data.name.toUpperCase(),
          getAttribute: name => getAttributeInfo(data, name)?.value,
        };
        this.options.onParseElementCallbacks.forEach(cb => cb(element, this));

        // // Check if the page redirects somewhere else using meta refresh
        // const metaRefreshElement = this.findFirst(
        //   el =>
        //     el.tagName.toLowerCase() === 'meta' &&
        //     el.attribs['http-equiv']?.toLowerCase() === 'refresh',
        // );
        // const metaRefreshContent = metaRefreshElement?.attribs['content'];
        // const metaRefreshMatches = metaRefreshContent?.match(/^([0-9]+)\s*;\s*url\s*=\s*(.+)$/i);
        // this.redirectTargetUrl = metaRefreshMatches ? new URL(metaRefreshMatches[2], this.href) : null;
        // this.isRedirect = Boolean(this.redirectTargetUrl);
      }
    };

    return new Promise((resolve, reject) => {
      if (this.status === ASSET_STATUS.existsLocal) {
        if (!this.localPath) {
          throw new Error(`Missing local path on the asset ${this.url.href}`);
        }
        // Read from FileSystem
        const readable = fs.createReadStream(this.localPath, streamOptions);
        readable.on('data', chunk => {
          // @ts-expect-error
          parser.write(chunk);
        });
        readable.on('end', () => {
          parser.end();
          this.status = ASSET_STATUS.parsedLocal;
          resolve();
        });
      }

      if (this.status === ASSET_STATUS.existsExternal) {
        // Fetch from the network
        this.options.fetch(this.url).then(async response => {
          if (!response.ok || !response.body) {
            reject('Error in response');
            return;
          }
          response.body.on('data', chunk => {
            parser.write(chunk);
          });
          response.body.on('end', () => {
            parser.end();
            this.status = ASSET_STATUS.parsedExternal;
            resolve();
          });
        });
      }
    });
  }
}
