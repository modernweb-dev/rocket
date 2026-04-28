/* eslint-disable no-console */
import { spawn } from 'child_process';
import { watch } from 'fs';
import { debounce } from '../debounce.js';
import path from 'path';

export class RocketStart {
  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;

    program.command('start').action(async () => {
      await cli.getConfig();
      await this.start();
    });
  }

  spawnServer() {
    process.stdin.setRawMode?.(true);
    return spawn(
      'node',
      [path.join(import.meta.dirname, '../main.js'), this.cli?.configFilePath || ''],
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      },
    );
  }

  restartServer() {
    this.server?.kill();
    this.server = this.spawnServer();
    console.clear();
    console.log('Restarting rocket server...');
  }

  async start() {
    this.server = this.spawnServer();

    // watch config
    watch(
      path.join(process.cwd(), this.cli?.configFilePath || 'rocket-config.js'),
      debounce(async (_, filename) => {
        if (!filename) {
          return;
        }
        this.restartServer();
      }, 100),
    );

    // watch src
    watch(
      import.meta.dirname,
      { recursive: true },
      debounce(async (_, filename) => {
        if (!filename) {
          return;
        }
        this.restartServer();
      }, 100),
    );

    process.stdin.on('data', data => {
      const char = data.toString();
      if (char === '\u0003' || char === '\u0004') {
        // Ctrl+C or Ctrl+D
        this.server?.kill();
        process.exit(0);
      } else if (char === '\u0012') {
        // Ctrl+R
        this.restartServer();
      }
    });
    console.log('Restart the server with Ctrl+R');
  }
}
