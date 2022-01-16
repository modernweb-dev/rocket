import path from 'path';
import chai from 'chai';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import { rm, writeFile } from 'fs/promises';

import { RocketCli } from '../src/RocketCli.js';
import { existsSync, readFileSync } from 'fs';

const { expect } = chai;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {function} method
 * @param {string} errorMessage
 */
export async function expectThrowsAsync(method, { errorMatch, errorMessage } = {}) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error', 'No error was thrown');
  if (errorMatch) {
    expect(error.message).to.match(errorMatch);
  }
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}

export async function setupTestCli(inputDir, options = {}) {
  const useOptions = { ...options, inputDir };
  if (useOptions.inputDir) {
    useOptions.inputDir = path.join(__dirname, inputDir.split('/').join(path.sep));
  }
  useOptions.outputDir = path.join(useOptions.inputDir, '..', '__output');

  const cli = new RocketCli();
  cli.setOptions(useOptions);
  await cli.clearOutputDir();

  function readOutput(toInspect, { format = false } = {}) {
    const filePath = path.join(cli.options.outputDir, toInspect);
    let text = readFileSync(filePath).toString();
    if (format) {
      text = prettier.format(text, { parser: format, printWidth: 100 });
    }
    return text;
  }

  function readSource(toInspect, { format = false } = {}) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    let text = readFileSync(filePath).toString();
    if (format) {
      text = prettier.format(text, { parser: format, printWidth: 100 });
    }
    return text;
  }

  async function writeSource(toInspect, text) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    await writeFile(filePath, text);
  }

  async function deleteSource(toInspect) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    await rm(filePath, { force: true });
  }

  function outputExists(toInspect) {
    const filePath = path.join(cli.outputDir, toInspect);
    return existsSync(filePath);
  }

  async function cleanup() {
    await cli.cleanup();
  }

  async function build() {
    await cli.build();
    await cleanup();
  }

  function watch() {
    cli.watch();
  }

  function start() {
    cli.start();
  }

  function setAsOpenedInBrowser(toInspect) {
    const sourceFilePath = path.join(cli.options.inputDir, toInspect);
    cli.watcher?.addWebSocketToPage(sourceFilePath, { send: () => {} });
  }

  function anEngineEvent(eventName) {
    return new Promise((resolve, reject) => {
      cli.events.on(eventName, () => {
        resolve();
      });
    });
  }

  return {
    readOutput,
    outputExists,
    readSource,
    build,
    writeSource,
    deleteSource,
    watch,
    cleanup,
    start,
    cli,
    anEngineEvent,
    setAsOpenedInBrowser,
  };
}
