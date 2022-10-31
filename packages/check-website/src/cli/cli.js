// TODO: support nested lists with new lines like: ${items.map(item => cli`[ ] ${item}\n`)}
// will most likely require a stateful "cli tagged template literal" that passes on the current indent level

/**
 * Tagged template literal that
 * - dedents the string
 * - removes empty first/last lines
 * - joins arrays
 *
 * @example
 *   const str = cli`
 *     Welcome ${name}!
 *     List: ${items.map(item => `[ ] ${item} `)}
 *   `;
 *   # becomes
 *   Welcome John!
 *   List: [ ] a [ ] b [ ] c
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any} values
 * @returns
 */
export function cli(strings, ...values) {
  const useStrings = typeof strings === 'string' ? [strings] : strings.raw;
  let result = '';

  for (var i = 0; i < useStrings.length; i++) {
    let currentString = useStrings[i];
    currentString
      // join lines when there is a suppressed newline
      .replace(/\\\n[ \t]*/g, '')
      // handle escaped backticks
      .replace(/\\`/g, '`');
    result += currentString;

    if (i < values.length) {
      const value = Array.isArray(values[i]) ? values[i].join('') : values[i];
      result += value;
    }
  }

  // now strip indentation
  const lines = result.split('\n');
  let minIndent = -1;
  for (const line of lines) {
    const match = line.match(/^(\s+)\S+/);
    if (match) {
      const indent = match[1].length;
      if (minIndent === -1) {
        // this is the first indented line
        minIndent = indent;
      } else {
        minIndent = Math.min(minIndent, indent);
      }
    }
  }

  let finalResult = '';
  if (minIndent !== -1) {
    for (const line of lines) {
      finalResult += line[0] === ' ' ? line.slice(minIndent) : line;
      finalResult += '\n';
    }
  }

  return (
    finalResult
      .trim()
      // handle escaped newlines at the end to ensure they don't get stripped too
      .replace(/\\n/g, '\n')
  );
}
