/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Command } from 'commander';
import { RocketStart } from './RocketStart.js';
import { RocketBuild } from './RocketBuild.js';
import { RocketLint } from './RocketLint.js';
import { RocketUpgrade } from './RocketUpgrade.js';
import { RocketPreview } from './RocketPreview.js';
// import { ignore } from './images/ignore.js';

import path from 'path';
import { rm } from 'fs/promises';
import { mergeDeep } from './helpers/mergeDeep.js';
import { existsSync } from 'fs';
import { AsyncEventEmitter } from './helpers/AsyncEventEmitter.js';

/** @typedef {import('../types/main.js').RocketCliPlugin} RocketCliPlugin */
/** @typedef {import('../types/main.js').FullRocketCliOptions} FullRocketCliOptions */
/** @typedef {import('../types/main.js').RocketCliOptions} RocketCliOptions */
/** @typedef {import('../types/preset.js').ImagePreset} ImagePreset */

export class RocketCli {
  /** @type {FullRocketCliOptions} */
  options = {
    plugins: [],

    presets: [],
    setupDevServerAndBuildPlugins: [],
    setupDevServerPlugins: [],
    setupDevServerMiddleware: [],
    setupBuildPlugins: [],
    setupCliPlugins: [],
    setupEnginePlugins: [],

    watch: true,
    open: false,
    cwd: process.cwd(),
    inputDir: 'FALLBACK',
    outputDir: 'FALLBACK',
    outputDevDir: '_site-dev',

    serviceWorkerSourcePath: '',
    serviceWorkerName: 'service-worker.js',
    buildOptimize: true,
    buildAutoStop: true,
    buildOpenGraphImages: true,

    longFileHeaderWidth: 100,
    longFileHeaderComment: '',

    adjustBuildOptions: options => options,
    adjustDevServerOptions: options => options,

    configFile: '',
    absoluteBaseUrl: '',
    clearOutputDir: true,

    lint: {
      buildHtml: false,
    },

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

  events = new AsyncEventEmitter();

  /** @type {RocketCliPlugin | undefined} */
  activePlugin = undefined;

  constructor({ argv = process.argv } = {}) {
    this.argv = argv;

    this.program = new Command();
    this.program.allowUnknownOption().option('-c, --config-file <path>', 'path to config file');
    this.program.parse(this.argv);

    this.program.allowUnknownOption(false);

    if (this.program.opts().configFile) {
      this.options.configFile = this.program.opts().configFile;
    }
  }

  /**
   * @param {RocketCliOptions} newOptions
   */
  setOptions(newOptions) {
    // @ts-ignore
    this.options = mergeDeep(this.options, newOptions);

    if (this.options.inputDir === 'FALLBACK') {
      this.options.inputDir = path.join(this.options.cwd, 'site', 'pages');
    }
    if (this.options.outputDir === 'FALLBACK') {
      this.options.outputDir = path.join(this.options.cwd, '_site');
    }
    if (this.options.inputDir instanceof URL) {
      this.options.inputDir = this.options.inputDir.pathname;
    }
    if (this.options.outputDir instanceof URL) {
      this.options.outputDir = this.options.outputDir.pathname;
    }
    if (this.options.outputDevDir instanceof URL) {
      this.options.outputDevDir = this.options.outputDevDir.pathname;
    }

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
      if (preset.adjustOptions) {
        this.options = preset.adjustOptions(this.options);
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
      if (preset.setupDevServerMiddleware) {
        this.options.setupDevServerMiddleware = [
          ...this.options.setupDevServerMiddleware,
          ...preset.setupDevServerMiddleware,
        ];
      }
      if (preset.setupBuildPlugins) {
        this.options.setupBuildPlugins = [
          ...this.options.setupBuildPlugins,
          ...preset.setupBuildPlugins,
        ];
      }
      if (preset.setupCliPlugins) {
        this.options.setupCliPlugins = [
          ...(this.options.setupCliPlugins || []),
          ...preset.setupCliPlugins,
        ];
      }
      if (preset.setupEnginePlugins) {
        this.options.setupEnginePlugins = [
          ...(this.options.setupEnginePlugins || []),
          ...preset.setupEnginePlugins,
        ];
      }
    }

    /** @type {import('../types/main.js').MetaPluginOfRocketCli[]} */
    let pluginsMeta = [
      { plugin: RocketStart, options: {} },
      { plugin: RocketBuild, options: {} },
      { plugin: RocketLint, options: {} },
      { plugin: RocketUpgrade, options: {} },
      { plugin: RocketPreview, options: {} },
    ];

    if (Array.isArray(this.options.setupCliPlugins)) {
      for (const setupFn of this.options.setupCliPlugins) {
        // @ts-ignore
        pluginsMeta = setupFn(pluginsMeta);
      }
    }

    /** @type {RocketCliPlugin[]} */
    this.options.plugins = [];
    for (const pluginObj of pluginsMeta) {
      /** @type {RocketCliPlugin} */
      let pluginInst = pluginObj.options
        ? // @ts-ignore
          new pluginObj.plugin(pluginObj.options)
        : // @ts-ignore
          new pluginObj.plugin();
      this.options.plugins.push(pluginInst);
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
        await plugin.setupCommand(this.program, this);
      }
    }

    await this.program.parseAsync(this.argv);
  }

  async stop({ hard = true } = {}) {
    if (!this.options.plugins) {
      return;
    }
    for (const plugin of this.options.plugins) {
      if (plugin.stop) {
        await plugin.stop({ hard });
      }
    }
  }

  async clearOutputDir() {
    if (this.options.outputDir && existsSync(this.options.outputDir)) {
      await rm(this.options.outputDir, { recursive: true, force: true });
    }
  }

  async clearOutputDevDir() {
    if (this.options.outputDevDir && existsSync(this.options.outputDevDir)) {
      await rm(this.options.outputDevDir, { recursive: true, force: true });
    }
  }
}
