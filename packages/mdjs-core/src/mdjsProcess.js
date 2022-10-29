/** @typedef {import('../types/code.js').Story} Story */
/** @typedef {import('../types/code.js').ParseResult} ParseResult */
/** @typedef {import('../types/code.js').ProcessResult} ProcessResult */
/** @typedef {import('../types/code.js').MdjsProcessPlugin} MdjsProcessPlugin */

import { unified } from 'unified';
import markdown from 'remark-parse';
import gfm from 'remark-gfm';
// @ts-ignore
import remark2rehype from 'remark-rehype';
// @ts-ignore
import raw from 'rehype-raw';
// @ts-ignore
import htmlSlug from 'rehype-slug';
// @ts-ignore
import htmlHeading from 'rehype-autolink-headings';
// @ts-ignore
import rehypePrism from 'rehype-prism-plus';
// @ts-ignore
import htmlStringify from 'rehype-stringify';
import { executeSetupFunctions } from 'plugins-manager';
import { mdjsParse } from './mdjsParse.js';
import { mdjsStoryParse } from './mdjsStoryParse.js';
import { mdjsSetupCode } from './mdjsSetupCode.js';

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
  { plugin: rehypePrism, options: {} },
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
export async function mdjsProcess(mdjs, { setupUnifiedPlugins = [] } = {}) {
  const parser = unified();
  const metaPlugins = executeSetupFunctions(setupUnifiedPlugins, defaultMetaPlugins);

  for (const pluginObj of metaPlugins) {
    // @ts-ignore
    parser.use(pluginObj.plugin, pluginObj.options);
  }

  /** @type {unknown} */
  const parseResult = await parser.process(mdjs);
  const result = /** @type {ParseResult} */ (parseResult);

  const { stories, setupJsCode } = result.data;

  return { stories, jsCode: setupJsCode, html: result.value };
}
