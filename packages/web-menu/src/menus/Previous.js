import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class Previous extends Menu {
  static type = 'previous';

  /**
   * @returns {Promise<string>}
   */
  async render() {
    if (!this.currentNode) {
      return '';
    }
    const parents = this.currentNode.getPath();
    let previous;
    if (parents.length > 1) {
      const parent = parents[parents.length - 2];
      if (parent && parent.children) {
        previous = parent.children[this.currentNode.getIndex() - 1];
        if (!previous) {
          previous = parent;
        }
      }
    }
    if (previous) {
      return `
        <a href="${previous.model.url}">
          <span>previous</span>
          <span>${previous.model.name}</span>
        </a>
      `;
    }
    return '';
  }
}
