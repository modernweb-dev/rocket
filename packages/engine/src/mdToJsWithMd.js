import { mdjsProcess } from '@mdjs/core';

/**
 * @param {string} str
 * @returns {string}
 */
function escapeBackTick(str) {
  return str.replace(/'/g, "\\'");

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

/**
 * @param {string} mdString
 * @returns {string}
 */
export async function mdToJsWithMd(mdString) {
  const options = {};
  if (data.setupUnifiedPlugins) {
    options.setupUnifiedPlugins = data.setupUnifiedPlugins;
  }
  const mdjs = await mdjsProcess(content, options);

  /** @type String[] */
  let mdjsScriptTag = [];
  if (mdjs.jsCode) {
    const mdjsFileName = `${path.basename(filePath, '.rocket.md')}-mdjs-generated.js`;
    const mdjsFilePath = path.join(path.dirname(filePath), mdjsFileName);
    if (existsSync(mdjsFilePath)) {
      const originalContent = await readFile(mdjsFilePath, 'utf8');
      if (originalContent.toString() !== mdjs.html) {
        await writeFile(mdjsFilePath, mdjs.jsCode, 'utf8');
      }
    } else {
      await writeFile(mdjsFilePath, mdjs.jsCode, 'utf8');
    }
    mdjsScriptTag = [`<script type="module" src="./${mdjsFileName}" mdjs-setup></script>`];
  }

  const lines = mdString.split('\n');
  let inCodeBlock = false;
  let inServerBlock = false;
  let inServerMarkdownBlock = false;
  let shouldProcess = true;
  let needsHtmlImport = true;

  const templateLines = [];

  let mdStringOut = '';

  const processedLines = [];
  for (const line of lines) {
    let addLine = true;
    if (line.trim().startsWith('`````')) {
      shouldProcess = !shouldProcess;
    }

    if (shouldProcess) {
      if (line.trim().startsWith('```') && line[3] !== '`') {
        inCodeBlock = true;
      }

      if (line.trim() === '```js server') {
        inServerBlock = true;
        addLine = false;
      }
      if (line.trim() === '```js server-markdown') {
        inServerMarkdownBlock = true;
        addLine = false;
      }

      if (inServerBlock && line.trim() === '```') {
        inServerBlock = false;
        addLine = false;
      }
      if (inServerMarkdownBlock && line.trim() === '```') {
        inServerMarkdownBlock = false;
        addLine = false;
      }
      if (
        inServerBlock === false &&
        inServerMarkdownBlock === false &&
        inCodeBlock &&
        line.trim() === '```'
      ) {
        inCodeBlock = false;
      }

      if (addLine) {
        if (inServerBlock) {
          processedLines.push(line);
        } else {
          let processedLine = line;
          if (inCodeBlock && inServerMarkdownBlock === false) {
            processedLine = processedLine.replace(/\$/g, '\\$');
          }
          processedLine = escapeBackTick(processedLine);

          processedLines.push(
            `const rocketAutoConvertedMdText${templateLines.length} = html\`${processedLine}\`;`,
          );
          templateLines.push(
            `const rocketAutoConvertedMdText${templateLines.length} = html\`${processedLine}\`;`,
          );
          mdStringOut += processedLine;
        }
      }
    } else {
      mdStringOut += line;
      processedLines.push(
        `const rocketAutoConvertedMdText${templateLines.length} = html\`${escapeBackTick(line)}\`;`,
      );
      templateLines.push(
        `const rocketAutoConvertedMdText${templateLines.length} = html\`${escapeBackTick(line)}\`;`,
      );
    }

    // if (line.match(/import\s*{(\n|.)*md(\n|.)*}.*@rocket\/engine/gm)) {
    //   needsMdImport = false;
    // }
  }

  console.log({ mdStringOut });

  const finishedTemplate = templateLines.map(
    (line, index) => '${rocketAutoConvertedMdText' + index + '}',
  );

  const mdImport = needsHtmlImport ? [`import { html } from 'lit-html';`] : [];
  const wrappedLines = [
    ...mdImport,
    ...processedLines,
    `export default () => html\`${finishedTemplate}\`;`,
  ];

  return wrappedLines.join('\n');
}
