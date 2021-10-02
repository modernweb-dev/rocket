/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */

/** @typedef {import('plugins-manager').MetaPlugin} MetaPlugin */
/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */
/** @typedef {import('../types/main').ImagePreset} ImagePreset */
/** @typedef {import('../types/main').RocketPlugin} RocketPlugin */

import path from 'path';

import { readConfig } from '@web/config-loader';

import { RocketStart } from './RocketStart.js';
import { RocketBuild } from './RocketBuild.js';
import { RocketLint } from './RocketLint.js';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The default responsive ignore function will ignore files
 * - ending in `.svg`
 * - containing `rocket-unresponsive.`
 *
 * @param {object} opts
 * @param {string} opts.src
 * @param {string} opts.title
 * @param {string} opts.alt
 * @param {{name: string, value: string}[]} opts.attributes
 * @returns {boolean}
 */
function ignore({ src }) {
  return src.endsWith('svg') || src.includes('rocket-unresponsive.');
}

/**
 * @param {Partial<RocketCliOptions>} inConfig
 * @returns {Promise<RocketCliOptions & { __before11tyFunctions: RocketCliOptions['before11ty'][] }>}
 */
export async function normalizeConfig(inConfig) {
  let config = {
    presets: [],
    setupUnifiedPlugins: [],
    setupDevAndBuildPlugins: [],
    setupDevPlugins: [],
    setupBuildPlugins: [],
    setupEleventyPlugins: [],
    setupEleventyComputedConfig: [],
    setupCliPlugins: [],
    eleventy: () => {},
    command: 'help',
    watch: true,
    createSocialMediaImages: true,
    inputDir: 'docs',
    outputDir: '_site',
    outputDevDir: '_site-dev',
    serviceWorkerName: 'service-worker.js',
    build: {},
    devServer: {},

    ...inConfig,

    /** @type{RocketCliOptions['before11ty'][]} */
    __before11tyFunctions: [],

    /** @type{{[key: string]: ImagePreset}} */
    imagePresets: {
      responsive: {
        widths: [600, 900, 1640],
        formats: ['avif', 'jpeg'],
        sizes: '100vw',
        ignore,
      },
    },
  };

  if (inConfig && inConfig.devServer) {
    config.devServer = { ...config.devServer, ...inConfig.devServer };
  }
  if (inConfig.imagePresets && inConfig.imagePresets.responsive) {
    config.imagePresets.responsive = {
      ...config.imagePresets.responsive,
      ...inConfig.imagePresets.responsive,
    };
  }

  let userConfigFile;
  let __configDir = process.cwd();
  if (config.configFile) {
    const pathParts = path.parse(path.resolve(config.configFile));
    __configDir = pathParts.dir;
    userConfigFile = pathParts.base;
  }

  try {
    const fileConfig = await readConfig('rocket.config', userConfigFile, path.resolve(__configDir));
    if (fileConfig) {
      config = {
        ...config,
        ...fileConfig,
        build: {
          ...config.build,
          ...fileConfig.build,
        },
        devServer: {
          ...config.devServer,
          ...fileConfig.devServer,
        },
        imagePresets: config.imagePresets,
      };
      if (fileConfig.imagePresets && fileConfig.imagePresets.responsive) {
        config.imagePresets.responsive = {
          ...config.imagePresets.responsive,
          ...fileConfig.imagePresets.responsive,
        };
      }
    }
  } catch (error) {
    console.error('Could not read rocket config file', error);
    // we do not require a config file
  }

  const _configDirCwdRelative = path.relative(process.cwd(), path.resolve(__configDir));
  const _inputDirCwdRelative = path.join(_configDirCwdRelative, config.inputDir);

  // cli core preset is always first
  config._presetPaths = [path.join(__dirname, '..', 'preset')];
  for (const preset of config.presets) {
    config._presetPaths.push(preset.path);

    if (preset.adjustImagePresets) {
      config.imagePresets = preset.adjustImagePresets(config.imagePresets);
    }

    if (preset.setupUnifiedPlugins) {
      config.setupUnifiedPlugins = [...config.setupUnifiedPlugins, ...preset.setupUnifiedPlugins];
    }
    if (preset.setupDevAndBuildPlugins) {
      config.setupDevAndBuildPlugins = [
        ...config.setupDevAndBuildPlugins,
        ...preset.setupDevAndBuildPlugins,
      ];
    }
    if (preset.setupDevPlugins) {
      config.setupDevPlugins = [...config.setupDevPlugins, ...preset.setupDevPlugins];
    }
    if (preset.setupBuildPlugins) {
      config.setupBuildPlugins = [...config.setupBuildPlugins, ...preset.setupBuildPlugins];
    }
    if (preset.setupEleventyPlugins) {
      config.setupEleventyPlugins = [
        ...config.setupEleventyPlugins,
        ...preset.setupEleventyPlugins,
      ];
    }
    if (preset.setupEleventyComputedConfig) {
      config.setupEleventyComputedConfig = [
        ...config.setupEleventyComputedConfig,
        ...preset.setupEleventyComputedConfig,
      ];
    }
    if (preset.setupCliPlugins) {
      config.setupCliPlugins = [...config.setupCliPlugins, ...preset.setupCliPlugins];
    }

    if (typeof preset.before11ty === 'function') {
      config.__before11tyFunctions.push(preset.before11ty);
    }
  }
  // add "local" preset
  config._presetPaths.push(path.resolve(_inputDirCwdRelative));

  /** @type {MetaPlugin[]} */
  let pluginsMeta = [{ plugin: RocketStart }, { plugin: RocketBuild }, { plugin: RocketLint }];

  if (Array.isArray(config.setupCliPlugins)) {
    for (const setupFn of config.setupCliPlugins) {
      pluginsMeta = setupFn(pluginsMeta);
    }
  }

  /** @type {RocketPlugin[]} */
  const plugins = [];
  for (const pluginObj of pluginsMeta) {
    /** @type {RocketPlugin} */
    let pluginInst = pluginObj.options
      ? new pluginObj.plugin(pluginObj.options)
      : new pluginObj.plugin();
    plugins.push(pluginInst);
  }

  if (typeof config.before11ty === 'function') {
    config.__before11tyFunctions.push(config.before11ty);
  }

  // TODO: check pathPrefix to NOT have a '/' at the end as it will mean it may get ignored by 11ty 🤷‍♂️

  return {
    plugins,
    _inputDirCwdRelative,
    ...config,
  };
}
