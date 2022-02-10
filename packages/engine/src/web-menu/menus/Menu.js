/** @typedef {import('lit').TemplateResult} TemplateResult */
/** @typedef {import('../../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('../../../types/menu.js').MenuOptions} MenuOptions */

import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { nothing } from 'lit';
import { html } from 'lit-html';

export class Menu {
  /** @type {NodeOfPage | undefined} */
  currentNode = undefined;

  /** @type {MenuOptions} */
  options = {
    label: 'Menu',
    type: 'menu',
  };

  /** @type {import('../../../types/menu.js').TreeModelOfPage} */
  treeModel;

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
   * @returns {TemplateResult | nothing}
   */
  list(node) {
    if (this.childCondition(node) && node.children) {
      const lvl = node.model.level;
      const levelCssClass = `lvl-${lvl + 1}`;
      return html`
        <ul class=${levelCssClass}>
          ${node.children.map(/** @param {NodeOfPage} child */ child => this.listItem(child))}
        </ul>
      `;
    }
    return nothing;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  listItem(node) {
    const cssClasses = {
      'web-menu-active': node.model.active && !node.model.current,
      'web-menu-current': node.model.current,
    };
    return html`
      <li class=${classMap(cssClasses)}>
        ${this.link(node)} ${node.children && node.children.length > 0 ? this.list(node) : ''}
      </li>
    `;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  link(node) {
    const current = node === this.currentNode ? 'page' : undefined;
    if (node.model.menuNoLink) {
      return html`
        <span aria-current=${ifDefined(current)}>
          ${node.model.menuLinkText || node.model.name}
        </span>
      `;
    }
    return html`
      <a href=${node.model.url} aria-current=${ifDefined(current)}>
        ${node.model.menuLinkText || node.model.name}
      </a>
    `;
  }

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  render(node) {
    return html`
      <nav aria-label="${this.options.label}" data-type="${this.options.type}">
        ${this.list(node)}
      </nav>
    `;
  }
}
