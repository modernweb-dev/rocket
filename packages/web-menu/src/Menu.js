/** @typedef {import('../types/main').NodeOfPage} NodeOfPage */

export class Menu {
  static type = 'menu';

  /** @type {NodeOfPage | undefined} */
  currentNode = undefined;

  options = {
    listTag: 'ul',
  };

  constructor(options = {}) {
    this.options = { ...this.options, ...options };
  }

  /**
   * @param {NodeOfPage} node
   * @returns {boolean}
   */
  childCondition(node) {
    return true;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {string}
   */
  list(node) {
    if (this.childCondition(node) && node.children) {
      const lvl = node.model.level;
      const { listTag } = this.options;
      return `
        <${listTag} class="lvl-${lvl + 1}">
          ${node.children.map(child => this.listItem(child)).join('')}
        </${listTag}>
      `;
    }
    return '';
  }

  /**
   * @param {NodeOfPage} node
   * @returns {string}
   */
  listItem(node) {
    let cssClasses = '';
    if (node.model.active) {
      cssClasses = ' class="web-menu-active" ';
    }
    if (node.model.current) {
      cssClasses = ' class="web-menu-current" ';
    }
    return `<li${cssClasses}>${this.link(node)}${
      node.children && node.children.length > 0 ? this.list(node) : ''
    }</li>`;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {string}
   */
  link(node) {
    const current = node === this.currentNode ? ' aria-current="page" ' : '';
    return `<a href="${node.model.url}"${current}>${node.model.name}</a>`;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {Promise<string>}
   */
  async render(node) {
    return `
      <nav aria-label="index">
        ${this.list(node)}
      </nav>
    `;
  }
}
