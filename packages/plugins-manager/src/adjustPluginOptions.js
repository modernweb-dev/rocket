/** @typedef {import('../types/main').MetaPlugin} MetaPlugin */

/**
 * @param {any} obj
 */
function isObject(obj) {
  return typeof obj === 'object' && !!obj && !Array.isArray(obj);
}

/**
 * @param {string} pluginName
 * @param {any} mergeOptions
 */
export function adjustPluginOptions(pluginName, mergeOptions) {
  /**
   * @param {MetaPlugin[]} plugins
   */
  const adjustPluginOptionsFn = plugins => {
    const index = plugins.findIndex(plugin => plugin.name === pluginName);

    if (index === -1) {
      throw new Error(
        `Could not find a plugin with the name "${pluginName}" to adjust the options.`,
      );
    }

    if (typeof mergeOptions === 'function') {
      plugins[index].options = mergeOptions(plugins[index].options);
    } else if (isObject(plugins[index].options)) {
      plugins[index].options = { ...plugins[index].options, ...mergeOptions };
    } else {
      plugins[index].options = mergeOptions;
    }

    return plugins;
  };
  return adjustPluginOptionsFn;
}
