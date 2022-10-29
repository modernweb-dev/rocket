import { createSpaMetaConfig } from './createSpaConfig.js';
import { adjustPluginOptions, applyPlugins } from 'plugins-manager';
// @ts-ignore
import { rollupPluginHTML } from '@web/rollup-plugin-html';

/** @typedef {import('../types/main.js').BuildingRollupOptions} BuildingRollupOptions */

/**
 * @param {BuildingRollupOptions} [userConfig]
 */
export function createMpaConfig(userConfig) {
  const { config, metaPlugins } = createMpaMetaConfig(userConfig);

  const final = applyPlugins(config, metaPlugins);
  return final;
}

/**
 * @param {BuildingRollupOptions} userConfig
 */
export function createMpaMetaConfig(userConfig = { output: {}, setupPlugins: [] }) {
  const { config, metaPlugins } = createSpaMetaConfig(userConfig);

  config.setupPlugins = [
    adjustPluginOptions(rollupPluginHTML, {
      flattenOutput: false,
    }),
    ...config.setupPlugins,
  ];

  return { config, metaPlugins };
}
