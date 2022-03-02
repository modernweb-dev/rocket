/**
 * @param {string} htmlString
 * @returns {string}
 */
export function htmlToJsTemplate(htmlString) {
  const lines = htmlString.split('\n');
  let inServerBlock = false;
  let outputLines = [];
  let openTemplateLiteral = false;
  let needsHtmlImport = true;
  let index = 0;

  for (const line of lines) {
    if (line === '<script type="module" server>') {
      if (openTemplateLiteral) {
        outputLines[outputLines.length - 1] += '`;';
        openTemplateLiteral = false;
      }
      inServerBlock = true;
      continue;
    }
    if (inServerBlock && line === '</script>') {
      inServerBlock = false;
      continue;
    }

    if (inServerBlock) {
      outputLines.push(line);
    } else {
      if (openTemplateLiteral) {
        outputLines.push(escapeBackTick(line));
      } else {
        outputLines.push(
          `const rocketAutoConvertedTemplate${index} = html\`${escapeBackTick(line)}`,
        );
        openTemplateLiteral = true;
        index += 1;
      }
    }

    if (line.match(/import\s*{(\n|.)*html(\n|.)*}.*/gm)) {
      needsHtmlImport = false;
    }
  }

  // close potentially open last template literal
  if (openTemplateLiteral) {
    outputLines[outputLines.length - 1] += '`;';
  }

  if (needsHtmlImport) {
    outputLines.unshift("import { html } from 'lit';");
  }

  if (index === 1) {
    outputLines.push(`export default () => rocketAutoConvertedTemplate0;`);
  } else {
    const mergeTemplateLiterals = [];
    for (let count = 0; count < index; count += 1) {
      mergeTemplateLiterals.push('${rocketAutoConvertedTemplate' + count + '}');
    }
    outputLines.push(`export default () => html\`${mergeTemplateLiterals.join('')}\`;`);
  }

  return outputLines.join('\n');
}

/**
 * @param {string} content
 * @returns {string}
 */
export function getServerCodeFromHtml(content) {
  const lines = content.split('\n');
  let capture = false;
  const output = [];
  for (const line of lines) {
    if (capture && line === '</script>') {
      capture = false;
    }
    if (capture) {
      output.push(line);
    }
    if (line === '<script type="module" server>') {
      capture = true;
    }
  }
  return output.join('\n');
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeBackTick(str) {
  let isMd = true;
  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '$' && str[i + 1] === '{' && str[i - 1] !== '\\') {
      isMd = false;
    }
    if (isMd && char === '}') {
      isMd = true;
    }
    let addChar = char;
    if (isMd && char === '`') {
      addChar = '\\`';
    }
    if (isMd && char === '\\' && str[i + 1] !== '$') {
      addChar = '\\\\';
    }
    newStr += addChar;
  }
  return newStr;
}
