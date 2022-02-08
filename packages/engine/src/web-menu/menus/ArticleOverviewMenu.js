import { Menu } from './Menu.js';

/** @typedef {import('../../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('lit').TemplateResult} TemplateResult */

import { html } from 'lit-html';
import { nothing } from 'lit';

export class ArticleOverviewMenu extends Menu {
  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  renderDescription(node) {
    if (node.model.subHeading) {
      return html`
        <div class="description">
          <a href="${node.model.url}" tabindex="-1">
            <p>${node.model.subHeading}</p>
          </a>
        </div>
      `;
    }
    return nothing;
  }

  /**
   * @returns {TemplateResult | nothing}
   */
  render() {
    if (!this.currentNode || !this.currentNode.children) {
      return nothing;
    }
    return html`
      <div>
        ${this.currentNode.children.map(
          /** @param {NodeOfPage} child */ child => html`
            <article class="post">
              <a href="${child.model.url}">
                <h2>${child.model.name}</h2>
              </a>
              ${this.renderDescription(child)}
            </article>
          `,
        )}
      </div>
    `;
  }
}
