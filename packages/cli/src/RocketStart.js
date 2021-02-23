/* eslint-disable @typescript-eslint/ban-ts-comment */
import { startDevServer } from '@web/dev-server';
import { fromRollup } from '@web/dev-server-rollup';
import { metaConfigToWebDevServerConfig } from 'plugins-manager';

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */
/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

export class RocketStart {
  static pluginName = 'RocketStart';
  commands = ['start'];

  /**
   * @param {RocketCliOptions} config
   */
  setupCommand(config) {
    delete config.pathPrefix;
    config.createSocialMediaImages = !!config?.start?.createSocialMediaImages;
    return config;
  }

  /**
   * @param {object} options
   * @param {RocketCliOptions} options.config
   * @param {any} options.argv
   */
  async setup({ config, argv, eleventy }) {
    this.__argv = argv;
    this.config = {
      ...config,
      devServer: {
        ...config.devServer,
      },
    };
    this.eleventy = eleventy;
  }

  async startCommand() {
    if (!this.config) {
      return;
    }

    if (this.config.watch) {
      await this.eleventy.watch();
    } else {
      await this.eleventy.write();
    }

    /** @type {DevServerConfig} */
    const devServerConfig = metaConfigToWebDevServerConfig(
      {
        nodeResolve: true,
        watch: this.config.watch !== undefined ? this.config.watch : true,
        rootDir: this.config.outputDevDir,
        open: true,
        clearTerminalOnReload: false,
        ...this.config.devServer,

        setupRollupPlugins: this.config.setupDevAndBuildPlugins,
        setupPlugins: this.config.setupDevPlugins,
        middleware: [
          function rewriteIndex(context, next) {
            context.set('Access-Control-Allow-Origin', '*');
            return next();
          },
        ],
      },
      [],
      { rollupWrapperFunction: fromRollup },
    );

    this.devServer = await startDevServer({
      config: devServerConfig,
      readCliArgs: true,
      readFileConfig: false,
      argv: this.__argv,
    });
  }

  async stop() {
    if (this.devServer) {
      await this.devServer.stop();
    }
  }
}
