// we need to load the global-dom-shim as otherwise import { html } from 'lit'; breaks
// https://github.com/lit/lit/issues/2524
import '@lit-labs/ssr/lib/install-global-dom-shim.js';

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { mdjsProcess } from '@mdjs/core';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { addPlugin } from 'plugins-manager';
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';

/**
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const REGEX_REPLACE_ESCAPES = new RegExp(
  escapeRegExp(
    '\\\\<span class="token interpolation"><span class="token interpolation-punctuation punctuation">${</span>',
  ),
  'g',
);

/**
 * @param {string} mdString
 * @returns {string}
 */
export function mdToMdInJs(mdString) {
  const lines = mdString.split('\n');
  let inCodeBlock = false;
  let inServerBlock = false;
  let shouldProcess = true;
  let serverBlockContent = [];

  /** @type {string[]} */
  let processedLines = [];
  for (const line of lines) {
    let addServerLine = true;
    if (line.trim().startsWith('````')) {
      shouldProcess = !shouldProcess;
    }

    if (shouldProcess) {
      if (line.trim().startsWith('```') && line[3] !== '`') {
        inCodeBlock = true;
      }

      if (line.trim() === '```js server') {
        inServerBlock = true;
        addServerLine = false;
      }

      if (inServerBlock && line.trim() === '```') {
        const escapedServerBlockContent = serverBlockContent.map(
          line => `rocketAutoConvertedMdText.push("${line.replace(/"/g, '\\"')}");`,
        );
        processedLines = [...processedLines, ...escapedServerBlockContent];
        inServerBlock = false;
        addServerLine = false;
        serverBlockContent = [];
      }
      if (inServerBlock === false && inCodeBlock && line.trim() === '```') {
        inCodeBlock = false;
      }

      if (inServerBlock) {
        serverBlockContent.push(line);
        if (addServerLine) {
          processedLines.push(line);
        }
      } else {
        let processedLine = line;
        if (inCodeBlock) {
          processedLine = processedLine.replace(/\$/g, '\\$');
        }
        processedLine = processedLine.replace(/\\/g, '\\\\');
        processedLine = processedLine.replace(/"/g, '\\"'); // escapeBackTick(processedLine);

        processedLines.push(`rocketAutoConvertedMdText.push("${processedLine}");`);
      }
    } else {
      processedLines.push(`rocketAutoConvertedMdText.push("${line.replace(/"/g, '\\"')}");`);
    }

    // if (line.match(/import\s*{(\n|.)*md(\n|.)*}.*@rocket\/engine/gm)) {
    //   needsMdImport = false;
    // }
  }

  // const mdImport = needsHtmlImport ? [`import { html } from 'lit';`] : [];
  const wrappedLines = [
    // ...mdImport,
    'const rocketAutoConvertedMdText = [];',
    ...processedLines,
    `export default rocketAutoConvertedMdText.join('\\n');`,
  ];

  return wrappedLines.join('\n');
}

/**
 * @param {string} toImportFilePath
 * @returns {Promise<string>}
 */
export async function mdInJsToMdHtmlInJs(toImportFilePath) {
  // TODO: move this whole function into a worker - so we do not need to load the dom shim into the main thread
  const { default: content, ...data } = await import(toImportFilePath);

  const options = {
    setupUnifiedPlugins: [addPlugin(serverCodeParse, undefined, { location: markdown })],
  };
  if (data.setupUnifiedPlugins) {
    options.setupUnifiedPlugins = [...options.setupUnifiedPlugins, ...data.setupUnifiedPlugins];
  }
  const mdjs = await mdjsProcess(content, options);

  /** @type String[] */
  let mdjsScriptTag = [];
  if (mdjs.jsCode) {
    const mdjsFileName = `${path.basename(
      toImportFilePath,
      '-converted-md-source.js',
    )}-mdjs-generated.js`;
    const mdjsFilePath = path.join(path.dirname(toImportFilePath), mdjsFileName);
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

  let mdHTML = mdjs.html;
  // in a js code block that gets highlighted it puts a some html between ${ and the escaping backslash
  // "\${" becomes "\\<span>...</span>${"
  // this corrects it - escaped
  mdHTML = mdHTML.replace(
    REGEX_REPLACE_ESCAPES,
    '<span class="token interpolation"><span class="token interpolation-punctuation punctuation">\\\\${</span>',
  );
  return [mdHTML, ...mdjsScriptTag].join('\n');
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

/**
 * @param {string} mdHtml
 * @returns {string}
 */
export function mdHtmlToJsTemplate(mdHtml) {
  const lines = mdHtml.split('\n');
  let inServerBlock = false;
  let outputLines = [];
  let openTemplateLiteral = false;
  let needsHtmlImport = true;
  let index = 0;

  for (const line of lines) {
    if (line === '<server-code>') {
      if (openTemplateLiteral) {
        outputLines[outputLines.length - 1] += '`;';
        openTemplateLiteral = false;
      }
      inServerBlock = true;
      continue;
    }
    if (line === '</server-code>') {
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

export function serverCodeParse() {
  /**
   * @param {{ type: string; lang: string; meta: string; value: string; children: Array<{ value: string }>}} node
   */
  const nodeCodeVisitor = (node /*, index, parent*/) => {
    if (
      node.type === 'code' &&
      node.lang === 'js' &&
      node.meta === 'server' &&
      typeof node.value === 'string'
    ) {
      node.type = 'html';
      node.value = `<server-code>\n${node.value}\n</server-code>`;
    }

    if (
      node.type === 'paragraph' &&
      node.children &&
      node.children[0] &&
      node.children[0].value &&
      node.children[0].value.startsWith('${')
    ) {
      node.type = 'html';
      node.value = node.children[0].value;
      node.children = [];
    }
  };

  /**
   * @param {{ type: string; lang: string; meta: string; value: string; children: Array<{ value: string }>}} tree
   */
  async function transformer(tree) {
    // @ts-ignore
    visit(tree, nodeCodeVisitor);
    return tree;
  }

  return transformer;
}
