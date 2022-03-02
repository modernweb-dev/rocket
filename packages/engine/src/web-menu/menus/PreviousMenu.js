import { Menu } from './Menu.js';

/** @typedef {import('../../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('lit').TemplateResult} TemplateResult */

import { html } from 'lit';
import { nothing } from 'lit';

export class PreviousMenu extends Menu {
  /**
   * @returns {TemplateResult | nothing}
   */
  render() {
    if (!this.currentNode) {
      return nothing;
    }
    const parents = this.currentNode.getPath();

    let previous;
    if (parents.length > 1) {
      // 1. check direct "before sibling"
      const parent = parents[parents.length - 2];
      if (parent && parent.children) {
        previous = parent.children[this.currentNode.getIndex() - 1];
      }

      if (!previous) {
        parents.pop();
        const reversedCleanedParents = parents.reverse();
        for (const parent of reversedCleanedParents) {
          if (parent.children) {
            for (const child of parent.children) {
              if (!child.model.menuNoLink) {
                previous = child;
                break;
              }
            }
          }
          if (!parent.model.menuNoLink) {
            previous = parent;
            break;
          }
        }
      }
    }
    if (previous) {
      return html`
        <a href="${previous.model.url}" class="previous-menu">
          <span class="previous-menu__description">Previous article</span>
          <span>${previous.model.name}</span>
        </a>
      `;
    }
    return nothing;
  }
}
