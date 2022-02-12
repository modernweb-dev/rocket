/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Command } from 'commander';
import { RocketStart } from './RocketStart.js';
import { RocketBuild } from './RocketBuild.js';
import { RocketInit } from './RocketInit.js';
// import { ignore } from './images/ignore.js';

import path from 'path';
import { rm } from 'fs/promises';
import { mergeDeep } from './helpers/mergeDeep.js';

/** @typedef {import('../types/main.js').RocketPlugin} RocketPlugin */
/** @typedef {import('../types/main.js').RocketCliOptions} RocketCliOptions */
/** @typedef {import('../types/preset.js').ImagePreset} ImagePreset */

const program = new Command();

export class RocketCli {
  /** @type {RocketCliOptions} */
  options = {
    plugins: [],

    presets: [],
    setupDevServerAndBuildPlugins: [],
    setupDevServerPlugins: [],
    setupBuildPlugins: [],
    setupCliPlugins: [],
    setupEnginePlugins: [],

    watch: true,
    inputDir: 'docs',
    outputDir: '_site',
    outputDevDir: '_site-dev',

    // serviceWorkerSource: '@rocket/launch/',
    serviceWorkerName: 'service-worker.js',
    build: {},
    devServer: {},

    // /** @type {{[key: string]: ImagePreset}} */
    // imagePresets: {
    //   responsive: {
    //     widths: [600, 900, 1640],
    //     formats: ['avif', 'jpeg'],
    //     sizes: '100vw',
    //     ignore,
    //   },
    // },
  };

  constructor({ argv = process.argv } = {}) {
    this.argv = argv;

    program.allowUnknownOption().option('-c, --config-file <path>', 'path to config file');
    program.parse(this.argv);

    program.allowUnknownOption(false);

    if (program.opts().configFile) {
      this.options.configFile = program.opts().configFile;
    }
  }

  /**
   * @param {Partial<RocketCliOptions>} newOptions
   */
  setOptions(newOptions) {
    // @ts-ignore
    this.options = mergeDeep(this.options, newOptions);

    /** @type {import('../types/main.js').MetaPluginOfRocket} */
    let pluginsMeta = [
      { plugin: RocketStart },
      { plugin: RocketBuild },
      { plugin: RocketInit },
      // { plugin: RocketLint },
      // { plugin: RocketUpgrade}
    ];

    if (Array.isArray(this.options.setupCliPlugins)) {
      for (const setupFn of this.options.setupCliPlugins) {
        pluginsMeta = setupFn(pluginsMeta);
      }
    }

    /** @type {RocketPlugin[]} */
    this.options.plugins = [];
    for (const pluginObj of pluginsMeta) {
      /** @type {RocketPlugin} */
      let pluginInst = pluginObj.options
        ? new pluginObj.plugin(pluginObj.options)
        : new pluginObj.plugin();
      this.options.plugins.push(pluginInst);
    }

    // const setupEnginePlugins = newOptions.setupUnifiedPlugins
    //   ? [...this.options.setupUnifiedPlugins, ...newOptions.setupUnifiedPlugins]
    //   : this.options.setupUnifiedPlugins;
    // const devServer = newOptions.devServer
    //   ? { ...this.options.devServer, ...newOptions.devServer }
    //   : this.options.devServer;

    // if (inConfig.imagePresets && inConfig.imagePresets.responsive) {
    //   config.imagePresets.responsive = {
    //     ...config.imagePresets.responsive,
    //     ...inConfig.imagePresets.responsive,
    //   };
    // }

    // this.options = {
    //   ...this.options,
    //   ...newOptions,
    //   setupPlugins,
    // };
  }

  async applyConfigFile() {
    if (this.options.configFile) {
      const configFilePath = path.resolve(this.options.configFile);
      const fileOptions = (await import(configFilePath)).default;
      if (fileOptions.docsDir) {
        fileOptions.docsDir = path.join(path.dirname(configFilePath), fileOptions.docsDir);
      }
      this.setOptions(fileOptions);
    } else {
      // make sure all default settings are properly initialized
      this.setOptions({});
    }
  }

  async prepare() {
    if (!this.options.presets) {
      return;
    }
    for (const preset of this.options.presets) {
      if (preset.adjustSettings) {
        this.options = preset.adjustSettings(this.options);
      }

      // if (preset.adjustImagePresets && this.options.imagePresets) {
      //   this.options.imagePresets = preset.adjustImagePresets(this.options.imagePresets);
      // }

      if (preset.setupDevServerAndBuildPlugins) {
        this.options.setupDevServerAndBuildPlugins = [
          ...this.options.setupDevServerAndBuildPlugins,
          ...preset.setupDevServerAndBuildPlugins,
        ];
      }
      if (preset.setupDevServerPlugins) {
        this.options.setupDevServerPlugins = [
          ...this.options.setupDevServerPlugins,
          ...preset.setupDevServerPlugins,
        ];
      }
      if (preset.setupBuildPlugins) {
        this.options.setupBuildPlugins = [
          ...this.options.setupBuildPlugins,
          ...preset.setupBuildPlugins,
        ];
      }
      if (preset.setupCliPlugins) {
        this.options.setupCliPlugins = [...this.options.setupCliPlugins, ...preset.setupCliPlugins];
      }
      if (preset.setupEnginePlugins) {
        this.options.setupEnginePlugins = [
          ...this.options.setupEnginePlugins,
          ...preset.setupEnginePlugins,
        ];
      }
    }
  }

  async start() {
    await this.applyConfigFile();
    await this.prepare();

    if (!this.options.plugins) {
      return;
    }

    for (const plugin of this.options.plugins) {
      if (plugin.setupCommand) {
        await plugin.setupCommand(program, this);
      }
    }

    await program.parseAsync(this.argv);
  }

  async stop() {
    if (!this.options.plugins) {
      return;
    }
    for (const plugin of this.options.plugins) {
      if (plugin.stop) {
        await plugin.stop();
      }
    }
  }

  async clearOutputDir() {
    if (this.options.outputDir) {
      await rm(this.options.outputDir, { recursive: true, force: true });
    }
  }
}
