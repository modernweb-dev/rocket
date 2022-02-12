/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { fromRollup } from '@web/dev-server-rollup';
// import { executeSetupFunctions } from 'plugins-manager';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */
/** @typedef {import('../types/main.js').RocketCliOptions} RocketCliOptions */

import { Engine } from '@rocket/engine/server';

export class RocketStart {
  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;
    this.active = true;

    program
      .command('start')
      .option('-i, --input-dir <path>', 'path to where to search for source files')
      .option('-o, --open', 'automatically open the browser')
      .action(async cliOptions => {
        cli.setOptions(cliOptions);

        await this.start();
      });
  }

  async start() {
    if (!this.cli) {
      return;
    }
    this.engine = new Engine();
    this.engine.setOptions({
      docsDir: this.cli.options.inputDir,
      outputDir: this.cli.options.outputDir,
      setupPlugins: this.cli.options.setupEnginePlugins,
      open: this.cli.options.open,
    });
    try {
      console.log('🚀 Engines online');
      await this.engine.start();
    } catch (e) {
      console.log('Engine start errored');
      console.error(e);
    }
  }

  async stop() {
    if (this.engine) {
      await this.engine.stop();
    }
  }
}

// /**
//  * @param {any} config
//  * @param {MetaPluginWrapable[]} metaPlugins
//  * @param {object} [options]
//  * @param {function | null} [options.rollupWrapperFunction]
//  */
// export function metaConfigToWebDevServerConfig(
//   config,
//   metaPlugins,
//   { rollupWrapperFunction = null } = {},
// ) {
//   if (config.plugins) {
//     delete config.setupPlugins;
//     delete config.setupRollupPlugins;
//     return config;
//   }

//   const metaPluginsNoWrap = metaPlugins.map(pluginObj => {
//     pluginObj.__noWrap = true;
//     return pluginObj;
//   });

//   const rollupPlugins = /** @type {MetaPluginWrapable[]} */ (executeSetupFunctions(
//     config.setupRollupPlugins,
//     [...metaPluginsNoWrap],
//   ));

//   const wrappedRollupPlugins = rollupPlugins.map(pluginObj => {
//     if (typeof rollupWrapperFunction === 'function' && pluginObj.__noWrap !== true) {
//       pluginObj.plugin = rollupWrapperFunction(pluginObj.plugin);
//     }
//     return pluginObj;
//   });

//   const _metaPlugins = executeSetupFunctions(config.setupPlugins, [...wrappedRollupPlugins]);

//   const plugins = _metaPlugins.map(pluginObj => {
//     if (pluginObj.options) {
//       return pluginObj.plugin(pluginObj.options);
//     } else {
//       return pluginObj.plugin();
//     }
//   });
//   config.plugins = plugins;

//   delete config.setupPlugins;
//   delete config.setupRollupPlugins;
//   return config;
// }

// async startCommand() {
// if (useOptions.docsDir) {
//   useOptions.docsDir = path.join(__dirname, docsDir.split('/').join(path.sep));
// }
// useOptions.outputDir = path.join(useOptions.docsDir, '..', '__output');

// /** @type {DevServerConfig} */
// const devServerConfig = metaConfigToWebDevServerConfig(
//   {
//     nodeResolve: true,
//     watch: this.config.watch !== undefined ? this.config.watch : true,
//     rootDir: this.config.outputDevDir,
//     open: true,
//     clearTerminalOnReload: false,
//     ...this.config.devServer,

//     setupRollupPlugins: this.config.setupDevAndBuildPlugins,
//     setupPlugins: this.config.setupDevPlugins,
//   },
//   [],
//   { rollupWrapperFunction: fromRollup },
// );
// }
