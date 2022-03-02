/**
 * @param {string} content
 * @returns {string}
 */
export function getServerCodeFromMd(content) {
  const lines = content.split('\n');
  let capture = false;
  let shouldProcess = true;
  const output = [];
  for (const line of lines) {
    if (line.trim().startsWith('````')) {
      shouldProcess = !shouldProcess;
    }
    if (shouldProcess) {
      if (capture && line === '```') {
        capture = false;
      }
      if (capture) {
        output.push(line);
      }
      if (line === '```js server') {
        capture = true;
      }
    }
  }
  return output.join('\n');
}
