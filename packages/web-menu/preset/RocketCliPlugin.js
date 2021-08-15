/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('@rocket/cli').RocketCliOptions} RocketCliOptions */

import { WebMenuCli } from '@web/menu';

export class RocketMenuCliPlugin {
  static pluginName = 'RocketMenu';
  commands = ['start', 'build', 'lint'];

  /**
   * @param {object} options
   * @param {RocketCliOptions} options.config
   * @param {any} options.argv
   */
  async setup({ config, argv }) {
    this.__argv = argv;
    this.webMenu = new WebMenuCli();
    this.webMenu.setOptions({
      docsDir: config.outputDevDir,
      outputDir: config.outputDevDir,
      setupPlugins: config.setupMenus,
    });
  }

  async updated() {
    if (this.webMenu) {
      await this.webMenu.run();
    }
  }
}
