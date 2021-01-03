/** @typedef {import('../types/main').MetaPlugin} MetaPlugin */

import { executeSetupFunctions } from 'plugins-manager';

/**
 * @param {any} config
 * @param {MetaPlugin[]} metaPlugins
 * @param {object} [options]
 * @param {function | null} [options.wrapperFunction]
 */
export function metaConfigToWebDevServerConfig(config, metaPlugins, { wrapperFunction = null }) {
  const _metaPlugins = executeSetupFunctions(config.setupPlugins, [...metaPlugins]);

  const plugins = _metaPlugins.map(pluginObj => {
    const usePlugin =
      typeof wrapperFunction === 'function' ? wrapperFunction(pluginObj.plugin) : pluginObj.plugin;

    if (pluginObj.options) {
      return usePlugin(pluginObj.options);
    } else {
      return usePlugin();
    }
  });
  config.plugins = plugins;

  delete config.setupPlugins;
  return config;
}
