import path from 'path';
import chai from 'chai';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import { rm, writeFile, mkdir, rename } from 'fs/promises';

import { RocketCli } from '../src/RocketCli.js';
import { existsSync, readFileSync } from 'fs';
import { copy, move, remove } from 'fs-extra';

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

function formatFn(text, { format = 'html', removeEndNewLine = false } = {}) {
  let useFormat = format;
  switch (format) {
    case 'html':
      useFormat = 'html';
      break;
    case 'js':
    case 'babel':
      useFormat = 'babel';
      break;
    case 'md':
    case 'markdown':
      useFormat = 'markdown';
      break;
    default:
      useFormat = false;
  }

  if (useFormat === false) {
    return text;
  }

  let formatted = prettier.format(text, { parser: useFormat, printWidth: 100, singleQuote: true });

  // remove all empty lines for html
  if (useFormat === 'html') {
    formatted = formatted
      .split('\n')
      .filter(line => line.trim() !== '')
      .join('\n');
  }

  // remove end newline
  if (removeEndNewLine) {
    if (formatted.charAt(formatted.length - 1) === '\n') {
      formatted = formatted.substring(0, formatted.length - 1);
    }
  }

  return formatted;
}

/**
 * @param {string} text
 * @returns {string}
 */
function cleanupLitMarkersFn(text) {
  let newText = text;
  newText = newText.replace(/<!--\/?lit-part.*?-->/g, '');
  newText = newText.replace(/<!--lit-node.*?-->/g, '');
  newText = newText.replace(/<!---->/g, '');
  return newText;
}

export async function setupTestCli(cwd, cliOptions = ['build'], options = {}) {
  const resolvedCwd = path.join(__dirname, cwd.split('/').join(path.sep));
  const useOptions = { buildOptimize: false, buildAutoStop: false, ...options, cwd: resolvedCwd };
  if (useOptions.inputDir) {
    useOptions.inputDir = path.join(__dirname, useOptions.inputDir.split('/').join(path.sep));
  }
  useOptions.outputDir = path.join(resolvedCwd, '__output');
  useOptions.outputDevDir = path.join(resolvedCwd, '__output-dev');

  const cli = new RocketCli({
    argv: [process.argv[0], new URL('../src/cli.js', import.meta.url).pathname, ...cliOptions],
  });
  const configFiles = [
    'config/rocket.config.js',
    'config/rocket.config.mjs',
    'rocket.config.js',
    'rocket.config.mjs',
  ];
  for (const configFile of configFiles) {
    const configFilePath = path.join(resolvedCwd, configFile);
    if (existsSync(configFilePath)) {
      cli.options.configFile = configFilePath;
      break;
    }
  }
  cli.setOptions(useOptions);

  function readOutput(
    toInspect,
    { format = 'auto', cleanupLitMarkers = true, replaceImageHashes = false } = {},
  ) {
    const filePath = path.join(cli.options.outputDir, toInspect);
    if (!existsSync(filePath)) {
      throw new Error(`Rendering to ${toInspect} did not happen\nFull path: ${filePath}`);
    }
    let text = readFileSync(filePath).toString();
    if (cleanupLitMarkers) {
      text = cleanupLitMarkersFn(text);
    }
    if (replaceImageHashes) {
      text = text.replace(/http:\/\/my-site.com\/([a-z0-9]+)/g, 'http://my-site.com/__HASH__');
    }

    let useFormat = format === 'auto' ? toInspect.split('.').pop() : format;
    if (useFormat) {
      text = formatFn(text, { format: useFormat, removeEndNewLine: true });
    }
    return text;
  }

  function readDevOutput(toInspect, { format = 'auto', cleanupLitMarkers = true } = {}) {
    const filePath = path.join(cli.options.outputDevDir, toInspect);
    if (!existsSync(filePath)) {
      throw new Error(`Rendering to ${toInspect} did not happen\nFull path: ${filePath}`);
    }
    let text = readFileSync(filePath).toString();
    if (cleanupLitMarkers) {
      text = cleanupLitMarkersFn(text);
    }

    let useFormat = format === 'auto' ? toInspect.split('.').pop() : format;
    if (useFormat) {
      text = formatFn(text, { format: useFormat, removeEndNewLine: true });
    }
    return text;
  }

  function readSource(toInspect, { format = 'auto' } = {}) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    let text = readFileSync(filePath).toString();
    let useFormat = format === 'auto' ? toInspect.split('.').pop() : format;
    if (useFormat) {
      text = formatFn(text, { format: useFormat, removeEndNewLine: true });
    }
    return text;
  }

  async function writeSource(toInspect, text, { format = 'auto' } = {}) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    const dirName = path.dirname(filePath);
    if (!existsSync(dirName)) {
      await mkdir(dirName, { recursive: true });
    }

    let useFormat = format === 'auto' ? toInspect.split('.').pop() : format;
    if (useFormat) {
      text = formatFn(text, { format: useFormat });
    }
    await writeFile(filePath, text);
  }

  async function deleteSource(toInspect) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    await rm(filePath, { force: true, recursive: true });
  }

  async function renameSource(fromRelativePath, toRelativePath) {
    const fromPath = path.join(cli.options.inputDir, fromRelativePath);
    const toPath = path.join(cli.options.inputDir, toRelativePath);
    await rename(fromPath, toPath);
  }

  function outputExists(toInspect) {
    const filePath = path.join(cli.options.outputDir, toInspect);
    return existsSync(filePath);
  }

  function sourceExists(toInspect) {
    const filePath = path.join(cli.options.inputDir, toInspect);
    return existsSync(filePath);
  }

  async function cleanup() {
    await cli.stop({ hard: false });
  }

  async function build() {
    await cli.start();
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
    cli.watcher?.addWebSocketToPage(sourceFilePath, { send: () => undefined });
  }

  async function backupOrRestoreSource() {
    const backupDir = path.join(cli.options.inputDir, '..', '__backup');
    if (existsSync(backupDir)) {
      await restoreSource({ keepBackup: true });
    } else {
      await copy(cli.options.inputDir, backupDir);
    }
  }

  async function restoreSource({ keepBackup = false } = {}) {
    const backupDir = path.join(cli.options.inputDir, '..', '__backup');
    if (existsSync(backupDir)) {
      await remove(cli.options.inputDir);
      if (keepBackup === false) {
        await move(backupDir, cli.options.inputDir);
      } else {
        await copy(backupDir, cli.options.inputDir);
      }
    }
  }

  return {
    readOutput,
    outputExists,
    readDevOutput,
    readSource,
    build,
    writeSource,
    deleteSource,
    watch,
    cleanup,
    start,
    cli,
    setAsOpenedInBrowser,
    sourceExists,
    renameSource,
    backupOrRestoreSource,
    restoreSource,
  };
}
