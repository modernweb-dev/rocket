/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { startDevServer } from '@web/dev-server';
// import { fromRollup } from '@web/dev-server-rollup';
// import { executeSetupFunctions } from 'plugins-manager';

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */
/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

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

import { Engine } from '@rocket/engine/server';

export class RocketStart {
  static pluginName = 'RocketStart';

  /**
   * @param {RocketCliOptions} config
   */
  async setupCommand(program, cli) {
    this.cli = cli;

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
    this.engine = new Engine();
    this.engine.setOptions({
      docsDir: this.cli.options.inputDir,
      outputDir: this.cli.options.outputDir,
      setupPlugins: this.cli.options.setupEnginePlugins,
      open: this.cli.options.open,
    });
    try {
      await this.engine.start();
      console.log('🚀 Engine started');
    } catch (e) {
      console.log('Engine start errored');
      console.error(e);
    }
  }

  async startCommand() {
    // if (!this.config) {
    //   return;
    // }

    await this.engine.start();
    // if (useOptions.docsDir) {
    //   useOptions.docsDir = path.join(__dirname, docsDir.split('/').join(path.sep));
    // }
    // useOptions.outputDir = path.join(useOptions.docsDir, '..', '__output');

    // if (this.config.watch) {
    //   await this.eleventy.watch();
    // } else {
    //   await this.eleventy.write();
    // }

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

    // this.devServer = await startDevServer({
    //   config: devServerConfig,
    //   readCliArgs: true,
    //   readFileConfig: false,
    //   argv: this.__argv,
    // });
  }

  async stop() {
    if (this.engine) {
      await this.engine.cleanup();
    }
  }
}
