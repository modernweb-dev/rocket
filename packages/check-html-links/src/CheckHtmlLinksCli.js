/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').CheckHtmlLinksCliOptions} CheckHtmlLinksCliOptions */

import path from 'path';
import chalk from 'chalk';

import commandLineArgs from 'command-line-args';
import { validateFiles } from './validateFolder.js';
import { formatErrors } from './formatErrors.js';
import { listFiles } from './listFiles.js';

export class CheckHtmlLinksCli {
  /** @type {CheckHtmlLinksCliOptions} */
  options;

  constructor({ argv } = { argv: undefined }) {
    const mainDefinitions = [
      { name: 'ignore-link-pattern', type: String, multiple: true },
      { name: 'root-dir', type: String, defaultOption: true },
      { name: 'continue-on-error', type: Boolean, defaultOption: false },
    ];
    const options = commandLineArgs(mainDefinitions, {
      stopAtFirstUnknown: true,
      argv,
    });
    this.options = {
      printOnError: true,
      continueOnError: options['continue-on-error'],
      rootDir: options['root-dir'],
      ignoreLinkPatterns: options['ignore-link-pattern'],
    };
  }

  /**
   * @param {Partial<CheckHtmlLinksCliOptions>} newOptions
   */
  setOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions,
    };
  }

  async run() {
    const { ignoreLinkPatterns, rootDir: userRootDir } = this.options;
    const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();
    const performanceStart = process.hrtime();

    console.log('👀 Checking if all internal links work...');
    const files = await listFiles('**/*.html', rootDir);

    const filesOutput =
      files.length == 0
        ? '🧐 No files to check. Did you select the correct folder?'
        : `🔥 Found a total of ${chalk.green.bold(files.length)} files to check!`;
    console.log(filesOutput);

    const { errors, numberLinks } = await validateFiles(files, rootDir, { ignoreLinkPatterns });

    console.log(`🔗 Found a total of ${chalk.green.bold(numberLinks)} links to validate!\n`);

    const performance = process.hrtime(performanceStart);
    /** @type {string[]} */
    let output = [];
    let message = '';
    if (errors.length > 0) {
      let referenceCount = 0;
      for (const error of errors) {
        referenceCount += error.usage.length;
      }
      output = [
        `❌ Found ${chalk.red.bold(
          errors.length.toString(),
        )} missing reference targets (used by ${referenceCount} links) while checking ${
          files.length
        } files:`,
        ...formatErrors(errors)
          .split('\n')
          .map(line => `  ${line}`),
        `Checking links duration: ${performance[0]}s ${performance[1] / 1000000}ms`,
      ];
      message = output.join('\n');
      if (this.options.printOnError === true) {
        console.error(message);
      }
      if (this.options.continueOnError === false) {
        process.exit(1);
      }
    } else {
      console.log(
        `✅ All internal links are valid. (executed in ${performance[0]}s ${
          performance[1] / 1000000
        }ms)`,
      );
    }

    return { errors, message };
  }
}
