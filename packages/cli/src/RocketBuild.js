import path from 'path';

import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import { buildHtml } from './build/buildHtml.js';
import { buildOpenGraphImages } from './build/buildOpenGraphImages.js';
import { buildJavaScriptOptimizedOutput } from './build/buildJavaScriptOptimizedOutput.js';

export class RocketBuild {
  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;

    program
      .command('build')
      .option('-i, --input-dir <path>', 'path to where to search for source files')
      .action(async cliOptions => {
        cli.setOptions(cliOptions);

        await this.build();
      });
  }

  async build() {
    if (!this.cli) {
      return;
    }
    // for typescript as `this.cli.options.outputDir` supports other inputs as well
    // but the cli will normalize it to a string before calling plugins
    if (typeof this.cli.options.outputDir !== 'string') {
      return;
    }

    await this.cli.events.dispatchEventDone('build-start');

    // 1. build html
    this.engine = await buildHtml(this.cli);

    // 2. build open graph images
    if (this.cli.options.buildOpenGraphImages) {
      console.log('Generating Open Graph Images...');
      await buildOpenGraphImages(this.cli);
    }

    // 3. build optimized output
    if (this.cli.options.buildOptimize && this.engine) {
      console.log('Optimize Production Build...');
      await buildJavaScriptOptimizedOutput(this.cli, this.engine);
    }

    // hackfix 404.html by making all asset urls absolute (rollup always makes them relative) which will break if netlify serves the content form a different url
    // TODO: find a better way to do this
    const notFoundHtmlFilePath = path.join(this.cli.options.outputDir, '404.html');
    if (existsSync(notFoundHtmlFilePath)) {
      let notFoundHtml = await readFile(notFoundHtmlFilePath, 'utf8');
      notFoundHtml = notFoundHtml.replace(/img src="/gm, 'img src="/');
      notFoundHtml = notFoundHtml.replace(
        /link rel="stylesheet" href="/gm,
        'link rel="stylesheet" href="/',
      );
      await writeFile(notFoundHtmlFilePath, notFoundHtml);
    }

    await this.cli.events.dispatchEventDone('build-end');
  }
}
