import { unified } from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import { mdjsParse } from '../src/mdjsParse.js';

import { expect } from 'chai';

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
    expect(result.value).to.equal(
      '<h2>Intro</h2>\n<pre><code class="language-js">const foo = 1;\n</code></pre>\n',
    );
    expect(/** @type {MDJSVFileData} */ (result.data).jsCode).to.equal('const bar = 22;');
  });

  it('extracts "js client" code blocks', async () => {
    const input = [
      '## Intro',
      '```js',
      'const foo = 1;',
      '```',
      '```js client',
      'const bar = 22;',
      '```',
    ].join('\n');
    const parser = unified().use(markdown).use(mdjsParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.value).to.equal(
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
    expect(result.value).to.equal('');
    expect(/** @type {MDJSVFileData} */ (result.data).jsCode).to.equal('const bar = 22;');
  });
});
