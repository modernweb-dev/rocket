/**
 * @param {string} filePath
 * @returns {boolean}
 */
export function isRocketIndexFile(filePath) {
  return (
    filePath.endsWith('index.rocket.js') ||
    filePath.endsWith('index.rocket.md') ||
    filePath.endsWith('index.rocket.html')
  );
}
