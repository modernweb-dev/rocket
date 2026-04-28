/** Runs on: import-hook */
import { remove } from 'unist-util-remove';

/**
 * @param {string} meta
 */
export function extractMdCode(meta) {
  /** @type {import('unified').Plugin} */
  return function unifiedProcessor() {
    /** @type {string | null} */
    let jsCode = null;

    /** @type {import('unist-util-is').TestFunction} */
    const removeFunction = _node => {
      // technically not correct, but we check
      const node = /** @type {import('mdast').Code} */ (_node);
      if (node.type === 'code' && node.lang === 'js' && node.meta === meta) {
        jsCode = jsCode === null ? node.value : jsCode + node.value + ';';
        return true;
      }
      return false;
    };

    /**
     * @param {import('unist').Node} tree
     * @param {import('vfile').VFile} file
     */
    return function transformer(tree, file) {
      remove(tree, removeFunction);
      if (!file.data) {
        file.data = {};
      }
      if (!file.data.code) {
        file.data.code = {};
      }
      // @ts-ignore
      file.data.code[meta] = jsCode;
      return tree;
    };
  };
}
