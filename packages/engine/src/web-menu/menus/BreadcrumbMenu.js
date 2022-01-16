import { Menu } from './Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

import { html } from 'lit-html';
import { nothing } from 'lit';

export class BreadcrumbMenu extends Menu {
  static type = 'breadcrumb';

  childCondition() {
    return false;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  render(node) {
    const current = node.first(node => node.model.current === true);
    if (!current) {
      return nothing;
    }
    const nodePath = current.getPath();
    // /** @param {NodeOfPage} node */
    // const breadcrumbItem = node => this.listItem();
    return html`
      <nav aria-label="Breadcrumb">
        <ol>
          ${nodePath.map(node => this.listItem(node))}
        </ol>
      </nav>
    `;
  }
}
