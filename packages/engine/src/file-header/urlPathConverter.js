import path from 'path';
import { gatherFiles } from '../gatherFiles.js';

/**
 * @param {string} url
 * @param {string} rootDir
 * @returns {Promise<string | undefined>}
 */
export async function urlToSourceRelativeFilePath(url, rootDir) {
  const sourceFilePath = await urlToSourceFilePath(url, rootDir);
  if (sourceFilePath) {
    return path.relative(rootDir, sourceFilePath);
  }
}

/**
 *
 * @param {string} url
 * @param {string} rootDir
 * @returns {Promise<string | undefined>}
 */
export async function urlToSourceFilePath(url, rootDir) {
  const sourceFiles = await gatherFiles(rootDir);
  const urlToFileMap = new Map();

  for (const sourceFilePath of sourceFiles) {
    const sourceRelativeFilePath = path.relative(rootDir, sourceFilePath);
    const url = sourceRelativeFilePathToUrl(sourceRelativeFilePath);
    urlToFileMap.set(url, sourceFilePath);
  }

  if (urlToFileMap.has(url)) {
    return urlToFileMap.get(url);
  }

  // throw new Error(`Could not find source file for url: ${url}`);
}

/**
 * @param {string} name
 * @returns {string}
 */
function cleanOrder(name) {
  let newName = name;
  const matches = name.match(/^[0-9]+--(.*)$/);
  if (matches && matches.length > 1 && matches[1]) {
    newName = matches[1];
  }

  return newName;
}

/**
 * @param {string} relPath
 * @returns {string}
 */
export function sourceRelativeFilePathToOutputRelativeFilePath(relPath) {
  const basename = path.basename(relPath);
  const rawDirname = path.dirname(relPath);

  const dirname = rawDirname
    .split('/')
    .map(part => cleanOrder(part))
    .join('/');

  let name = basename;
  for (const ending of ['.rocket.js', '.rocket.md', '.rocket.html']) {
    name = name.endsWith(ending) ? name.substring(0, name.length - ending.length) : name;
  }

  name = cleanOrder(name);

  if (relPath.endsWith('.js') && name.includes('.')) {
    return path.join(dirname, name);
  }

  return name === 'index'
    ? path.join(dirname, 'index.html')
    : path.join(dirname, name, 'index.html');
}

/**
 *
 * @param {string} sourceRelativeFilePath
 * @returns
 */
export function sourceRelativeFilePathToUrl(sourceRelativeFilePath) {
  const outputRelativeFilePath =
    sourceRelativeFilePathToOutputRelativeFilePath(sourceRelativeFilePath);

  return outputRelativeFilePath.endsWith('index.html')
    ? `/${outputRelativeFilePath.substring(0, outputRelativeFilePath.length - 'index.html'.length)}`
    : `/${outputRelativeFilePath}`;
}
