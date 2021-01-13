/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */

/** @typedef {import('plugins-manager').MetaPlugin} MetaPlugin */
/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */
/** @typedef {import('../types/main').RocketPlugin} RocketPlugin */

import path from 'path';

import { readConfig } from '@web/config-loader';

import { RocketStart } from './RocketStart.js';
import { RocketBuild } from './RocketBuild.js';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {Partial<RocketCliOptions>} inConfig
 * @returns {Promise<RocketCliOptions>}
 */
export async function normalizeConfig(inConfig) {
  let config = {
    presets: [],
    setupUnifiedPlugins: [],
    setupDevAndBuildPlugins: [],
    setupDevPlugins: [],
    setupBuildPlugins: [],
    setupEleventyPlugins: [],
    setupCliPlugins: [],
    eleventy: () => {},
    command: 'help',
    watch: true,
    inputDir: 'docs',
    outputDir: '_site',
    outputDevDir: '_site-dev',
    build: {},
    devServer: {},

    ...inConfig,
  };

  if (inConfig && inConfig.devServer) {
    config.devServer = { ...config.devServer, ...inConfig.devServer };
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
      };
    }
  } catch (error) {
    console.error('Could not read rocket config file', error);
    // we do not require a config file
  }

  const _configDirCwdRelative = path.relative(process.cwd(), path.resolve(__configDir));
  const _inputDirCwdRelative = path.join(_configDirCwdRelative, config.inputDir);

  // cli core preset is always first
  config._presetPathes = [path.join(__dirname, '..', 'preset')];
  for (const preset of config.presets) {
    config._presetPathes.push(preset.path);

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
    if (preset.setupCliPlugins) {
      config.setupCliPlugins = [...config.setupCliPlugins, ...preset.setupCliPlugins];
    }
  }
  // add "local" preset
  config._presetPathes.push(path.resolve(_inputDirCwdRelative));

  /** @type {MetaPlugin[]} */
  let pluginsMeta = [
    { name: 'rocket-start', plugin: RocketStart },
    { name: 'rocket-build', plugin: RocketBuild },
  ];

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

  // TODO: check pathPrefix to NOT have a '/' at the end as it will mean it may get ignored by 11ty 🤷‍♂️

  return {
    plugins,
    _inputDirCwdRelative,
    ...config,
  };
}
