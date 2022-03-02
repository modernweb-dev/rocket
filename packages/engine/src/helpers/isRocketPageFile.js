/**
 * @param {string} filePath
 * @returns {boolean}
 */
export function isRocketPageFile(filePath) {
  return (
    filePath.endsWith('.rocket.js') ||
    filePath.endsWith('.rocket.md') ||
    filePath.endsWith('.rocket.html')
  );
}
