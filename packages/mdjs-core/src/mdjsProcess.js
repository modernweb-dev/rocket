/* eslint-disable @typescript-eslint/ban-ts-comment */
/** @typedef {import('../types/code').Story} Story */
/** @typedef {import('../types/code').ParseResult} ParseResult */
/** @typedef {import('../types/code').ProcessResult} ProcessResult */
/** @typedef {import('../types/code').MdjsProcessPlugin} MdjsProcessPlugin */

const unified = require('unified');
const markdown = require('remark-parse');
const gfm = require('remark-gfm');
const remark2rehype = require('remark-rehype');
const raw = require('rehype-raw');
const htmlStringify = require('rehype-stringify');
const htmlSlug = require('rehype-slug');
const htmlHeading = require('rehype-autolink-headings');
// @ts-ignore
const { executeSetupFunctions } = require('plugins-manager');
const loadLanguages = require('prismjs/components/');

const { mdjsParse } = require('./mdjsParse.js');
const { mdjsStoryParse } = require('./mdjsStoryParse.js');
const { mdjsSetupCode } = require('./mdjsSetupCode.js');

let prismLoaded = false;

/** @type {MdjsProcessPlugin[]} */
const defaultMetaPlugins = [
  { plugin: markdown, options: {} },
  { plugin: gfm, options: {} },
  { plugin: mdjsParse, options: {} },
  { plugin: mdjsStoryParse, options: {} },
  { plugin: mdjsSetupCode, options: {} },
  // @ts-ignore
  { plugin: remark2rehype, options: { allowDangerousHtml: true } },
  // @ts-ignore
  { plugin: raw, options: {} },
  // @ts-ignore
  { plugin: htmlSlug, options: {} },
  // @ts-ignore
  { plugin: htmlHeading, options: {} },
  // @ts-ignore
  { plugin: htmlStringify, options: {} },
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
  if (!prismLoaded) {
    prismLoaded = true;
    const rehypePrism = (await import('rehype-prism/lib/src/index.js')).default;
    loadLanguages(['md', 'shell', 'yml', 'diff']);
    defaultMetaPlugins.splice(6, 0, { plugin: rehypePrism, options: {} });
  }

  const metaPlugins = executeSetupFunctions(setupUnifiedPlugins, defaultMetaPlugins);

  for (const pluginObj of metaPlugins) {
    // @ts-ignore
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
