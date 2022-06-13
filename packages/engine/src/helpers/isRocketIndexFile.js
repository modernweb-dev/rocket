import { basename } from 'path';

/**
 * @param {string} filePath
 * @returns {boolean}
 */
export function isRocketIndexFile(filePath) {
  const fileName = basename(filePath);
  return (
    fileName === 'index.rocket.js' ||
    fileName === 'index.rocket.md' ||
    fileName === 'index.rocket.html'
  );
}
