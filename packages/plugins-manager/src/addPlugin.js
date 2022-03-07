/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * @template {import('../types/main').Plugin} T
 * @param {T} plugin
 * @param {import('../types/main').GetPluginOptions<T>} [options]
 * @param {import('../types/main').ManagerOptions} [managerOptions]
 */
export function addPlugin(plugin, options = {}, { how = 'after', location = 'bottom' } = {}) {
  /**
   * @param {import('../types/main').MetaPlugin<T>[]} plugins
   */
  const addPluginFn = plugins => {
    if (plugins === undefined) {
      plugins = [];
    }

    // @ts-ignore
    const usePlugin = addPluginFn.wrapPlugin ? addPluginFn.wrapPlugin(plugin) : plugin;

    // only add if name is not already in the meta plugin list
    if (plugins.findIndex(pluginObj => pluginObj.plugin === plugin) === -1) {
      let index = -1;
      let _how = how;
      switch (location) {
        case 'top':
          index = 0;
          _how = 'fixed';
          break;
        case 'bottom':
          index = plugins.length;
          _how = 'fixed';
          break;
        default:
          index = plugins.findIndex(pluginObj => pluginObj.plugin === location);
      }
      if (index < 0) {
        const errorName = location === 'top' || location === 'bottom' ? location : location.name;
        throw new Error(
          `Could not find a plugin with the name "${errorName}" to insert "${plugin.name}" ${how} it.`,
        );
      }

      if (_how === 'after') {
        index += 1;
      }

      plugins.splice(index, 0, {
        plugin: usePlugin,
        options,
      });
    }
    return plugins;
  };
  return addPluginFn;
}
