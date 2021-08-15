import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class Breadcrumb extends Menu {
  static type = 'breadcrumb';

  childCondition() {
    return false;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {Promise<string>}
   */
  async render(node) {
    const current = node.first(node => node.model.current === true);
    if (!current) {
      return '';
    }
    const nodePath = current.getPath();
    // /** @param {NodeOfPage} node */
    // const breadcrumbItem = node => this.listItem();
    return `
      <nav aria-label="Breadcrumb">
        <ol>
          ${nodePath.map(node => this.listItem(node)).join('\n')}
        </ol>
      </nav>
    `;
  }
}
