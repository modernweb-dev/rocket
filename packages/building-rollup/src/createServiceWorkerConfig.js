import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

import { applyPlugins } from 'plugins-manager';

/** @typedef {import('../types/main.js').BuildingRollupOptions} BuildingRollupOptions */

/**
 * @param {BuildingRollupOptions} userConfig
 */
export function createServiceWorkerConfig(userConfig) {
  const { config, metaPlugins } = createServiceWorkerMetaConfig(userConfig);
  return applyPlugins(config, metaPlugins);
}

/**
 * @param {BuildingRollupOptions} userConfig
 */
export function createServiceWorkerMetaConfig(userConfig = { output: {} }) {
  const developmentMode =
    typeof userConfig.developmentMode !== 'undefined'
      ? userConfig.developmentMode
      : !!process.env.ROLLUP_WATCH;
  delete userConfig.developmentMode;

  const config = {
    treeshake: !developmentMode,
    setupPlugins: [],
    ...userConfig,

    output: {
      format: 'iife',
      file: 'service-worker.js',
      ...userConfig.output,
    },
  };

  /**
   * @type {import('plugins-manager').MetaPlugin<any>[]}
   */
  let metaPlugins = [
    {
      // @ts-ignore
      plugin: resolve,
      options: {
        moduleDirectories: ['node_modules', 'web_modules'],
      },
    },
    {
      // @ts-ignore
      plugin: replace,
      options: {
        'process.env.NODE_ENV': JSON.stringify(developmentMode ? 'development' : 'production'),
        preventAssignment: true,
      },
    },
    {
      plugin: babel,
      options: {
        babelHelpers: 'bundled',
        compact: true,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: [
                'last 3 Chrome major versions',
                'last 3 ChromeAndroid major versions',
                'last 3 Firefox major versions',
                'last 3 Edge major versions',
                'last 3 Safari major versions',
                'last 3 iOS major versions',
              ],
              useBuiltIns: false,
              shippedProposals: true,
              modules: false,
              bugfixes: true,
            },
          ],
        ],
      },
    },
    {
      // @ts-ignore
      plugin: terser,
      options: {
        mangle: {
          toplevel: true,
          properties: {
            regex: /(^_|_$)/,
          },
        },
      },
    },
  ];

  return { config, metaPlugins, developmentMode };
}
