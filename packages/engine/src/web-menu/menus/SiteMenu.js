import { Menu } from './Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

import { nothing } from 'lit';
import { html } from 'lit-html';

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
        ${node.children.filter(child => !child.model.menuNoLink).map(child => this.link(child))}
      </nav>
    `;
  }
}
