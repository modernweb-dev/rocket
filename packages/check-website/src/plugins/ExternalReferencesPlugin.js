import path from 'path';
import { cli } from '../cli/cli.js';
import { ReferenceIssue } from '../issues/ReferenceIssue.js';
import { Plugin } from './Plugin.js';

/** @typedef {import('../assets/HtmlPage.js').HtmlPage} HtmlPage */
/** @typedef {import('../../types/main.js').Reference} Reference */
/** @typedef {import('../../types/main.js').CheckContext} CheckContext */
/** @typedef {import('../../types/main.js').AddToQueueHelpers} AddToQueueHelpers */

/**
 * @param {string} url
 */
function getDomain(url) {
  try {
    const { hostname } = new URL(url);
    return hostname;
  } catch {
    return '';
  }
}

export class ExternalReferencesPlugin extends Plugin {
  domainStats = new Map();

  constructor(options = {}) {
    super({
      title: 'External',
      checkLabel: 'links',
      ...options,
    });
  }

  /**
   * @param {CheckContext} context
   */
  async check(context) {
    const { item, report, getAsset } = context;
    const reference = /** @type {Reference} */ (item);
    const asset = getAsset(reference.url);

    if (!(await asset.exists())) {
      const { page } = reference;
      const relPath = path.relative(process.cwd(), page.localPath);
      const filePath = `./${relPath}:${reference.start}`;
      const message = `<${reference.tag} ${reference.attribute}="${reference.value}">`;
      report(new ReferenceIssue({ page, filePath, message }));
    }
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
      if (reference.url.startsWith('http') && !isLocalUrl(reference.url)) {
        checkItems.push(reference);
        const domain = getDomain(reference.url);
        this.domainStats.set(domain, (this.domainStats.get(domain) || 0) + 1);
      }
    }
    return checkItems;
  }

  render() {
    const top3 = [...this.domainStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const top3Str = top3.map(([domain, count], i) => `${i + 1}. ${domain} (${count})`).join(', ');
    return cli`
      ${super.render()}
      - Top Domains: ${top3Str}
    `;
  }
}
