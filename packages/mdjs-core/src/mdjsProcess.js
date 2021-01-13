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

/** @type {MdjsProcessPlugin[]} */
const defaultMetaPlugins = [
  { name: 'markdown', plugin: markdown },
  { name: 'gfm', plugin: gfm },
  { name: 'mdjsParse', plugin: mdjsParse },
  { name: 'mdjsStoryParse', plugin: mdjsStoryParse },
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
async function mdjsProcess(
  mdjs,
  { rootNodeQueryCode = 'document', setupUnifiedPlugins = [] } = {},
) {
  const parser = unified();

  const metaPlugins = executeSetupFunctions(setupUnifiedPlugins, defaultMetaPlugins);

  // @ts-ignore
  for (const pluginObj of metaPlugins) {
    parser.use(pluginObj.plugin, pluginObj.options);
  }

  /** @type {unknown} */
  const parseResult = await parser.process(mdjs);
  const result = /** @type {ParseResult} */ (parseResult);

  const { stories, jsCode } = result.data;
  let fullJsCode = jsCode;

  if (stories && stories.length > 0) {
    const storiesCode = stories.map(story => story.code).join('\n');

    // @ts-ignore
    const codePlugins = metaPlugins.filter(pluginObj =>
      ['markdown', 'remark2rehype', 'rehypePrism', 'htmlStringify'].includes(pluginObj.name),
    );
    const codeParser = unified();
    // @ts-ignore
    for (const pluginObj of codePlugins) {
      codeParser.use(pluginObj.plugin, pluginObj.options);
    }

    const invokeStoriesCode = [];
    for (const story of stories) {
      let code = '';
      switch (story.type) {
        case 'html':
          code = `\`\`\`html\n${story.code.split('`')[1]}\n\`\`\``;
          break;
        case 'js':
          code = `\`\`\`js\n${story.code}\n\`\`\``;
          break;
        default:
          break;
      }
      const codeResult = await codeParser.process(code);
      const highlightedCode = /** @type {string} */ (codeResult.contents)
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
      invokeStoriesCode.push(
        `{ key: '${story.key}', story: ${story.key}, code: \`${highlightedCode}\` }`,
      );
    }

    fullJsCode = [
      jsCode,
      storiesCode,
      `const rootNode = ${rootNodeQueryCode};`,
      `const stories = [${invokeStoriesCode.join(', ')}];`,
      `for (const story of stories) {`,
      // eslint-disable-next-line no-template-curly-in-string
      '  const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);',
      `  storyEl.codeHasHtml = true;`,
      `  storyEl.story = story.story;`,
      `  storyEl.code = story.code;`,
      `};`,
      `if (!customElements.get('mdjs-preview')) { import('@mdjs/mdjs-preview/mdjs-preview.js'); }`,
      `if (!customElements.get('mdjs-story')) { import('@mdjs/mdjs-story/mdjs-story.js'); }`,
    ].join('\n');
  }
  return { stories, jsCode: fullJsCode, html: result.contents };
}

module.exports = {
  mdjsProcess,
};
