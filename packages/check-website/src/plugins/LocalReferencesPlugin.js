import normalizeUrl from 'normalize-url';
import path from 'path';
import { HtmlPage } from '../assets/HtmlPage.js';
import { ReferenceIssue } from '../issues/ReferenceIssue.js';
import { Plugin } from './Plugin.js';

/** @typedef {import('../../types/main.js').Reference} Reference */
/** @typedef {import('../../types/main.js').CheckContext} CheckContext */
/** @typedef {import('../../types/main.js').AddToQueueHelpers} AddToQueueHelpers */

export class LocalReferencesPlugin extends Plugin {
  constructor(options = {}) {
    super({
      title: 'Local',
      checkLabel: 'links',
      ...options,
    });
  }

  /**
   * @param {HtmlPage} page
   * @param {AddToQueueHelpers} helpers
   * @returns {Promise<Reference[]>}
   */
  async addToQueue(page, helpers) {
    const { isLocalUrl } = helpers;
    const checkItems = [];
    for (const reference of page.references) {
      if (isLocalUrl(reference.url)) {
        checkItems.push(reference);
      }
    }
    return checkItems;
  }

  /**
   * @param {CheckContext} context
   */
  async check(context) {
    const { item, report, getAsset } = context;
    const reference = /** @type {Reference} */ (item);
    const targetAsset = getAsset(reference.url);

    const { page } = reference;
    const relPath = path.relative(process.cwd(), page.localPath);
    const filePath = `./${relPath}:${reference.start}`;
    const message = `<${reference.tag} ${reference.attribute}="${reference.value}">`;

    if (await targetAsset.exists()) {
      const urlFocusHash = normalizeUrl(reference.url, { stripTextFragment: true }); // removes :~:text=
      const hash = urlFocusHash.includes('#') ? urlFocusHash.split('#')[1] : '';
      if (
        hash &&
        targetAsset instanceof HtmlPage &&
        (await targetAsset.parse()) &&
        !targetAsset.hasHash(hash)
      ) {
        report(new ReferenceIssue({ page, filePath, message, icon: '#️⃣' }));
      }
    } else {
      report(new ReferenceIssue({ page, filePath, message }));
    }
  }
}
