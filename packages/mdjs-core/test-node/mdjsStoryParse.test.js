/* eslint-disable no-template-curly-in-string */

const unified = require('unified');
const markdown = require('remark-parse');
const html = require('remark-html');

const chai = require('chai');
const { mdjsStoryParse } = require('../src/mdjsStoryParse.js');

const { expect } = chai;

/** @typedef {import("../src/mdjsParse.js").MDJSVFileData} MDJSVFileData */

describe('mdjsStoryParse', () => {
  const input = [
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
    '```html story',
    '<demo-el></demo-el>',
    '```',
    '```html preview-story',
    '<demo-el></demo-el>',
    '```',
  ].join('\n');

  it('extracts code blocks with "js/html story" and "js/html preview-story" and places marker tags', async () => {
    const expected = [
      '<h2>Intro</h2>',
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
      '<mdjs-story mdjs-story-name="HtmlStory0"></mdjs-story>',
      '<mdjs-preview mdjs-story-name="HtmlStory1">',
      '',
      '',
      '',
      '<pre><code class="language-html">&#x3C;demo-el>&#x3C;/demo-el>',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
      '',
    ].join('\n');

    const parser = unified().use(markdown).use(mdjsStoryParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal(expected);
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
      {
        key: 'HtmlStory0',
        name: 'HtmlStory0',
        code: 'export const HtmlStory0 = () => html`<demo-el></demo-el>`;',
        type: 'html',
      },
      {
        key: 'HtmlStory1',
        name: 'HtmlStory1',
        code: 'export const HtmlStory1 = () => html`<demo-el></demo-el>`;',
        type: 'html',
      },
    ]);
  });

  it('allows to configure the marker tags', async () => {
    const expected = [
      '<h2>Intro</h2>',
      '<pre><code class="language-js">const foo = 1;',
      '</code></pre>',
      '<Story name="fooStory"></Story>',
      '<Preview><Story name="fooPreviewStory"></Story></Preview>',
      '<Story name="HtmlStory0"></Story>',
      '<Preview><Story name="HtmlStory1"></Story></Preview>',
      '',
    ].join('\n');

    const parser = unified()
      .use(markdown)
      .use(mdjsStoryParse, {
        storyTag: name => `<Story name="${name}"></Story>`,
        previewStoryTag: name => `<Preview><Story name="${name}"></Story></Preview>`,
      })
      .use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal(expected);
  });

  it('will wrap following story-code blocks', async () => {
    const input = [
      '```js preview-story',
      'export const foo = () => {};',
      '```',
      '',
      '```swift story-code',
      'CODE for iOS',
      '```',
      '',
      '```xml story-code',
      'CODE for Android',
      '```',
    ].join('\n');

    const expected = [
      '<mdjs-preview mdjs-story-name="foo">',
      '',
      '',
      '',
      '<pre><code class="language-js">export const foo = () => {};',
      '</code></pre>',
      '<pre><code class="language-swift">CODE for iOS',
      '</code></pre>',
      '<pre><code class="language-xml">CODE for Android',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
      '',
    ].join('\n');

    const parser = unified().use(markdown).use(mdjsStoryParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal(expected);
  });

  it('will wrap following story-code blocks also for html stories', async () => {
    const input = [
      '```html preview-story',
      '<my-el></my-el>',
      '```',
      '',
      '```swift story-code',
      'CODE for iOS',
      '```',
      '',
      '```xml story-code',
      'CODE for Android',
      '```',
    ].join('\n');

    const expected = [
      '<mdjs-preview mdjs-story-name="HtmlStory0">',
      '',
      '',
      '',
      '<pre><code class="language-html">&#x3C;my-el>&#x3C;/my-el>',
      '</code></pre>',
      '<pre><code class="language-swift">CODE for iOS',
      '</code></pre>',
      '<pre><code class="language-xml">CODE for Android',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
      '',
    ].join('\n');

    const parser = unified().use(markdown).use(mdjsStoryParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal(expected);
  });

  it('will wrap only following story-code blocks', async () => {
    const input = [
      '```js preview-story',
      'export const foo = () => {};',
      '```',
      '```swift story-code',
      'CODE for iOS',
      '```',
      '# hey',
      '```swift story-code',
      'SHOULD BE OUTSIDE',
      '```',
      '```js preview-story',
      'export const foo2 = () => {};',
      '```',
      '```xml story-code',
      'CODE for Android',
      '```',
    ].join('\n');

    const expected = [
      '<mdjs-preview mdjs-story-name="foo">',
      '',
      '',
      '',
      '<pre><code class="language-js">export const foo = () => {};',
      '</code></pre>',
      '<pre><code class="language-swift">CODE for iOS',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
      '<h1>hey</h1>',
      '<pre><code class="language-swift">SHOULD BE OUTSIDE',
      '</code></pre>',
      '<mdjs-preview mdjs-story-name="foo2">',
      '',
      '',
      '',
      '<pre><code class="language-js">export const foo2 = () => {};',
      '</code></pre>',
      '<pre><code class="language-xml">CODE for Android',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
      '',
    ].join('\n');

    const parser = unified().use(markdown).use(mdjsStoryParse).use(html, { sanitize: false });
    const result = await parser.process(input);
    expect(result.contents).to.equal(expected);
  });
});
