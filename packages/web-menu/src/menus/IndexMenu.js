import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class IndexMenu extends Menu {
  static type = 'index';

  options = {
    ...this.options,
    /** @param {string} nav */
    navWrapper: nav => `<nav aria-label="index">${nav}</nav>`,
  };

  constructor(options = {}) {
    super(options);
    this.options = { ...this.options, ...options };
  }

  /**
   * @param {NodeOfPage} node
   * @returns {Promise<string>}
   */
  async render(node) {
    if (!this.currentNode) {
      return '';
    }
    const activeLevelTwo = this.currentNode.getPath()[1] || node;
    const { navWrapper } = this.options;
    return navWrapper(this.list(activeLevelTwo));
  }

  /**
   * @param {NodeOfPage} node
   * @returns {string}
   */
  link(node) {
    if (node.children && node.children.length > 0) {
      const lvl = node.model.level;
      return lvl < 3 ? `<span>${node.model.name}</span>` : '';
    }
    const current = node === this.currentNode ? ' aria-current="page" ' : '';
    return `<a href="${node.model.url}"${current}>${node.model.name}</a>`;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {string}
   */
  list(node) {
    if (!this.currentNode) {
      return '';
    }
    const open = this.currentNode.getPath().includes(node) ? 'open' : '';

    if (this.childCondition(node) && node.children) {
      const lvl = node.model.level;
      const { listTag } = this.options;
      return `
        ${lvl > 2 ? `<details ${open}><summary>${node.model.name}</summary>` : ''}
          <${listTag} class="lvl-${lvl + 1}">
            ${node.children.map(child => this.listItem(child)).join('')}
          </${listTag}>
        ${lvl > 2 ? `</details>` : ''}
      `;
    }
    return '';
  }
}
