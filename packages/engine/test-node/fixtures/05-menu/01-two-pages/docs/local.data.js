import { pageTree } from './pageTree.js';

import { SiteMenu } from '@rocket/engine';
import { html } from 'lit';

/**
 * @param {NodeOfPage} tree
 * @param {NodeOfPage} node
 */
function setCurrent(tree, sourceRelativeFilePath) {
  const currentNode = tree.first(
    entry => entry.model.sourceRelativeFilePath === sourceRelativeFilePath,
  );
  if (currentNode) {
    currentNode.model.current = true;
    for (const parent of currentNode.getPath()) {
      parent.model.active = true;
    }
  }
}

/**
 * @param {NodeOfPage} tree
 */
function removeCurrent(tree) {
  const currentNode = tree.first(entry => entry.model.current === true);
  if (currentNode) {
    currentNode.model.current = false;
    for (const parent of currentNode.getPath()) {
      parent.model.active = false;
    }
  }
}

function renderMenu(inst, tree, sourceRelativeFilePath) {
  setCurrent(tree, sourceRelativeFilePath);
  inst.currentNode = tree.first(entry => entry.model.current === true);
  const output = inst.render(tree);
  removeCurrent(tree);
  return output;
}

export const layout = data => {
  return html`
    ${renderMenu(new SiteMenu(), pageTree, data.sourceRelativeFilePath)}
    <main>${data.content()}</main>
  `;
};
