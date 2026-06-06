/* eslint-disable no-console */
import { spawn } from 'child_process';
import { watch } from 'fs';
import { debounce } from '../debounce.js';
import path from 'path';

export class RocketStart {
  /** @type {RocketStartOptions} */
  startOptions = {};

  /**
   * @param {import('commander').Command} program
   * @param {import('./RocketCli.js').RocketCli} cli
   */
  async setupCommand(program, cli) {
    this.cli = cli;

    program
      .command('start')
      .option('-p, --port <port>', 'port for the development server')
      .option('--no-open', 'do not open the browser')
      .option('--no-watch', 'disable automatic file watching and reloads')
      .action(async options => {
        const startOptions = normalizeStartOptions(options);
        await cli.getConfig();
        await this.start(startOptions);
      });
  }

  /**
   * @param {RocketStartOptions} [options]
   */
  spawnServer(options = {}) {
    process.stdin.setRawMode?.(true);
    return spawn(
      'node',
      startServerArgs({
        configFilePath: this.cli?.configFilePath,
        options,
      }),
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      },
    );
  }

  restartServer() {
    this.server?.kill();
    this.server = this.spawnServer(this.startOptions);
    console.clear();
    console.log('Restarting rocket server...');
  }

  /**
   * @param {RocketStartOptions} [options]
   */
  async start(options = {}) {
    this.startOptions = options;
    this.server = this.spawnServer(options);

    if (options.watch !== false) {
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
    }

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

/**
 * @typedef {{ port?: number; open?: boolean; watch?: boolean }} RocketStartOptions
 */

/**
 * @param {{ port?: string; open?: boolean; watch?: boolean }} options
 * @returns {RocketStartOptions}
 */
export function normalizeStartOptions(options) {
  return {
    ...(options.port !== undefined ? { port: parsePortOption(options.port) } : {}),
    ...(options.open !== undefined ? { open: options.open } : {}),
    ...(options.watch !== undefined ? { watch: options.watch } : {}),
  };
}

/**
 * @param {{ configFilePath?: string; options?: RocketStartOptions }} input
 */
export function startServerArgs({ configFilePath, options = {} }) {
  return [
    path.join(import.meta.dirname, '../main.js'),
    configFilePath || '',
    JSON.stringify(options),
  ];
}

/**
 * @param {string} value
 */
function parsePortOption(value) {
  if (!/^\d+$/.test(value)) {
    throw new Error(
      `Invalid --port ${JSON.stringify(value)}. Expected an integer from 1 to 65535.`,
    );
  }
  const port = Number(value);
  if (port < 1 || port > 65535) {
    throw new Error(
      `Invalid --port ${JSON.stringify(value)}. Expected an integer from 1 to 65535.`,
    );
  }
  return port;
}
