import path from 'path';
import { fileURLToPath } from 'url';

import { CheckWebsiteCli } from 'check-website';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 *
 * @param {string} rawInputDir
 * @param {import('../types/main.js').CheckWebsiteCliOptions} options
 * @param {{ captureLogs?: boolean }} testOptions
 * @returns
 */
export async function setupTestCli(rawInputDir, options = {}, testOptions = {}) {
  /** @type {string[]} */
  const capturedLogs = [];
  const origLog = console.log;
  const origError = console.error;
  const origStderr = {
    getWindowSize: process.stderr.getWindowSize,
    moveCursor: process.stderr.moveCursor,
    cursorTo: process.stderr.cursorTo,
    clearLine: process.stderr.clearLine,
    clearScreenDown: process.stderr.clearScreenDown,
  };
  if (testOptions.captureLogs) {
    console.log = msg => {
      capturedLogs.push(msg);
    };
    console.error = msg => {
      capturedLogs.push(msg);
    };
    process.stderr.getWindowSize = () => [80, 24];
    process.stderr.moveCursor = () => true;
    process.stderr.cursorTo = () => true;
    process.stderr.clearLine = () => true;
    process.stderr.clearScreenDown = () => true;
  }

  const cli = new CheckWebsiteCli();
  const inputDir = path.join(__dirname, rawInputDir.split('/').join(path.sep));

  const configFilePath = path.join(inputDir, '..', 'config', 'check-website.config.js');
  if (existsSync(configFilePath)) {
    cli.options.configFile = configFilePath;
  }

  cli.setOptions({
    inputDir,
    ...options,
  });

  async function cleanup() {
    // await cli.stop({ hard: false });
    if (testOptions.captureLogs) {
      console.log = origLog;
      console.error = origError;
      process.stderr.getWindowSize = origStderr.getWindowSize;
      process.stderr.moveCursor = origStderr.moveCursor;
      process.stderr.cursorTo = origStderr.cursorTo;
      process.stderr.clearLine = origStderr.clearLine;
      process.stderr.clearScreenDown = origStderr.clearScreenDown;
    }
  }

  async function execute() {
    cli.execute();
    await new Promise(resolve => cli.events.once('done', resolve));
    await cleanup();
  }

  return {
    cli,
    cleanup,
    capturedLogs,
    execute,
  };
}
