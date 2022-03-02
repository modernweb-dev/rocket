import path from 'path';
import chai from 'chai';
import { fileURLToPath } from 'url';
import prettier from 'prettier';
import { rm, writeFile, rename, mkdir } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';

import { Engine } from '../src/Engine.js';
import { litServerRender } from '../src/helpers/litServerRender.js';

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

export async function testLitServerRender(
  template,
  { format = false, cleanupLitMarkers = true } = {},
) {
  let text = await litServerRender(template);
  if (cleanupLitMarkers) {
    text = cleanupLitMarkersFn(text);
  }
  if (format) {
    text = formatFn(text, { format });
  }
  return text;
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

export const format = formatFn;
export const cleanupLitMarkers = cleanupLitMarkersFn;

export async function setupTestEngine(docsDir, options = {}) {
  const useOptions = { ...options, docsDir };
  if (useOptions.docsDir) {
    useOptions.docsDir = path.join(__dirname, docsDir.split('/').join(path.sep));
  }
  useOptions.outputDir = path.join(useOptions.docsDir, '..', '__output');
  useOptions.watchDir = path.join(useOptions.docsDir, '..');

  const engine = new Engine();
  engine.setOptions(useOptions);
  await engine.clearOutputDir();

  function readOutput(toInspect, { format = 'auto', cleanupLitMarkers = true } = {}) {
    const filePath = path.join(engine.outputDir, toInspect);
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
    const filePath = path.join(engine.docsDir, toInspect);
    let text = readFileSync(filePath).toString();
    let useFormat = format === 'auto' ? toInspect.split('.').pop() : format;
    if (useFormat) {
      text = formatFn(text, { format: useFormat, removeEndNewLine: true });
    }
    return text;
  }

  async function writeSource(toInspect, text, { format = 'auto' } = {}) {
    const filePath = path.join(engine.docsDir, toInspect);
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
    const filePath = path.join(engine.docsDir, toInspect);
    await rm(filePath, { force: true, recursive: true });
  }

  async function renameSource(fromRelativePath, toRelativePath) {
    const fromPath = path.join(engine.docsDir, fromRelativePath);
    const toPath = path.join(engine.docsDir, toRelativePath);
    await rename(fromPath, toPath);
  }

  function outputExists(toInspect) {
    const filePath = path.join(engine.outputDir, toInspect);
    return existsSync(filePath);
  }

  function sourceExists(toInspect) {
    const filePath = path.join(engine.docsDir, toInspect);
    return existsSync(filePath);
  }

  async function cleanup() {
    await engine.stop({ hard: false });
  }

  async function build() {
    await engine.build({ autoStop: false });
    await cleanup();
  }

  function watch() {
    engine.watch();
  }

  function start() {
    engine.start();
  }

  function setAsOpenedInBrowser(toInspect) {
    const sourceFilePath = path.join(engine.docsDir, toInspect);
    engine.watcher?.addWebSocketToPage(sourceFilePath, { send: () => undefined });
  }

  function anEngineEvent(eventName) {
    return new Promise(resolve => {
      engine.events.on(eventName, () => {
        resolve();
      });
    });
  }

  return {
    readOutput,
    outputExists,
    sourceExists,
    readSource,
    build,
    writeSource,
    deleteSource,
    watch,
    cleanup,
    start,
    engine,
    anEngineEvent,
    setAsOpenedInBrowser,
    renameSource,
  };
}
