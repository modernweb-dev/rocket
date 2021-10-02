import { rollupPluginHTML } from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { polyfillsLoader } from '@web/rollup-plugin-polyfills-loader';
import { applyPlugins } from 'plugins-manager';

import { createBasicMetaConfig } from './createBasicConfig.js';

export function createSpaConfig(userConfig) {
  const { config, metaPlugins } = createSpaMetaConfig(userConfig);
  return applyPlugins(config, metaPlugins);
}

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

  const spaMetaPlugins = [
    ...metaPlugins,
    {
      plugin: rollupPluginHTML,
      options: {
        rootDir,
        absoluteBaseUrl,
      },
    },
    {
      plugin: importMetaAssets,
    },
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
