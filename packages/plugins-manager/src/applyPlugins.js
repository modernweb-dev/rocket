import { executeSetupFunctions } from './executeSetupFunctions.js';

/** @typedef {import('../types/main.js').Constructor} Constructor */
/** @typedef {import('../types/main.js').AnyFn} AnyFn */

/**
 * @param {unknown} func
 * @returns {boolean}
 */
function isClass(func) {
  if (typeof func === 'function' && func.prototype) {
    try {
      func.arguments && func.caller;
    } catch (error) {
      return true;
    }
  }
  return false;
}

/**
 * @template {import('../types/main.js').Plugin} T
 * @param {any} config
 * @param {import('../types/main.js').MetaPlugin<T>[]} [defaultPlugins]
 */
export function applyPlugins(config, defaultPlugins = []) {
  if (config.plugins) {
    delete config.setupPlugins;
    return config;
  }
  const _metaPlugins = executeSetupFunctions(config.setupPlugins, [...defaultPlugins]);

  const plugins = _metaPlugins.map(pluginObj => {
    if (isClass(pluginObj.plugin)) {
      const ClassPlugin = /** @type {Constructor} */ (pluginObj.plugin);
      return pluginObj.options ? new ClassPlugin(pluginObj.options) : new ClassPlugin();
    } else {
      const fnPlugin = /** @type {AnyFn} */ (pluginObj.plugin);
      return pluginObj.options ? fnPlugin(pluginObj.options) : fnPlugin();
    }
  });
  config.plugins = plugins;

  delete config.setupPlugins;
  return config;
}
