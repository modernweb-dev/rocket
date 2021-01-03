/* eslint-disable @typescript-eslint/ban-ts-comment */
import { startDevServer } from '@web/dev-server';
import { fromRollup } from '@web/dev-server-rollup';
import { metaConfigToWebDevServerConfig } from 'plugins-manager';

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */
/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

export class RocketStart {
  commands = ['start'];

  /**
   * @param {object} options
   * @param {RocketCliOptions} options.config
   * @param {any} options.argv
   */
  async setup({ config, argv }) {
    this.__argv = argv;
    this.config = {
      ...config,
      devServer: {
        ...config.devServer,
      },
    };
  }

  async execute() {
    if (!this.config) {
      return;
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

        setupPlugins: [...this.config.setupDevAndBuildPlugins, ...this.config.setupDevPlugins],
      },
      [],
      { wrapperFunction: fromRollup },
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
