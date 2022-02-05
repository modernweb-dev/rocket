import { mdjsProcess } from '@mdjs/core';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { addPlugin } from 'plugins-manager';
import markdown from 'remark-parse';

export function mdToMdInJs(mdString) {
  const lines = mdString.split('\n');
  let inCodeBlock = false;
  let inServerBlock = false;
  let shouldProcess = true;
  let serverBlockContent = [];

  let processedLines = [];
  for (const line of lines) {
    let addServerLine = true;
    if (line.trim().startsWith('`````')) {
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

  // const mdImport = needsHtmlImport ? [`import { html } from 'lit-html';`] : [];
  const wrappedLines = [
    // ...mdImport,
    'const rocketAutoConvertedMdText = [];',
    ...processedLines,
    `export default rocketAutoConvertedMdText.join('\\n');`,
  ];

  return wrappedLines.join('\n');
}

export async function mdInJsToMdHtmlInJs(toImportFilePath) {
  const { default: content, ...data } = await import(toImportFilePath);

  const options = {
    setupUnifiedPlugins: [addPlugin(serverCodeParse, {}, { location: markdown })],
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
      '.rocketGeneratedMdInJs.js',
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

  return [mdjs.html, ...mdjsScriptTag].join('\n');
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
    outputLines.unshift("import { html } from 'lit-html';");
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

/* eslint-disable @typescript-eslint/ban-ts-comment */
/** @typedef {import('@mdjs/core/types/code').Story} Story */
/** @typedef {import('@mdjs/core/types/code').StoryTypes} StoryTypes */
/** @typedef {(name: string) => string} TagFunction */
/** @typedef {import('unist').Node} UnistNode */
/** @typedef {import('unist').Parent} UnistParent */
/** @typedef {import('vfile').VFileOptions} VFileOptions */

import visit from 'unist-util-visit';

/**
 * @param {object} arg
 * @param {TagFunction} [arg.storyTag]
 * @param {TagFunction} [arg.previewStoryTag]
 * @param {number} [arg.counter]
 */
export function serverCodeParse() {
  /**
   * @param {UnistNode} node
   * @param {number} index
   * @param {UnistParent} parent
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
   * @param {Node} tree
   * @param {VFileOptions} file
   */
  async function transformer(tree, file) {
    // @ts-ignore
    visit(tree, nodeCodeVisitor);

    return tree;
  }

  return transformer;
  /* eslint-enable no-param-reassign */
}
