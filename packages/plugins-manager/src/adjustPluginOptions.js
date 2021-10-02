/** @typedef {import('../types/main').Plugin} Plugin */

/**
 * @param {any} obj
 */
function isObject(obj) {
  return typeof obj === 'object' && !!obj && !Array.isArray(obj);
}

/**
 * @param {*} x
 * @returns {x is function}
 */
function isFunction(x) {
  return typeof x === 'function';
}

/**
 * @template {import('../types/main').Plugin} T
 * @param {T} plugin
 * @param {import('../types/main').adjustPluginOptionsOptions<T>} mergeOptions
 */
export function adjustPluginOptions(plugin, mergeOptions) {
  /**
   * @template {Function} T
   * @param {import('../types/main').MetaPlugin<T>[]} plugins
   */
  const adjustPluginOptionsFn = plugins => {
    const index = plugins.findIndex(pluginObj => pluginObj.plugin === plugin);

    if (index === -1) {
      throw new Error(
        `Could not find a plugin with the name "${
          plugin.name
        }" to adjust it's options with:\n${JSON.stringify(mergeOptions, null, 2)}`,
      );
    }

    if (isFunction(mergeOptions)) {
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
