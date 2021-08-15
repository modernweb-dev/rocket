import { Menu } from '../Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */

export class ArticleOverview extends Menu {
  static type = 'article-overview';

  /** @param {NodeOfPage} node */
  renderDescription(node) {
    if (node.model.subHeading) {
      return `
        <div class="description">
          <a href="${node.model.url}" tabindex="-1">
            <p>${node.model.subHeading}</p>
          </a>
        </div>
      `;
    }
    return '';
  }

  /**
   * @returns {Promise<string>}
   */
  async render() {
    if (!this.currentNode || !this.currentNode.children) {
      return '';
    }
    return `
      <div>
        ${this.currentNode.children
          .map(
            child => `
              <article class="post">
                <a href="${child.model.url}">
                  <h2>${child.model.name}</h2>
                </a>
                ${this.renderDescription(child)}
              </article>
            `,
          )
          .join('')}
      </div>
    `;
  }
}
