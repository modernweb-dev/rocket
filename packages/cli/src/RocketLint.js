/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').RocketCliOptions} RocketCliOptions */

import chalk from 'chalk';
import { validateFolder, formatErrors } from 'check-html-links';

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

    const performanceStart = process.hrtime();
    console.log('👀 Checking if all internal links work...');
    const errors = await validateFolder(this.config.lintInputDir);
    const performance = process.hrtime(performanceStart);
    if (errors.length > 0) {
      let referenceCount = 0;
      for (const error of errors) {
        referenceCount += error.usage.length;
      }
      const output = [
        `❌ Found ${chalk.red.bold(
          errors.length.toString(),
        )} missing reference targets (used by ${referenceCount} links):`,
        ...formatErrors(errors)
          .split('\n')
          .map(line => `  ${line}`),
        `Checking links duration: ${performance[0]}s ${performance[1] / 1000000}ms`,
      ];
      if (this.config.watch) {
        console.log(output.join('\n'));
      } else {
        throw new Error(output.join('\n'));
      }
    } else {
      console.log('✅ All internal links are valid.');
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
