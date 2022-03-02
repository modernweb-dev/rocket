import path from 'path';

/**
 * @param {string} filePath
 * @returns {string}
 */
export function stripRocketSuffix(filePath) {
  let name = path.basename(filePath);
  if (name.endsWith('.rocket.js')) {
    name = name.slice(0, -10);
  }
  if (name.endsWith('.rocket.md')) {
    name = name.slice(0, -10);
  }
  if (name.endsWith('.rocket.html')) {
    name = name.slice(0, -12);
  }
  if (name.endsWith('index')) {
    name = name.slice(0, -6);
  }

  return path.join(path.dirname(filePath), name);
}
