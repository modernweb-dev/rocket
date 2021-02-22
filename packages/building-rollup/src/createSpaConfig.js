import path from 'path';
import { rollupPluginHTML } from '@web/rollup-plugin-html';
import { generateSW } from 'rollup-plugin-workbox';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { polyfillsLoader } from '@web/rollup-plugin-polyfills-loader';
import { metaConfigToRollupConfig } from 'plugins-manager';

import { createBasicMetaConfig } from './createBasicConfig.js';

export function createSpaConfig(userConfig) {
  const { config, metaPlugins } = createSpaMetaConfig(userConfig);
  return metaConfigToRollupConfig(config, metaPlugins);
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
      name: 'html',
      plugin: rollupPluginHTML,
      options: {
        rootDir,
        absoluteBaseUrl,
        injectServiceWorker: true,
        serviceWorkerPath: path.join(config.output.dir, 'service-worker.js'),
      },
    },
    {
      name: 'workbox',
      plugin: generateSW,
      options: {
        // Keep 'legacy-*.js' just for retro compatibility
        globIgnores: ['polyfills/*.js', 'legacy-*.js', 'nomodule-*.js'],
        navigateFallback: '/index.html',
        // where to output the generated sw
        swDest: path.join(config.output.dir, 'service-worker.js'),
        // directory to match patterns against to be precached
        globDirectory: path.join(config.output.dir),
        // cache any html js and css by default
        globPatterns: ['**/*.{html,js,css,webmanifest}', '**/*-search-index.json'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: 'polyfills/*.js',
            handler: 'CacheFirst',
          },
        ],
      },
    },
    {
      name: 'import-meta-assets',
      plugin: importMetaAssets,
    },
    {
      name: 'polyfills-loader',
      plugin: polyfillsLoader,
      options: {
        polyfills: {},
        minify: !developmentMode,
      },
    },
  ];

  return { config, metaPlugins: spaMetaPlugins, developmentMode };
}
