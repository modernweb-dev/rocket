const unified = require('unified');
const markdown = require('remark-parse');
const html = require('remark-html');

const chai = require('chai');
const { mdjsParse } = require('../src/mdjsParse.js');

const { expect } = chai;

/** @typedef {import("../src/mdjsParse.js").MDJSVFileData} MDJSVFileData */

describe('mdjsParse', () => {
  it('extracts only "js script" code blocks', async () => {
    const input = [
      '## Intro',
      '```js',
      'const foo = 1;',
      '```',
      '```js script',
      'const bar = 22;',
      '```',
    ].join('\n');
    const parser = unified().use(markdown).use(mdjsParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal(
      '<h2>Intro</h2>\n<pre><code class="language-js">const foo = 1;\n</code></pre>\n',
    );
    expect(/** @type {MDJSVFileData} */ (result.data).jsCode).to.equal('const bar = 22;');
  });

  // TODO: fix this bug - maybe something in unified itself 🤔
  it.skip('handling only "js script" code blocks', async () => {
    const input = [
      //
      '```js script',
      'const bar = 22;',
      '```',
    ].join('\n');
    const parser = unified().use(markdown).use(mdjsParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal('');
    expect(/** @type {MDJSVFileData} */ (result.data).jsCode).to.equal('const bar = 22;');
  });
});
