/** @typedef {import('@mdjs/core/types/code').MarkdownResult} MarkdownResult */
/** @typedef {import('@mdjs/core/types/code').Story} Story */
/** @typedef {import('@mdjs/core/types/code').MdjsProcessPlugin} MdjsProcessPlugin */

const { mdjsParse } = require('./src/mdjsParse.js');
const { mdjsStoryParse } = require('./src/mdjsStoryParse.js');
const { mdjsDocPage } = require('./src/mdjsDocPage.js');
const { mdjsProcess } = require('./src/mdjsProcess.js');
const { isMdjsContent } = require('./src/isMdjsContent.js');

module.exports = {
  mdjsParse,
  mdjsStoryParse,
  mdjsDocPage,
  mdjsProcess,
  isMdjsContent,
};
