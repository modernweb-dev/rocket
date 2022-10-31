import { EventEmitter } from 'events';
import { ASSET_STATUS } from '../assets/Asset.js';
import { HtmlPage } from '../assets/HtmlPage.js';
import { Queue } from '../helpers/Queue.js';

/** @typedef {import('../assets/Asset.js').Asset} Asset */
/** @typedef {import('../CheckWebsiteCli.js').CheckWebsiteCli} CheckWebsiteCli */

/** @typedef {import('../../types/main.js').Reference} Reference */
/** @typedef {import('../../types/main.js').CheckContext} CheckContext */
/** @typedef {import('../../types/main.js').AddToQueueHelpers} AddToQueueHelpers */


export class Plugin {
  /** @type {import('../issues/IssueManager.js').IssueManager | undefined} */
  issueManager;

  /** @type {import('../assets/AssetManager.js').AssetManager | undefined} */
  assetManager;

  /** @type {CheckWebsiteCli | undefined} */
  cli;

  _total = 0;
  _done = 0;
  _passed = 0;
  _failed = 0;
  _skipped = 0;

  /**
   * @type {[number, number] | undefined}
   */
  _performanceStart;

  /**
   * @type {Map<string, unknown>}
   */
  _checkItems = new Map();

  _queue = new Queue({
    action: async item => {
      let hadIssues = false;
      /** @type {CheckContext} */
      const context = {
        report: issue => {
          hadIssues = true;
          this.issueManager?.add(issue);
        },
        item,
        getAsset: url => this.assetManager?.getAsset(url),
        isLocalUrl: url => this.isLocalUrl(url),
      };
      await this.check(context);

      if (item.url && this.isLocalUrl(item.url)) {
        const targetAsset = this.assetManager?.getAsset(item.url);
        if (targetAsset instanceof HtmlPage) {
          targetAsset.parse(); // no await but we request the parse => e.g. we crawl
        }
      }

      this._done += 1;
      if (hadIssues) {
        this._failed += 1;
      } else {
        this._passed += 1;
      }
      // TODO: add skipped
      // this._skipped += 1;
      this.events.emit('progress');
    },
    doneAction: () => {
      // TODO: fix magic value - test exit to early if < 10 is used
      setTimeout(() => this.events.emit('done'), 20);
    }
  });

  _processedPages = new Set();

  /**
   * @readonly
   */
  events = new EventEmitter();

  /**
   *
   * @param {Asset} asset
   */
  async onNewParsedAsset(asset) {
    if (asset instanceof HtmlPage) {
      asset.events.on('status-changed', async () => {
        if (asset.status >= ASSET_STATUS.parsed) {
          if (!this._processedPages.has(asset)) {
            this._processedPages.add(asset);
            /** @type {AddToQueueHelpers} */
            const helpers = {
              isLocalUrl: url => this.isLocalUrl(url),
            };
            const newQueueItems = await this.addToQueue(asset, helpers);
            this._queue.addMultiple(newQueueItems);
          }
        }
      });
    }
  }

  /**
   * @param {HtmlPage} page
   * @param {AddToQueueHelpers} helpers
   * @returns {Promise<unknown[]>}
   */
  async addToQueue(page, helpers) {
    return [page];
  }

  /**
   * @param {Partial<{}>} options
   */
  constructor(options = {}) {
    this.options = {
      title: 'Plugin',
      checkLabel: 'pages',
      ...options,
    };

    if (this.options.title.length > 10) {
      throw new Error(`Plugin title should be max 10 characters. Given "${this.options.title}"`);
    }
  }

  /**
   * @param {CheckWebsiteCli} cli 
   */
  setup(cli) {
    this._performanceStart = process.hrtime();
    this.cli = cli;
  }

  /**
   * The actual check logic for a single item.
   *
   * @param {CheckContext} context
   */
  async check(context) {
    // override me
  }

  isDone() {
    return this._queue.isDone();
  }

  getTotal() {
    return this._queue.getTotal();
  }

  getDuration() {
    return this._queue.getDuration();
  }

  getDone() {
    return this._done;
  }

  getPassed() {
    return this._passed;
  }

  getFailed() {
    return this._failed;
  }

  getSkipped() {
    return this._skipped;
  }

  /**
   * @param {string} url 
   */
  isLocalUrl(url) {
    return false;
  }
}
