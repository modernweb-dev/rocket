/** @typedef {import('./types/code.js').MarkdownResult} MarkdownResult */
/** @typedef {import('./types/code.js').Story} Story */
/** @typedef {import('./types/code.js').MdjsProcessPlugin} MdjsProcessPlugin */

const { mdjsParse } = require('./src/mdjsParse.js');
const { mdjsSetupCode } = require('./src/mdjsSetupCode.js');
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
  mdjsSetupCode,
};
