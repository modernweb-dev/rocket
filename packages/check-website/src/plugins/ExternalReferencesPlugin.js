import path from 'path';
import { ReferenceIssue } from '../issues/ReferenceIssue.js';
import { Plugin } from './Plugin.js';

/** @typedef {import('../assets/HtmlPage.js').HtmlPage} HtmlPage */
/** @typedef {import('../../types/main.js').Reference} Reference */
/** @typedef {import('../../types/main.js').CheckResult} CheckResult */

export class ExternalReferencesPlugin extends Plugin {
  constructor(options = {}) {
    super({
      title: 'External',
      checkLabel: 'links',
      ...options,
    });
  }

  /**
   * @param {Reference} reference
   */
  async check(context) {
    const { item: reference, report, getAsset } = context;
    const asset = getAsset(reference.url);

    if (!await asset.exists()) {
      const { page } = reference;
      const relPath = path.relative(process.cwd(), page.localPath);
      const filePath = `./${relPath}:${reference.start}`;
      const message = `<${reference.tag} ${reference.attribute}="${reference.value}">`;
      report(new ReferenceIssue({ page, filePath, message }));
    }
  }

  /**
   * @param {HtmlPage} page
   * @returns {Promise<Reference[]>}
   */
  async addToQueue(page, helpers) {
    const { isLocalUrl } = helpers;
    const checkItems = [];
    for (const reference of page.references) {
      if (!isLocalUrl(reference.url)) {
        checkItems.push(reference);
      }
    }
    return checkItems;
  }
}
