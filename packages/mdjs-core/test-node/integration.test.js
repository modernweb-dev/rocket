/* eslint-disable no-template-curly-in-string */

import { unified } from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import htmlStringify from 'rehype-stringify';
import htmlSlug from 'rehype-slug';
import htmlHeading from 'rehype-autolink-headings';
import raw from 'rehype-raw';

import mdSlug from 'remark-slug';
import mdHeadings from 'remark-autolink-headings';
import mdStringify from 'remark-html';

import { expect } from 'chai';
import { mdjsParse } from '../src/mdjsParse.js';
import { mdjsStoryParse } from '../src/mdjsStoryParse.js';

/** @typedef {import("../src/mdjsParse.js").MDJSVFileData} MDJSVFileData */

describe('Integration', () => {
  it('supports rehype slug, link, html', async () => {
    const input = [
      '## Intro',
      '## Intro',
      '```js',
      'const foo = 1;',
      '```',
      '```js script',
      'const bar = 22;',
      '```',
      '```js story',
      'export const fooStory = () => {}',
      '```',
      '```js preview-story',
      'export const fooPreviewStory = () => {}',
      '```',
    ].join('\n');

    const expected = [
      '<h2 id="intro"><a aria-hidden="true" tabindex="-1" href="#intro"><span class="icon icon-link"></span></a>Intro</h2>',
      '<h2 id="intro-1"><a aria-hidden="true" tabindex="-1" href="#intro-1"><span class="icon icon-link"></span></a>Intro</h2>',
      '<pre><code class="language-js">const foo = 1;',
      '</code></pre>',
      '<mdjs-story mdjs-story-name="fooStory"></mdjs-story>',
      '<mdjs-preview mdjs-story-name="fooPreviewStory">',
      '',
      '',
      '',
      '<pre><code class="language-js">export const fooPreviewStory = () => {}',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
    ];

    const parser = unified()
      .use(markdown)
      .use(mdjsParse)
      .use(mdjsStoryParse)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(htmlSlug)
      .use(htmlHeading)
      .use(htmlStringify);
    const result = await parser.process(input);
    if (result.value instanceof Buffer) throw new Error('contents should not be a buffer');
    expect(result.value.split('\n')).to.deep.equal(expected);
    expect(/** @type {MDJSVFileData} */ (result.data).jsCode).to.equal('const bar = 22;');
  });

  it('supports JSX Code in markdown', async () => {
    const input = [
      '## Intro',
      '## Intro',
      '```js',
      'const foo = 1;',
      '```',
      '```js story',
      'export const fooStory = () => {}',
      '```',
      '```js preview-story',
      'export const fooPreviewStory = () => {}',
      '```',
    ].join('\n');

    const expected = [
      '<h2 id="intro"><a href="#intro" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>Intro</h2>',
      '<h2 id="intro-1"><a href="#intro-1" aria-hidden="true" tabindex="-1"><span class="icon icon-link"></span></a>Intro</h2>',
      '<pre><code class="language-js">const foo = 1;',
      '</code></pre>',
      '<Story name="fooStory"></Story>',
      '<Preview><Story name="fooPreviewStory"></Story></Preview>',
      '',
    ].join('\n');

    const parser = unified()
      .use(markdown)
      .use(mdjsParse)
      .use(mdjsStoryParse, {
        storyTag: name => `<Story name="${name}"></Story>`,
        previewStoryTag: name => `<Preview><Story name="${name}"></Story></Preview>`,
      })
      .use(mdSlug)
      .use(mdHeadings)
      .use(mdStringify, { sanitize: false });
    const result = await parser.process(input);
    expect(result.value).to.equal(expected);
    expect(/** @type {MDJSVFileData} */ (result.data).stories).to.deep.equal([
      {
        key: 'fooStory',
        name: 'fooStory',
        code: 'export const fooStory = () => {}',
        type: 'js',
      },
      {
        key: 'fooPreviewStory',
        name: 'fooPreviewStory',
        code: 'export const fooPreviewStory = () => {}',
        type: 'js',
      },
    ]);
  });
});
