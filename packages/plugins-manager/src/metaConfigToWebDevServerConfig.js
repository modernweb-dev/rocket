/** @typedef {import('../types/main').MetaPluginWrapable} MetaPluginWrapable */

import { executeSetupFunctions } from 'plugins-manager';

/**
 * @param {any} config
 * @param {MetaPluginWrapable[]} metaPlugins
 * @param {object} [options]
 * @param {function | null} [options.rollupWrapperFunction]
 */
export function metaConfigToWebDevServerConfig(
  config,
  metaPlugins,
  { rollupWrapperFunction = null } = {},
) {
  if (config.plugins) {
    delete config.setupPlugins;
    delete config.setupRollupPlugins;
    return config;
  }

  const metaPluginsNoWrap = metaPlugins.map(pluginObj => {
    pluginObj.__noWrap = true;
    return pluginObj;
  });

  const rollupPlugins = /** @type {MetaPluginWrapable[]} */ (executeSetupFunctions(
    config.setupRollupPlugins,
    [...metaPluginsNoWrap],
  ));

  const wrappedRollupPlugins = rollupPlugins.map(pluginObj => {
    if (typeof rollupWrapperFunction === 'function' && pluginObj.__noWrap !== true) {
      pluginObj.plugin = rollupWrapperFunction(pluginObj.plugin);
    }
    return pluginObj;
  });

  const _metaPlugins = executeSetupFunctions(config.setupPlugins, [...wrappedRollupPlugins]);

  const plugins = _metaPlugins.map(pluginObj => {
    if (pluginObj.options) {
      return pluginObj.plugin(pluginObj.options);
    } else {
      return pluginObj.plugin();
    }
  });
  config.plugins = plugins;

  delete config.setupPlugins;
  delete config.setupRollupPlugins;
  return config;
}
