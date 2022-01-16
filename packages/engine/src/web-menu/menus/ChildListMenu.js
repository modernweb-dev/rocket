import { Menu } from './Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

import { html } from 'lit-html';
import { nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

export class ChildListMenu extends Menu {
  options = {
    ...this.options,
    label: 'Child List Menu',
    type: 'child-list-menu',
    maxDepth: 2,
  };

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  render(node) {
    if (!this.currentNode) {
      return nothing;
    }
    return html`
      <nav aria-label="${this.options.label}" data-type="${this.options.type}">
        ${this.list(this.currentNode)}
      </nav>
    `;
  }

  childCondition(node) {
    const depth = node.model.level - this.currentNode.model.level;
    return depth < this.options.maxDepth;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  link(node) {
    const depth = node.model.level - this.currentNode.model.level;
    const current = node === this.currentNode ? 'page' : undefined;
    let url = node.model.url;
    if (depth >= this.options.maxDepth) {
      const linkNode = node.first(node => !node.model.menuNoLink);
      if (linkNode) {
        url = linkNode.model.url;
        return html`<a href="${url}" aria-current=${ifDefined(current)}
          >${node.model.menuLinkText || node.model.name}</a
        >`;
      }
    }

    if (node.model.menuNoLink) {
      return html`<span aria-current=${ifDefined(current)}
        >${node.model.menuLinkText || node.model.name}</span
      >`;
    }
    return html`<a href="${url}" aria-current=${ifDefined(current)}
      >${node.model.menuLinkText || node.model.name}</a
    >`;
  }
}
