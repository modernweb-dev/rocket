import { Menu } from './Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

import { html } from 'lit-html';
import { ifDefined } from 'lit/directives/if-defined.js';
import { nothing } from 'lit';

export class IndexMenu extends Menu {
  static type = 'index';

  options = {
    ...this.options,
    /** @param {string} nav */
    navWrapper: nav => html`<nav aria-label="index" data-type="index">${nav}</nav>`,
  };

  constructor(options = {}) {
    super(options);
    this.options = { ...this.options, ...options };
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  render(node) {
    if (!this.currentNode) {
      return nothing;
    }
    const activeLevelTwo = this.currentNode.getPath()[1] || node;
    const { navWrapper } = this.options;
    return navWrapper(this.list(activeLevelTwo));
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  link(node) {
    if (node.children && node.children.length > 0) {
      const lvl = node.model.level;
      return lvl < 3 ? html`<span>${node.model.menuLinkText}</span>` : nothing;
    }
    const current = node === this.currentNode ? 'page' : undefined;
    return html`
      <a href="${node.model.url}" aria-current=${ifDefined(current)}>
        ${node.model.menuLinkText}
      </a>
    `;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  list(node) {
    if (!this.currentNode) {
      return nothing;
    }
    const open = this.currentNode.getPath().includes(node);

    if (this.childCondition(node) && node.children) {
      const lvl = node.model.level;
      const levelClass = `lvl-${lvl + 1}`;

      if (lvl > 2) {
        return html`
          <details ?open=${open}>
            <summary>${node.model.menuLinkText}</summary>
            <ul class=${levelClass}>
              ${node.children.map(child => this.listItem(child))}
            </ul>
          </details>
        `;
      } else {
        return html`
          <ul class=${levelClass}>
            ${node.children.map(child => this.listItem(child))}
          </ul>
        `;
      }
    }
    return nothing;
  }
}
