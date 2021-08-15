import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class Next extends Menu {
  static type = 'next';

  /**
   * @returns {Promise<string>}
   */
  async render() {
    if (!this.currentNode) {
      return '';
    }
    const parents = this.currentNode.getPath();
    let next;
    if (parents.length > 1) {
      const parent = parents[parents.length - 2];
      if (parent && parent.children) {
        next = parent.children[this.currentNode.getIndex() + 1];
      }
    }
    if (!next) {
      if (this.currentNode.children) {
        next = this.currentNode.children[0];
      }
    }
    if (next) {
      return `
        <a href="${next.model.url}">
          <span>next</span>
          <span>${next.model.name}</span>
        </a>
      `;
    }
    return '';
  }
}
