/* eslint-disable @typescript-eslint/ban-ts-comment */
const visit = require('unist-util-visit');
// @ts-ignore
const remove = require('unist-util-remove');

/** @typedef {import('vfile').VFileOptions} VFileOptions */
/** @typedef {import('unist').Node} Node */

function mdjsParse() {
  let jsCode = '';

  /**
   * @param {Node} tree
   * @param {VFileOptions} file
   */
  function transformer(tree, file) {
    visit(tree, 'code', node => {
      if (node.lang === 'js' && node.meta === 'script') {
        jsCode += node.value;
      }
      if (node.lang === 'js' && node.meta === 'client') {
        jsCode += node.value;
      }
    });
    // we can only return/modify the tree but jsCode should not be part of the tree
    // so we attach it globally to the file.data
    // eslint-disable-next-line no-param-reassign
    file.data.jsCode = jsCode;

    /**
     * @param {Node} node
     */
    const removeFunction = node =>
      node.type === 'code' &&
      node.lang === 'js' &&
      (node.meta === 'script' || node.meta === 'client');
    remove(tree, removeFunction);

    return tree;
  }

  return transformer;
}

module.exports = {
  mdjsParse,
};
