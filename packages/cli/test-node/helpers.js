import chai from 'chai';
import { RocketCli } from '../src/RocketCli.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { expect } = chai;

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
  { stripToBody = false, stripStartEndWhitespace = true, type = 'build' } = {},
) {
  const outputDir = type === 'build' ? cli.config.outputDir : cli.config.outputDevDir;
  let text = await fs.promises.readFile(path.join(outputDir, fileName));
  text = text.toString();
  if (stripToBody) {
    const bodyOpenTagEnd = text.indexOf('>', text.indexOf('<body') + 1) + 1;
    const bodyCloseTagStart = text.indexOf('</body>');
    text = text.substring(bodyOpenTagEnd, bodyCloseTagStart);
  }
  if (stripStartEndWhitespace) {
    text = text.trim();
  }
  return text;
}

export async function readStartOutput(cli, fileName, options = {}) {
  options.type = 'start';
  return readOutput(cli, fileName, options);
}

export async function execute(cli, configFileDir) {
  await cli.setup();
  cli.config.outputDevDir = path.join(configFileDir, '__output-dev');
  cli.config.devServer.open = false;
  cli.config.watch = false;
  cli.config.outputDir = path.join(configFileDir, '__output');
  await cli.run();
  return cli;
}

export async function executeStart(pathToConfig) {
  const configFile = path.join(__dirname, pathToConfig.split('/').join(path.sep));
  const cli = new RocketCli({
    argv: ['start', '--config-file', configFile],
  });
  await execute(cli, path.dirname(configFile));
  return cli;
}

export async function executeLint(pathToConfig) {
  const configFile = path.join(__dirname, pathToConfig.split('/').join(path.sep));
  const cli = new RocketCli({
    argv: ['lint', '--config-file', configFile],
  });
  await execute(cli, path.dirname(configFile));
  return cli;
}

export function trimWhiteSpace(inString) {
  return inString
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n');
}
