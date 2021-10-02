import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babelPkg from '@rollup/plugin-babel';

import { applyPlugins } from 'plugins-manager';

const { babel } = babelPkg;

export function createBasicConfig(userConfig) {
  const { config, metaPlugins } = createBasicMetaConfig(userConfig);
  return applyPlugins(config, metaPlugins);
}

export function createBasicMetaConfig(userConfig = { output: {} }) {
  const developmentMode =
    typeof userConfig.developmentMode !== undefined
      ? userConfig.developmentMode
      : !!process.env.ROLLUP_WATCH;
  delete userConfig.developmentMode;

  const fileName = `[${developmentMode ? 'name' : 'hash'}].js`;
  const assetName = `[${developmentMode ? 'name' : 'hash'}][extname]`;

  const config = {
    preserveEntrySignatures: 'strict',
    treeshake: !developmentMode,
    setupPlugins: [],
    ...userConfig,

    output: {
      entryFileNames: fileName,
      chunkFileNames: fileName,
      assetFileNames: assetName,
      format: 'es',
      dir: 'dist',
      ...userConfig.output,
    },
  };

  let metaPlugins = [
    {
      plugin: resolve,
      options: {
        moduleDirectories: ['node_modules', 'web_modules'],
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
      plugin: terser,
    },
  ];

  return { config, metaPlugins, developmentMode };
}
