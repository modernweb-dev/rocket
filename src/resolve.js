import path from 'path';
import { fileURLToPath } from 'url';
import { resolveProjectBrowserPackage } from './project-package-resolution.js';

/**
 * @param {string} url
 * @param {ImportMeta} meta
 * @returns {string} Absolute path to the file, relative to the output directory
 */
export function resolve(url, meta) {
  // get current directory
  const outputFilePath = process.cwd();
  const resolvedPath = resolveProjectBrowserPackage(url) ?? meta.resolve(url);
  const rel = path.relative(outputFilePath, fileURLToPath(resolvedPath));
  if (process.env.ENVIRONMENT === 'BUILD') {
    return `/../${toBrowserPath(rel)}`;
  }
  return developmentBrowserPath(rel);
}

/**
 * Web Dev Server represents files outside its root with a path that records how many parent
 * directories to traverse. Browsers normalize ordinary `/../` segments before making a request,
 * so linked packages need this explicit form.
 *
 * @param {string} relativePath
 */
function developmentBrowserPath(relativePath) {
  const parts = relativePath.split(path.sep);
  let outsideRootDepth = 0;
  while (parts[outsideRootDepth] === '..') {
    outsideRootDepth += 1;
  }
  const browserPath = parts.slice(outsideRootDepth).join('/');
  return outsideRootDepth
    ? `/__wds-outside-root__/${outsideRootDepth}/${browserPath}`
    : `/${browserPath}`;
}

/**
 * @param {string} filePath
 */
function toBrowserPath(filePath) {
  return filePath.split(path.sep).join('/');
}
