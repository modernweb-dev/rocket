import path from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';

import { buildTree } from '@web/menu';
import { parseHtmlFile } from '../src/parseHtmlFile.js';
import { WebMenuCli } from '../src/WebMenuCli.js';
import { readFileSync } from 'fs';
export { modelComparatorFn } from '../src/buildTree.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function executeBuildTree(inPath, opts) {
  const testDir = path.join(__dirname, inPath.split('/').join(path.sep));
  const tree = await buildTree(testDir, opts);
  return tree;
}

export function cleanup(tree, filter = key => ['fileString', 'menus'].includes(key)) {
  for (const key of Object.keys(tree)) {
    if (key === 'model') {
      for (const modelKey of Object.keys(tree.model)) {
        if (filter(modelKey)) {
          delete tree.model[modelKey];
        }
      }
    }
    if (key === 'children') {
      tree.children = tree.children.map(child => cleanup(child));
    }
    if (filter(key)) {
      delete tree[key];
    }
  }
  return tree;
}

export async function executeParse(inPath, opts = {}) {
  const testFile = path.join(__dirname, inPath.split('/').join(path.sep));
  opts.rootDir = opts.rootDir
    ? path.join(__dirname, opts.rootDir.split('/').join(path.sep))
    : path.dirname(testFile);
  const metaData = await parseHtmlFile(testFile, opts);
  return metaData;
}

/**
 *
 * @param {object} [engineOptions]
 * @param {string} [engineOptions.docsDir]
 * @param {string} [engineOptions.configFile]
 * @param {object} [executeOptions]
 * @param {boolean} [executeOptions.captureLog]
 * @returns
 */
export async function executeCli({ docsDir, configFile } = {}, { captureLog = false } = {}) {
  const options = { docsDir, configFile };
  if (docsDir) {
    options.docsDir = path.join(__dirname, docsDir.split('/').join(path.sep));
  }
  if (configFile) {
    options.configFile = path.join(__dirname, configFile.split('/').join(path.sep));
  }

  /** @type {string[]} */
  let log = [];
  const origLog = console.log;
  if (captureLog) {
    console.log = (...args) => {
      log = [...log, ...args];
    };
  }

  const cli = new WebMenuCli();
  cli.setOptions(options);
  await cli.run();

  /**
   * @param {string} toInspect
   * @returns {string}
   */
  function readOutput(toInspect) {
    const filePath = path.join(cli.outputDir, toInspect);
    let text = readFileSync(filePath).toString();
    text = formatHtml(text);
    return text;
  }

  if (captureLog) {
    console.log = origLog;
  }
  return { log, readOutput };
}

/**
 * @param {string} str
 * @returns {string}
 */
export function formatHtml(str) {
  return prettier.format(str, {
    parser: 'html',
    singleQuote: true,
    arrowParens: 'avoid',
    printWidth: 100,
    trailingComma: 'all',
  });
}
