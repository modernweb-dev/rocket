/* eslint-disable @typescript-eslint/ban-ts-comment */
import commandLineArgs from 'command-line-args';
import { normalizeConfig } from './normalizeConfig.js';
import { orderedCopyFiles } from './orderedCopyFiles.js';

/** @typedef {import('../types/main').RocketPlugin} RocketPlugin */

// @ts-ignore
import computedConfigPkg from './public/computedConfig.cjs';

import path from 'path';
import Eleventy from '@11ty/eleventy';
import TemplateConfig from '@11ty/eleventy/src/TemplateConfig.js';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const { setComputedConfig } = computedConfigPkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class RocketEleventy extends Eleventy {
  /**
   * @param {string} input
   * @param {string} output
   * @param {RocketCli} cli
   */
  constructor(input, output, cli) {
    super(input, output);
    this.__rocketCli = cli;
  }

  async write() {
    await this.__rocketCli.mergePresets();
    await super.write();
    await this.__rocketCli.update();
  }

  // forks it so we can watch for changes but don't include them while building
  getChokidarConfig() {
    let ignores = this.eleventyFiles.getGlobWatcherIgnores();

    const keepWatching = [
      path.join(this.__rocketCli.config._inputDirCwdRelative, '_assets', '**'),
      path.join(this.__rocketCli.config._inputDirCwdRelative, '_data', '**'),
      path.join(this.__rocketCli.config._inputDirCwdRelative, '_includes', '**'),
    ];

    ignores = ignores.filter(ignore => !keepWatching.includes(ignore));
    // debug("Ignoring watcher changes to: %o", ignores);

    let configOptions = this.config.chokidarConfig;

    // can’t override these yet
    // TODO maybe if array, merge the array?
    delete configOptions.ignored;

    return Object.assign(
      {
        ignored: ignores,
        ignoreInitial: true,
        // also interesting: awaitWriteFinish
      },
      configOptions,
    );
  }
}

export class RocketCli {
  /** @type {string[]} */
  errors = [];

  constructor({ argv } = { argv: undefined }) {
    const mainDefinitions = [
      { name: 'command', defaultOption: true, defaultValue: 'help' },
      {
        name: 'config-file',
        alias: 'c',
        type: String,
        description: 'Location of Rocket configuration',
      },
    ];
    const options = commandLineArgs(mainDefinitions, {
      stopAtFirstUnknown: true,
      argv,
    });
    this.subArgv = options._unknown || [];
    this.argvConfig = {
      command: options.command,
      configFile: options['config-file'],
    };
    this.__isSetup = false;
  }

  async setupEleventy() {
    if (!this.eleventy) {
      const { _inputDirCwdRelative, outputDevDir } = this.config;

      // We need to merge before we setup 11ty as the write phase is too late for _data
      // TODO: find a way so we don't need to double merge
      await this.mergePresets();

      const elev = new RocketEleventy(_inputDirCwdRelative, outputDevDir, this);
      // 11ty always wants a relative path to cwd - why?
      const rel = path.relative(process.cwd(), path.join(__dirname));
      const relCwdPathToConfig = path.join(rel, 'shared', '.eleventy.cjs');

      const config = new TemplateConfig(null, relCwdPathToConfig);
      elev.config = config.getConfig();
      elev.resetConfig();
      elev.setConfigPathOverride(relCwdPathToConfig);

      elev.isVerbose = false;
      await elev.init();

      this.eleventy = elev;
    }
  }

  async mergePresets() {
    for (const folder of ['_assets', '_data', '_includes']) {
      const to = path.join(this.config._inputDirCwdRelative, `_merged${folder}`);
      await fs.emptyDir(to);
      for (const sourceDir of this.config._presetPathes) {
        const from = path.join(sourceDir, folder);
        if (fs.existsSync(from)) {
          if (folder === '_includes') {
            await orderedCopyFiles({ from, to });
          } else {
            await fs.copy(from, to);
          }
        }
      }
    }
  }

  /**
   * Separate this so we can test it
   */
  async setup() {
    if (this.__isSetup === false) {
      this.config = await normalizeConfig(this.argvConfig);
      setComputedConfig(this.config);
      this.__isSetup = true;
    }
  }

  async run() {
    await this.setup();

    for (const plugin of this.config.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin.setupCommand === 'function') {
        this.config = plugin.setupCommand(this.config);
      }
    }

    await fs.emptyDir(this.config.outputDevDir);
    await this.setupEleventy();

    for (const plugin of this.config.plugins) {
      if (typeof plugin.setup === 'function') {
        await plugin.setup({ config: this.config, argv: this.subArgv, eleventy: this.eleventy });
      }
    }

    // execute the actual command
    let executedAtLeastOneCommand = false;
    const commandFn = `${this.config.command}Command`;
    for (const plugin of this.config.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin[commandFn] === 'function') {
        console.log(`Rocket executes ${commandFn} of ${plugin.constructor.pluginName}`);
        executedAtLeastOneCommand = true;
        await plugin[commandFn]();
      }
    }
    if (executedAtLeastOneCommand === false) {
      throw new Error(`No Rocket Cli Plugin had a ${commandFn} function.`);
    }

    for (const plugin of this.config.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin.postCommand === 'function') {
        await plugin.postCommand();
      }
    }

    if (this.config.command === 'help') {
      console.log('Help is here: use build or start');
    }
  }

  /**
   * @param {RocketPlugin} plugin
   */
  considerPlugin(plugin) {
    return plugin.commands.includes(this.config.command);
  }

  async update() {
    if (!this.eleventy || (this.eleventy && !this.eleventy.writer)) {
      return;
    }

    for (const page of this.eleventy.writer.templateMap._collection.items) {
      const { title, content: html, layout } = page.data;
      const url = page.data.page.url;
      const { inputPath, outputPath } = page;

      for (const plugin of this.config.plugins) {
        if (this.considerPlugin(plugin) && typeof plugin.inspectRenderedHtml === 'function') {
          await plugin.inspectRenderedHtml({
            html,
            inputPath,
            outputPath,
            layout,
            title,
            url,
            data: page.data,
            eleventy: this.eleventy,
          });
        }
      }
    }

    for (const plugin of this.config.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin.updated === 'function') {
        await plugin.updated();
      }
    }
  }

  async stop() {
    for (const plugin of this.config.plugins) {
      if (this.considerPlugin(plugin) && typeof plugin.stop === 'function') {
        await plugin.stop();
      }
    }
  }

  async cleanup() {
    setComputedConfig({});
    if (this.eleventy) {
      this.eleventy.finish();
      // await this.eleventy.stopWatch();
    }
    this.stop();
  }
}
