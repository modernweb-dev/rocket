/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../types/main').CheckHtmlLinksCliOptions} CheckHtmlLinksCliOptions */

import path from 'path';
import chalk from 'chalk';

import commandLineArgs from 'command-line-args';
import { prepareFiles, validateFiles } from './validateFolder.js';
import { formatErrors } from './formatErrors.js';
import { listFiles } from './listFiles.js';

export class CheckHtmlLinksCli {
  /** @type {CheckHtmlLinksCliOptions} */
  options;

  constructor({ argv } = { argv: undefined }) {
    const mainDefinitions = [
      { name: 'ignore-link-pattern', type: String, multiple: true },
      { name: 'root-dir', type: String, defaultOption: true },
      { name: 'continue-on-error', type: Boolean },
      { name: 'validate-externals', type: Boolean },
      { name: 'absolute-base-url', type: String },
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
      validateExternals: options['validate-externals'],
      absoluteBaseUrl: options['absolute-base-url'],
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
    const {
      ignoreLinkPatterns,
      rootDir: userRootDir,
      validateExternals,
      absoluteBaseUrl,
    } = this.options;
    const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();
    const performanceStart = process.hrtime();

    const files = await listFiles('**/*.html', rootDir);

    console.log('Check HTML Links');

    const filesOutput =
      files.length == 0
        ? '  🧐 No files to check. Did you select the correct folder?'
        : `  📖 Found ${chalk.green.bold(files.length)} files containing`;
    console.log(filesOutput);

    const { numberLinks, checkLocalFiles, checkExternalLinks } = await prepareFiles(
      files,
      rootDir,
      {
        ignoreLinkPatterns,
        validateExternals,
        absoluteBaseUrl,
      },
    );

    console.log(`    🔗 ${chalk.green.bold(numberLinks)} internal links`);
    if (validateExternals) {
      console.log(`    🌐 ${chalk.green.bold(checkExternalLinks.length)} external links`);
    }

    console.log('  👀 Checking...');

    const { errors } = await validateFiles({
      checkLocalFiles,
      validateExternals,
      checkExternalLinks,
    });

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
        `  ❌ Found ${chalk.red.bold(
          errors.length.toString(),
        )} missing reference targets (used by ${referenceCount} links) while checking ${
          files.length
        } files:`,
        ...formatErrors(errors)
          .split('\n')
          .map(line => `  ${line}`),
        `  🕑 Checking links duration: ${performance[0]}s ${performance[1] / 1000000}ms`,
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
        `  ✅ All tested links are valid. (executed in ${performance[0]}s ${
          performance[1] / 1000000
        }ms)`,
      );
    }

    return { errors, message };
  }
}
