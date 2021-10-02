/**
 * @template T
 * @param {function[]} setupFunctions
 * @param {import('../types/main').MetaPlugin<T>[]} metaPlugins
 * @return {import('../types/main').MetaPlugin<T>[]}
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
