/** @typedef {import('../types/main').MetaPlugin} MetaPlugin */

import { executeSetupFunctions } from 'plugins-manager';

/**
 * @param {any} config
 * @param {MetaPlugin[]} [metaPlugins]
 */
export function metaConfigToRollupConfig(config, metaPlugins = []) {
  if (config.plugins) {
    delete config.setupPlugins;
    return config;
  }
  const _metaPlugins = executeSetupFunctions(config.setupPlugins, [...metaPlugins]);

  const plugins = _metaPlugins.map(pluginObj => {
    if (pluginObj.options) {
      return pluginObj.plugin(pluginObj.options);
    } else {
      return pluginObj.plugin();
    }
  });
  config.plugins = plugins;

  delete config.setupPlugins;
  return config;
}
