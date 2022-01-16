import { Menu } from './Menu.js';

/** @typedef {import('../../types/main').NodeOfPage} NodeOfPage */
/** @typedef {import('lit-html').TemplateResult} TemplateResult */

import { html } from 'lit-html';
import { nothing } from 'lit';

export class NextMenu extends Menu {
  /**
   * @returns {TemplateResult | nothing}
   */
  render() {
    if (!this.currentNode) {
      return nothing;
    }

    // 1. check children
    let next = this.currentNode.first(el => el !== this.currentNode && !el.model.menuNoLink);

    // 2. check parents (and their children) in reverse order
    if (!next) {
      const parents = this.currentNode.getPath();
      const reverseParents = [...parents].reverse();
      let compareIndex = this.currentNode.getIndex();
      for (const parent of reverseParents) {
        if (parent.children) {
          for (const child of parent.children) {
            if (child.getIndex() > compareIndex) {
              if (!child.model.menuNoLink) {
                next = child;
                break;
              } else {
                next = child.first(el => !el.model.menuNoLink);
                if (next) {
                  break;
                }
              }
            }
          }
          if (next) {
            break;
          }
        }
        compareIndex = parent.getIndex();
      }
    }

    if (next) {
      return html`
        <a href="${next.model.url}" class="next-menu">
          <span class="next-menu__description">Next article</span>
          <span>${next.model.name}</span>
        </a>
      `;
    }
    return nothing;
  }
}
