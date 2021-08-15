/** @typedef {import('..//types/main').NodeOfPage} NodeOfPage */

/**
 * @param {NodeOfPage} node
 * @returns {NodeOfPage|undefined}
 */
export function findCurrentNode(node) {
  return node.first(entry => entry.model.current === true);
}
