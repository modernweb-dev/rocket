import { replaceBetween } from './sax-helpers.js';

/** @typedef {import('../types/main').NodeOfPage} NodeOfPage */
/** @typedef {import('../types/main').WebMenuCliOptions} WebMenuCliOptions */

/**
 * @param {NodeOfPage} tree
 * @param {NodeOfPage} node
 */
function setCurrent(tree, node) {
  const currentNode = tree.first(entry => entry.model.relPath === node.model.relPath);
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

/**
 * @param {NodeOfPage} tree
 * @param {Partial<WebMenuCliOptions>} options
 */
export async function insertMenus(tree, options = {}) {
  let counter = 0;
  const { plugins } = options;
  if (!plugins) {
    return { counter: 0, tree };
  }

  for (const node of tree.all()) {
    if (node.model.menus && node.model.menus.length > 0) {
      setCurrent(tree, node);

      for (const menu of node.model.menus.reverse()) {
        counter += 1;
        const menuInst = plugins.find(pluginInst => pluginInst.constructor.type === menu.name);
        if (!menuInst) {
          throw new Error(`Unknown menu type: ${menu.name}`);
        }
        menuInst.currentNode = tree.first(entry => entry.model.current === true);
        const menuString = await menuInst.render(tree);
        node.model.fileString = replaceBetween({
          content: node.model.fileString,
          start: menu.start,
          end: menu.end,
          replacement: menuString,
        });
      }

      removeCurrent(tree);
    }
  }
  return { counter, tree };
}
