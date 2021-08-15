/* eslint-disable @typescript-eslint/ban-ts-comment */
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import TreeModel from 'tree-model';
import path from 'path';
import { parseHtmlFile } from './parseHtmlFile.js';

/** @typedef {import('../types/main').Page} Page */
/** @typedef {import('../types/main').ParseMetaData} ParseMetaData */

/**
 * @param {Page} a
 * @param {Page} b
 * @returns
 */
export function modelComparatorFn(a, b) {
  const aOrder = a.order || 0;
  const bOrder = b.order || 0;
  return aOrder > bOrder;
}

const tree = new TreeModel({
  modelComparatorFn,
});

/** @type {string} */
let initialRootDir;

/**
 * @param {ParseMetaData} metaData
 * @returns {ParseMetaData}
 */
function processTocElements(metaData) {
  let node;
  let currentLevel = 0;
  if (metaData.__tocElements && metaData.__tocElements.length > 0) {
    for (const tocElement of metaData.__tocElements) {
      const { id, text, level } = tocElement;
      const child = tree.parse({
        name: text,
        url: `#${id}`,
        level,
      });
      if (node) {
        if (level <= currentLevel) {
          node = node
            .getPath()
            .reverse()
            .find(n => n.model.level < child.model.level);
        }
        if (!node) {
          throw new Error(`Could not find an h1 in "${metaData.relPath}"`);
        }
        if (node) {
          node.addChild(child);
        }
      }
      currentLevel = level;
      node = child;
    }
  }

  delete metaData.__tocElements;
  const root = node?.getPath()[0];
  if (root) {
    metaData.tableOfContentsNode = root;
  }
  return metaData;
}

/**
 *
 * @param {object} process
 * @param {string} process.filePath
 * @param {string} process.rootDir
 * @param {TreeModel.Node<Page>} [process.currentNode]
 * @param {boolean} [process.recursive]
 * @param {object} options
 * @param {string} [options.mode]
 * @param {number} [options.level]
 * @param {string} [options.url]
 * @returns
 */
async function processFile({ filePath, rootDir, currentNode, recursive = false }, options) {
  if (filePath && existsSync(filePath)) {
    const { level = 0, url = '/' } = options;

    const metaData = await parseHtmlFile(filePath, { rootDir: initialRootDir });
    if (!metaData.exclude) {
      const treeEntry = tree.parse({ level, url, ...processTocElements(metaData) });
      if (currentNode) {
        currentNode.addChild(treeEntry);
      } else {
        currentNode = treeEntry;
      }
      if (recursive) {
        await buildTree(rootDir, treeEntry, { ...options, level: level + 1, mode: 'scan' });
      }
    }
  }
  return currentNode;
}

/**
 * @param {string} inRootDir
 * @param {TreeModel.Node<Page>} [node]
 * @param {object} [options]
 * @param {string} [options.mode]
 * @param {number} [options.level]
 * @param {string} [options.url]
 * @returns
 */
export async function buildTree(inRootDir, node, options = {}) {
  const { mode = 'indexFile', level = 0, url = '/' } = options;
  const rootDir = path.resolve(inRootDir);
  if (level === 0) {
    initialRootDir = rootDir;
  }
  let currentNode = node;

  if (mode === 'indexFile') {
    const indexFilePath = path.join(rootDir, 'index.html');
    currentNode = await processFile(
      { filePath: indexFilePath, rootDir, currentNode, recursive: true },
      options,
    );
  }

  if (mode === 'scan') {
    const entries = await readdir(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      const { name: folderName } = entry;
      const currentPath = path.join(rootDir, folderName);
      if (entry.isDirectory()) {
        await buildTree(currentPath, currentNode, {
          ...options,
          level,
          url: `${url}${folderName}/`,
          mode: 'indexFile',
        });
      } else if (entry.name !== 'index.html' && entry.name.endsWith('.html')) {
        const filePath = path.join(rootDir, entry.name);
        currentNode = await processFile(
          { filePath, rootDir, currentNode },
          { ...options, url: `${url}${entry.name}` },
        );
      }
    }
  }
  return currentNode;
}
