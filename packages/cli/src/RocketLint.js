/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */

import { CheckHtmlLinksCli } from 'check-html-links';

export class RocketLint {
  static pluginName = 'RocketLint';
  commands = ['start', 'build', 'lint'];

  /**
   * @param {RocketCliOptions} config
   */
  setupCommand(config) {
    if (config.command === 'lint') {
      config.watch = false;
    }
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
      lintInputDir: config.outputDevDir,
      lintExecutesEleventyBefore: true,
      ...config,
    };
    this.eleventy = eleventy;
  }

  async lintCommand() {
    if (this.config.lintExecutesEleventyBefore) {
      await this.eleventy.write();
      // updated will trigger linting
    } else {
      await this.__lint();
    }
  }

  async __lint() {
    if (this.config?.pathPrefix) {
      console.log('INFO: RocketLint currently does not support being used with a pathPrefix');
      return;
    }

    const checkLinks = new CheckHtmlLinksCli();
    checkLinks.setOptions({
      ...this.config.checkLinks,
      rootDir: this.config.lintInputDir,
      printOnError: false,
      continueOnError: true,
    });

    const { errors, message } = await checkLinks.run();
    if (errors.length > 0) {
      if (this.config.command === 'start') {
        console.log(message);
      } else {
        throw new Error(message);
      }
    }
  }

  async postCommand() {
    if (this.config.watch === false) {
      await this.__lint();
    }
  }

  async updated() {
    if (this.config.watch === true) {
      await this.__lint();
    }
  }
}
