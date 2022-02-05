/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Command } from 'commander/esm.mjs';
import { RocketStart } from './RocketStart.js';
import { RocketBuild } from './RocketBuild.js';
import { RocketInit } from './RocketInit.js';

import path from 'path';
import { rm } from 'fs/promises';

/** @typedef {import('../types/main').RocketPlugin} RocketPlugin */

const program = new Command();

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
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

export class RocketCli {
  /** @type {string[]} */
  errors = [];

  /** @type{Required<import('../types/main').RocketCliOptions>} */
  // @ts-expect-error: awkward to type this in jsdoc
  config;

  options = {
    plugins: [],

    presets: [],
    setupDevServerAndBuildPlugins: [],
    setupDevServerPlugins: [],
    setupBuildPlugins: [],
    setupCliPlugins: [],
    setupEnginePlugins: [],

    command: 'help',
    watch: true,
    createSocialMediaImages: true,
    inputDir: 'docs',
    outputDir: '_site',
    outputDevDir: '_site-dev',

    // serviceWorkerSource: '@rocket/launch/',
    serviceWorkerName: 'service-worker.js',
    build: {},
    devServer: {},

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

  // constructor({ argv } = { argv: undefined }) {
  //   const mainDefinitions = [
  //     { name: 'command', defaultOption: true, defaultValue: 'help' },
  //     {
  //       name: 'config-file',
  //       alias: 'c',
  //       type: String,
  //       description: 'Location of Rocket configuration',
  //     },
  //   ];
  //   const options = commandLineArgs(mainDefinitions, {
  //     stopAtFirstUnknown: true,
  //     argv,
  //   });
  //   this.subArgv = options._unknown || [];
  //   this.argvConfig = {
  //     command: options.command,
  //     configFile: options['config-file'],
  //   };
  //   this.__isSetup = false;
  // }

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
   * @param {Partial<WebMenuCliOptions>} newOptions
   */
  setOptions(newOptions) {
    this.options = mergeDeep(this.options, newOptions);

    /** @type {MetaPlugin[]} */
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

  // /**
  //  * Separate this so we can test it
  //  */
  // async setup() {
  //   if (this.__isSetup === false) {
  //     this.options =
  //       /** @type{Required<import('../types/main').RocketCliOptions>} */
  //       (await normalizeConfig(this.argvConfig));
  //     this.__isSetup = true;
  //   }
  // }

  async prepare() {
    for (const preset of this.options.presets) {
      if (preset.adjustSettings) {
        this.options = preset.adjustSettings(this.options);
      }

      if (preset.adjustImagePresets) {
        this.options.imagePresets = preset.adjustImagePresets(this.options.imagePresets);
      }

      if (preset.setupStartAndBuildPlugins) {
        this.options.setupStartAndBuildPlugins = [
          ...this.options.setupStartAndBuildPlugins,
          ...preset.setupStartAndBuildPlugins,
        ];
      }
      if (preset.setupStartPlugins) {
        this.options.setupStartPlugins = [
          ...this.options.setupStartPlugins,
          ...preset.setupStartPlugins,
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

  async execute() {
    await this.applyConfigFile();
    await this.prepare();

    for (const plugin of this.options.plugins) {
      await plugin.setupCommand(program, this);
    }

    // program
    //   .command('start')
    //   .option('-i, --input-dir <path>', 'path to where to search for source files')
    //   // .hook('preAction', (thisCommand, actionCommand) => {
    //   //   // console.log({ thisCommand, actionCommand });
    //   //   thisCommand.foo = 'bar';
    //   //   actionCommand.foo = 'baz';
    //   //   if (thisCommand.opts().trace) {
    //   //     console.log(`About to call action handler for subcommand: ${actionCommand.name()}`);
    //   //     console.log('arguments: %O', actionCommand.args);
    //   //     console.log('options: %o', actionCommand.opts());
    //   //   }
    //   // })
    //   .action(options => {
    //     console.log(program.opts())
    //     console.log(options);
    //     console.log('START');
    //   });

    // program
    //   .option('-e --execute <command>', 'Execute a command')
    //   .option('-d, --docs-dir <path>', 'path to where to search for source files')
    //   .option('-c, --config-file <path>', 'path to config file');

    await program.parseAsync(this.argv);
    // console.log(program.opts());
    // this.setOptions(program.opts());

    // // await this.setup();

    // if (this.options.command === 'bootstrap') {
    //   return this.bootstrap();
    // }

    // for (const plugin of this.options.plugins) {
    //   if (this.considerPlugin(plugin) && typeof plugin.setupCommand === 'function') {
    //     this.options = plugin.setupCommand(this.options);
    //   }
    // }

    // // await fs.emptyDir(this.options.outputDevDir);

    // for (const plugin of this.options.plugins) {
    //   if (typeof plugin.setup === 'function') {
    //     await plugin.setup({ options: this.options });
    //   }
    // }

    // // execute the actual command
    // let executedAtLeastOneCommand = false;
    // const commandFn = `${this.options.command}Command`;
    // for (const plugin of this.options.plugins) {
    //   if (this.considerPlugin(plugin) && typeof plugin[commandFn] === 'function') {
    //     console.log(`Rocket executes ${commandFn} of ${plugin.constructor.pluginName}`);
    //     executedAtLeastOneCommand = true;
    //     await plugin[commandFn]();
    //   }
    // }
    // if (executedAtLeastOneCommand === false) {
    //   throw new Error(`No Rocket Cli Plugin had a ${commandFn} function.`);
    // }

    // for (const plugin of this.options.plugins) {
    //   if (this.considerPlugin(plugin) && typeof plugin.postCommand === 'function') {
    //     await plugin.postCommand();
    //   }
    // }

    // if (this.options.command === 'help') {
    //   console.log('Help is here: use build or start');
    // }
  }
  /**
   * @param {RocketPlugin} plugin
   */
  considerPlugin(plugin) {
    return plugin.commands.includes(this.options.command);
  }

  async update() {
    for (const plugin of this.options.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin.updated === 'function') {
        await plugin.updated();
      }
    }
  }

  async stop() {
    for (const plugin of this.options.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin.stop === 'function') {
        await plugin.stop();
      }
    }
  }

  async clearOutputDir() {
    await rm(this.options.outputDir, { recursive: true, force: true });
  }

  async cleanup() {
    await this.stop();
  }
}
