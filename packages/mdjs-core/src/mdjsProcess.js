/* eslint-disable @typescript-eslint/ban-ts-comment */
/** @typedef {import('@mdjs/core/types/code').Story} Story */
/** @typedef {import('@mdjs/core/types/code').ParseResult} ParseResult */
/** @typedef {import('@mdjs/core/types/code').ProcessResult} ProcessResult */
/** @typedef {import('@mdjs/core/types/code').MdjsProcessPlugin} MdjsProcessPlugin */

const unified = require('unified');
const markdown = require('remark-parse');
const gfm = require('remark-gfm');
const remark2rehype = require('remark-rehype');
const raw = require('rehype-raw');
const htmlStringify = require('rehype-stringify');
const htmlSlug = require('rehype-slug');
const htmlHeading = require('rehype-autolink-headings');
const rehypePrism = require('rehype-prism-template');
// @ts-ignore
const { executeSetupFunctions } = require('plugins-manager');

const { mdjsParse } = require('./mdjsParse.js');
const { mdjsStoryParse } = require('./mdjsStoryParse.js');
const { mdjsSetupCode } = require('./mdjsSetupCode.js');

/** @type {MdjsProcessPlugin[]} */
const defaultMetaPlugins = [
  { name: 'markdown', plugin: markdown },
  { name: 'gfm', plugin: gfm },
  { name: 'mdjsParse', plugin: mdjsParse },
  { name: 'mdjsStoryParse', plugin: mdjsStoryParse },
  { name: 'mdjsSetupCode', plugin: mdjsSetupCode },
  // @ts-ignore
  { name: 'remark2rehype', plugin: remark2rehype, options: { allowDangerousHtml: true } },
  // @ts-ignore
  { name: 'rehypePrism', plugin: rehypePrism },
  // @ts-ignore
  { name: 'raw', plugin: raw },
  // @ts-ignore
  { name: 'htmlSlug', plugin: htmlSlug },
  // @ts-ignore
  { name: 'htmlHeading', plugin: htmlHeading },
  // @ts-ignore
  { name: 'htmlStringify', plugin: htmlStringify },
];

/**
 * Processes mdjs to html/js/stories
 *
 * Js code includes the linking between js and stories
 *
 * @param {string} mdjs
 * @param {object} options
 * @param {string} [options.rootNodeQueryCode]
 * @param {function[]} [options.setupUnifiedPlugins]
 * @param {MdjsProcessPlugin[]} [options.plugins] deprecated option use setupUnifiedPlugins instead
 */
async function mdjsProcess(mdjs, { setupUnifiedPlugins = [] } = {}) {
  const parser = unified();

  const metaPlugins = executeSetupFunctions(setupUnifiedPlugins, defaultMetaPlugins);

  /**
   * @param {string} code
   */
  async function highlightCode(code) {
    // @ts-ignore
    const codePlugins = metaPlugins.filter(pluginObj =>
      ['markdown', 'remark2rehype', 'rehypePrism', 'htmlStringify'].includes(pluginObj.name),
    );
    const codeParser = unified();
    // @ts-ignore
    for (const pluginObj of codePlugins) {
      codeParser.use(pluginObj.plugin, pluginObj.options);
    }
    const codeResult = await codeParser.process(code);
    return codeResult.contents;
  }

  // @ts-ignore
  for (const pluginObj of metaPlugins) {
    if (pluginObj.name === 'mdjsSetupCode') {
      if (pluginObj.options && !pluginObj.options.highlightCode) {
        pluginObj.options.highlightCode = highlightCode;
      }
      if (!pluginObj.options) {
        pluginObj.options = { highlightCode };
      }
    }
    parser.use(pluginObj.plugin, pluginObj.options);
  }

  /** @type {unknown} */
  const parseResult = await parser.process(mdjs);
  const result = /** @type {ParseResult} */ (parseResult);

  const { stories, setupJsCode } = result.data;

  return { stories, jsCode: setupJsCode, html: result.contents };
}

module.exports = {
  mdjsProcess,
};
