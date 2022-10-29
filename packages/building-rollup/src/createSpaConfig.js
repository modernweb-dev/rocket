// @ts-ignore
import { rollupPluginHTML } from '@web/rollup-plugin-html';
// @ts-ignore
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
// @ts-ignore
import { polyfillsLoader } from '@web/rollup-plugin-polyfills-loader';
import { applyPlugins } from 'plugins-manager';

import { createBasicMetaConfig } from './createBasicConfig.js';

/** @typedef {import('../types/main.js').BuildingRollupOptions} BuildingRollupOptions */

/**
 * @param {BuildingRollupOptions} [userConfig]
 */
export function createSpaConfig(userConfig) {
  const { config, metaPlugins } = createSpaMetaConfig(userConfig);
  return applyPlugins(config, metaPlugins);
}

/**
 * @param {BuildingRollupOptions} userConfig
 */
export function createSpaMetaConfig(userConfig = { output: {} }) {
  const { config, metaPlugins, developmentMode } = createBasicMetaConfig(userConfig);

  // root dir
  let rootDir = process.cwd();
  if (config.rootDir) {
    rootDir = config.rootDir;
    delete config.rootDir;
  }

  // base url
  let absoluteBaseUrl;
  if (config.absoluteBaseUrl) {
    absoluteBaseUrl = config.absoluteBaseUrl;
  }
  delete config.absoluteBaseUrl;

  /**
   * @type {import('plugins-manager').MetaPlugin<any>[]}
   */
  const spaMetaPlugins = [
    // @ts-ignore
    ...metaPlugins,
    // @ts-ignore
    {
      plugin: rollupPluginHTML,
      options: {
        rootDir,
        absoluteBaseUrl,
      },
    },
    // @ts-ignore
    {
      plugin: importMetaAssets,
    },
    // @ts-ignore
    {
      plugin: polyfillsLoader,
      options: {
        polyfills: {},
        minify: !developmentMode,
      },
    },
  ];

  return { config, metaPlugins: spaMetaPlugins, developmentMode };
}
