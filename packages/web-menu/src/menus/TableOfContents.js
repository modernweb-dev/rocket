import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class TableOfContents extends Menu {
  static type = 'table-of-contents';

  constructor(options = {}) {
    super();
    this.options = {
      navLabel: 'Table of Contents',
      navHeader: '<h2>Contents</h2>',
      /** @param {string} nav */
      navWrapper: nav => `<aside>${nav}</aside>`,
      listTag: 'ol',
      ...options,
    };
  }

  /**
   * @returns {Promise<string>}
   */
  async render() {
    if (!this.currentNode) {
      return '';
    }
    if (
      this.currentNode.model.tableOfContentsNode &&
      this.currentNode.model.tableOfContentsNode.children.length > 0
    ) {
      const { navHeader, navLabel, navWrapper } = this.options;

      const navString = `
        ${navHeader}
        <nav aria-label="${navLabel}">
          ${this.list(this.currentNode.model.tableOfContentsNode)}
        </nav>
      `;
      return navWrapper(navString);
    }
    return '';
  }
}
