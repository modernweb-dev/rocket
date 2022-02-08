import { Menu } from './Menu.js';

/** @typedef {import('../../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('lit').TemplateResult} TemplateResult */

import { html } from 'lit-html';
import { nothing } from 'lit';

export class BreadcrumbMenu extends Menu {
  childCondition() {
    return false;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  render(node) {
    const current = node.first(/** @param {NodeOfPage} node */ node => node.model.current === true);
    if (!current) {
      return nothing;
    }
    const nodePath = current.getPath();
    return html`
      <nav aria-label="Breadcrumb">
        <ol>
          ${nodePath.map(/** @param {NodeOfPage} node */ node => this.listItem(node))}
        </ol>
      </nav>
    `;
  }
}
