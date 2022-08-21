/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-ignore
import { CheckHtmlLinksCli } from 'check-html-links';
import { bold, gray } from 'colorette';
import { existsSync } from 'fs';
import path from 'path';
import { buildHtml } from './build/buildHtml.js';

export class RocketLint {
  options = {
    buildHtml: false,
  };

  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;
    this.active = true;

    program
      .command('lint')
      .option('-i, --input-dir <path>', 'path to where to search for source files')
      .option('-b, --build-html', 'do a quick html only build and then check links')
      .action(async options => {
        const { cliOptions, ...lintOptions } = options;
        cli.setOptions({
          ...cliOptions,
          lint: lintOptions,
        });
        this.options = { ...this.options, ...cli.options.lint };
        cli.activePlugin = this;

        await this.lint();
      });
  }

  async lint() {
    if (!this.cli) {
      return;
    }

    // for typescript as `this.cli.options.outputDir` supports other inputs as well
    // but the cli will normalize it to a string before calling plugins
    if (
      typeof this.cli.options.outputDevDir !== 'string' ||
      typeof this.cli.options.outputDir !== 'string'
    ) {
      return;
    }

    if (this.options.buildHtml) {
      await buildHtml(this.cli);
    }

    const folderToCheck = this.options.buildHtml
      ? this.cli.options.outputDevDir
      : this.cli.options.outputDir;

    const rootIndexHtml = path.join(folderToCheck, 'index.html');
    if (!existsSync(rootIndexHtml)) {
      console.log(`${bold(`👀 Linting Production Build`)}`);
      console.log('');
      console.log(`  🛑 No index.html found in the build directory ${gray(`${rootIndexHtml}`)}`);
      console.log('  🤔 Did you forget to run `rocket build` before?');
      console.log('');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { buildHtml: _drop, ...userCheckHtmlLinksOptions } = this.options;

    const checkLinks = new CheckHtmlLinksCli();
    checkLinks.setOptions({
      rootDir: folderToCheck,
      printOnError: true,
      continueOnError: false,
      ...userCheckHtmlLinksOptions,
    });

    await checkLinks.run();
  }
}
