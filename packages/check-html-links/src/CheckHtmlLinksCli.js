/* eslint-disable @typescript-eslint/ban-ts-comment */

import path from 'path';
import chalk from 'chalk';

import commandLineArgs from 'command-line-args';
import { validateFiles } from './validateFolder.js';
import { formatErrors } from './formatErrors.js';
import { listFiles } from './listFiles.js';

export class CheckHtmlLinksCli {
  /** @type {{dir: string?, ignoreLinkPatterns: string[]?}} */
  argvConfig;

  constructor({ argv } = { argv: undefined }) {
    const mainDefinitions = [
      { name: 'ignore-link-pattern', type: String, multiple: true },
      { name: 'dir', type: String, defaultOption: true },
    ];
    const options = commandLineArgs(mainDefinitions, {
      stopAtFirstUnknown: true,
      argv,
    });
    this.argvConfig = {
      dir: options.dir,
      ignoreLinkPatterns: options['ignore-link-pattern'],
    };
  }

  async run() {
    const userRootDir = this.argvConfig.dir;
    const rootDir = userRootDir ? path.resolve(userRootDir) : process.cwd();
    const performanceStart = process.hrtime();

    console.log('👀 Checking if all internal links work...');
    const files = await listFiles('**/*.html', rootDir);

    const filesOutput =
      files.length == 0
        ? '🧐 No files to check. Did you select the correct folder?'
        : `🔥 Found a total of ${chalk.green.bold(files.length)} files to check!`;
    console.log(filesOutput);

    const { ignoreLinkPatterns } = this.argvConfig;

    const { errors, numberLinks } = await validateFiles(files, rootDir, { ignoreLinkPatterns });

    console.log(`🔗 Found a total of ${chalk.green.bold(numberLinks)} links to validate!\n`);

    const performance = process.hrtime(performanceStart);
    if (errors.length > 0) {
      let referenceCount = 0;
      for (const error of errors) {
        referenceCount += error.usage.length;
      }
      const output = [
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
      console.error(output.join('\n'));
      process.exit(1);
    } else {
      console.log(
        `✅ All internal links are valid. (executed in %ds %dms)`,
        performance[0],
        performance[1] / 1000000,
      );
    }
  }
}
