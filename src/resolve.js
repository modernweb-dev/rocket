import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @param {string} url
 * @param {ImportMeta} meta
 * @returns {string} Absolute path to the file, relative to the output directory
 */
export function resolve(url, meta) {
  // get current directory
  const outputFilePath = process.cwd();
  const resolvedPath = meta.resolve(url);
  const rel = path.relative(outputFilePath, fileURLToPath(resolvedPath));
  return (process.env.ENVIRONMENT === 'BUILD' ? '/../' : '/') + rel.split(path.sep).join('/');
}
