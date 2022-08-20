import { logPreviewMessage } from './preview/logPreviewMessage.js';
import { startDevServer } from '@web/dev-server';
import path from 'path';
import { existsSync } from 'fs';
import { gray, bold } from 'colorette';

export class RocketPreview {
  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;
    this.active = true;

    program
      .command('preview')
      .option('-i, --input-dir <path>', 'path to the folder with the build html files')
      .option('-o, --open', 'automatically open the browser')
      .action(async cliOptions => {
        cli.setOptions(cliOptions);
        cli.activePlugin = this;

        await this.preview();
      });
  }

  async preview() {
    if (!this.cli) {
      return;
    }

    // for typescript as `this.cli.options.outputDir` supports other inputs as well
    // but the cli will normalize it to a string before calling plugins
    if (
      typeof this.cli.options.inputDir !== 'string' ||
      typeof this.cli.options.outputDir !== 'string'
    ) {
      return;
    }

    const rootIndexHtml = path.join(this.cli.options.outputDir, 'index.html');
    if (!existsSync(rootIndexHtml)) {
      console.log(`${bold(`👀 Previewing Production Build`)}`);
      console.log('');
      console.log(`  🛑 No index.html found in the build directory ${gray(`${rootIndexHtml}`)}`);
      console.log('  🤔 Did you forget to run `rocket build` before?');
      console.log('');
      return;
    }

    /** @type {import('@web/dev-server').DevServerConfig} */
    const config = {
      open: this.cli.options.open,
      rootDir: this.cli.options.outputDir,
      clearTerminalOnReload: false,
    };

    try {
      this.devServer = await startDevServer({
        config,
        logStartMessage: false,
        readCliArgs: false,
        readFileConfig: false,
        // argv: this.__argv,
      });
      logPreviewMessage({ devServerOptions: this.devServer.config }, console);
    } catch (e) {
      console.log('🛑 Starting preview server failed');
      console.error(e);
    }
  }

  async stop() {
    if (this.devServer) {
      await this.devServer.stop();
    }
  }
}
