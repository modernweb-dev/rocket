export function getServerCodeFromMd(content) {
  const lines = content.split('\n');
  let capture = false;
  const output = [];
  for (const line of lines) {
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
  return output.join('\n');
}
