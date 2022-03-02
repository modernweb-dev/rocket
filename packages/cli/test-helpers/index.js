import chai from 'chai';
import { RocketCli } from '../src/RocketCli.js';
import path from 'path';
import globby from 'globby';
import fs, { move, remove } from 'fs-extra';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const { expect } = chai;

let fixtureDir = '';

export function setFixtureDir(importMetaUrl) {
  fixtureDir = path.dirname(fileURLToPath(importMetaUrl));
}

/**
 * @typedef {object} readOutputOptions
 * @property {boolean} stripToBody
 * @property {boolean} stripStartEndWhitespace
 * @property {boolean} stripScripts
 * @property {boolean} formatHtml
 * @property {boolean} replaceImageHashes
 * @property {start|build} type
 */

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

export async function readOutput(
  cli,
  fileName,
  {
    stripToBody = false,
    stripStartEndWhitespace = true,
    stripScripts = false,
    formatHtml = false,
    type = 'build',
    replaceImageHashes = false,
  } = {},
) {
  if (!cli || !cli.config) {
    throw new Error(`No valid cli provided to readOutput - you passed a ${typeof cli}: ${cli}`);
  }

  const outputDir =
    type === 'bootstrap'
      ? path.join(cli.config.outputDir, '..')
      : type === 'build'
      ? cli.config.outputDir
      : cli.config.outputDevDir;

  let text = await fs.promises.readFile(path.join(outputDir, fileName));
  text = text.toString();
  if (stripToBody) {
    const bodyOpenTagEnd = text.indexOf('>', text.indexOf('<body') + 1) + 1;
    const bodyCloseTagStart = text.indexOf('</body>');
    text = text.substring(bodyOpenTagEnd, bodyCloseTagStart);
  }
  if (stripScripts) {
    const scriptOpenTagEnd = text.indexOf('<script>');
    const scriptCloseTagStart = text.indexOf('</script>', scriptOpenTagEnd) + 9;
    text = text.substring(0, scriptOpenTagEnd) + text.substring(scriptCloseTagStart);
  }
  if (replaceImageHashes) {
    text = text.replace(/\/images\/([a-z0-9]+)-/g, '/images/__HASH__-');
  }
  if (formatHtml) {
    text = prettier.format(text, { parser: 'html', printWidth: 100 });
  }
  if (stripStartEndWhitespace) {
    text = text.trim();
  }
  return text;
}

export async function getfixtureExpectedFiles(pathToDir) {
  const cwd = path.join(fixtureDir, pathToDir);
  const paths = await globby('**/*', { cwd, absolute: true, dot: true });
  return paths;
}

export async function execute(pathToConfig, { type = 'start', captureLog = false } = {}) {
  let log = [];
  const origLog = console.log;
  if (captureLog) {
    console.log = (...args) => {
      log = [...log, ...args];
    };
  }

  const configFile = path.join(fixtureDir, pathToConfig.split('/').join(path.sep));
  const configFileDir = path.dirname(configFile);

  const cli = new RocketCli({
    argv: [type, '--config-file', configFile],
  });

  await cli.setup();
  cli.config.outputDevDir = path.join(configFileDir, '__output-dev');
  cli.config.devServer.open = false;
  cli.config.devServer.port = 8080;
  cli.config.watch = false;
  cli.config.outputDir = path.join(configFileDir, '__output');

  await fs.emptyDir(cli.config.outputDevDir);
  await fs.emptyDir(cli.config.outputDir);

  await cli.run();

  /**
   * @param {*} cli
   * @param {string} fileName
   * @param {readOutputOptions} options
   */
  async function readOutput2(fileName, options = {}) {
    options.type = type;
    return readOutput(cli, fileName, options);
  }

  function outputExists(fileName) {
    const outputDir = type === 'build' ? cli.config.outputDir : cli.config.outputDevDir;
    const filePath = path.join(outputDir, fileName);

    return fs.existsSync(filePath);
  }

  if (captureLog) {
    console.log = origLog;
  }
  return { log, readOutput: readOutput2, cli, outputExists };
}

export async function executeBootstrap(pathToDir) {
  const configFileDir = path.join(fixtureDir, pathToDir.split('/').join(path.sep));
  const cli = new RocketCli({ argv: ['bootstrap'] });

  await cli.setup();
  cli.config.outputDevDir = path.join(configFileDir, '__output-dev');
  cli.config.devServer.open = false;
  cli.config.devServer.port = 8080;
  cli.config.watch = false;
  cli.config.outputDir = path.join(configFileDir, '__output');

  await fs.emptyDir(configFileDir);
  await cli.run();

  return { cli };
}

export async function executeUpgrade(pathToConfig) {
  const configFile = path.join(fixtureDir, pathToConfig.split('/').join(path.sep));
  const cli = new RocketCli({
    argv: ['upgrade', '--config-file', configFile],
  });
  await cli.setup();

  // restore from backup if available - in cases the test did stop in the middle
  if (cli.config._inputDirCwdRelative) {
    const backupDir = path.join(cli.config._inputDirCwdRelative, '..', 'docs_backup');
    if (existsSync(backupDir)) {
      await remove(cli.config._inputDirCwdRelative);
      await move(backupDir, cli.config._inputDirCwdRelative);
    }
  }
  await cli.run();
  return {
    cli,
    fileExists: fileName => {
      const outputDir = cli.config._inputDirCwdRelative;
      return fs.existsSync(path.join(outputDir, fileName));
    },
    readFile: async fileName => {
      // TODO: use readOutput once it's changed to read full file paths
      const filePath = path.join(cli.config._inputDirCwdRelative, fileName);
      const text = await fs.promises.readFile(filePath);
      return text.toString();
    },
  };
}

export function trimWhiteSpace(inString) {
  return inString
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n');
}
