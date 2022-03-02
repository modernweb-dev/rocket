import { Menu } from './Menu.js';

/** @typedef {import('../../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('lit').TemplateResult} TemplateResult */

import { nothing } from 'lit';
import { html } from 'lit';

export class SiteMenu extends Menu {
  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  render(node) {
    if (!node.children) {
      return nothing;
    }
    return html`
      <nav aria-label="site">
        ${node.children
          .filter(/** @param {NodeOfPage} child */ child => !child.model.menuNoLink)
          .map(/** @param {NodeOfPage} child */ child => this.link(child))}
      </nav>
    `;
  }
}
