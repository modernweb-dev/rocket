/** @typedef {import('../types/main').MetaPlugin} MetaPlugin */

/**
 * @param {function[]} setupFunctions
 * @param {MetaPlugin[]} metaPlugins
 * @return {MetaPlugin[]}
 */
export function executeSetupFunctions(setupFunctions, metaPlugins = []) {
  let _metaPlugins = [...metaPlugins];
  if (Array.isArray(setupFunctions)) {
    for (const setupFn of setupFunctions) {
      _metaPlugins = setupFn(_metaPlugins);
    }
  }
  return _metaPlugins;
}
