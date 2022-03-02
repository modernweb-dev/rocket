/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Menu } from './Menu.js';

/** @typedef {import('lit').TemplateResult} TemplateResult */
/** @typedef {import('../../../types/menu.js').NodeOfPage} NodeOfPage */
/** @typedef {import('../../../types/menu.js').TreeModelOfPage} TreeModelOfPage */
/** @typedef {import('../../../types/menu.js').TableOfContentsMenuOptions} TableOfContentsMenuOptions */

import { html } from 'lit';
import { nothing } from 'lit';

/**
 * @param {object} options
 * @param {{ text: string; id: string; level: number }[]} options.headlinesWithId
 * @param {TreeModelOfPage} options.treeModel
 * @returns
 */
function headlinesWithIdToTreeModelNode({ headlinesWithId, treeModel }) {
  let node;
  let currentLevel = 0;
  if (headlinesWithId && headlinesWithId.length > 0) {
    for (const headlineWithId of headlinesWithId) {
      const { id, text, level } = headlineWithId;
      const child = treeModel.parse({
        name: text,
        url: `#${id}`,
        level,
        headlinesWithId: [],
      });
      if (node) {
        if (level <= currentLevel) {
          node = node
            .getPath()
            .reverse()
            .find(
              /** @param {NodeOfPage} el */
              el => el.model.level < child.model.level,
            );
        }
        if (!node) {
          throw new Error(`Could not find an h1 in "..."`);
        }
        if (node) {
          node.addChild(child);
        }
      }
      currentLevel = level;
      node = child;
    }
  }

  const root = node?.getPath()[0];
  if (root) {
    return root;
  }
}

export class TableOfContentsMenu extends Menu {
  /** @type {TableOfContentsMenuOptions} */
  options = {
    ...this.options,
    navLabel: 'Table of Contents',
    navHeader: html`<h2>Contents</h2>`,
    /** @param {TemplateResult | nothing} nav */
    navWrapper: nav => html`<aside>${nav}</aside>`,
  };

  /**
   * @param {NodeOfPage} node
   * @returns {TemplateResult | nothing}
   */
  list(node) {
    if (this.childCondition(node) && node.children) {
      const lvl = node.model.level;
      const levelCssClass = `lvl-${lvl + 1}`;
      return html`
        <ol class=${levelCssClass}>
          ${node.children.map(/** @param {NodeOfPage} child */ child => this.listItem(child))}
        </ol>
      `;
    }
    return nothing;
  }

  /**
   * @returns {TemplateResult | nothing}
   */
  render() {
    if (!this.currentNode || !this.treeModel) {
      return nothing;
    }

    const tableOfContentsNode = headlinesWithIdToTreeModelNode({
      headlinesWithId: this.currentNode.model.headlinesWithId,
      treeModel: this.treeModel,
    });

    if (tableOfContentsNode && tableOfContentsNode.children.length > 0) {
      const { navHeader, navLabel, navWrapper } = this.options;

      const navTemplate = html`
        ${navHeader}
        <nav aria-label="${navLabel}">${this.list(tableOfContentsNode)}</nav>
      `;
      return navWrapper(navTemplate);
    }
    return nothing;
  }
}
