import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class Site extends Menu {
  static type = 'site';

  /**
   * @param {NodeOfPage} node
   * @returns {Promise<string>}
   */
  async render(node) {
    if (!node.children) {
      return '';
    }
    return `
      <nav aria-label="site">
        ${node.children.map(child => this.link(child)).join('\n')}
      </nav>
    `;
  }
}
