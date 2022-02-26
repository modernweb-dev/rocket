/* eslint-disable no-template-curly-in-string */

const chai = require('chai');
const { adjustPluginOptions } = require('plugins-manager');
const { mdjsProcess } = require('../src/mdjsProcess.js');
const { mdjsSetupCode } = require('../src/mdjsSetupCode.js');
const { mdjsStoryParse } = require('../src/mdjsStoryParse.js');

const { expect } = chai;

describe('mdjsProcess', () => {
  const input = [
    'Intro',
    '```js',
    'const foo = 1;',
    '```',
    '```js script',
    'const bar = 2;',
    '```',
    '```js story',
    'export const fooStory = () => {}',
    '```',
    '```js preview-story',
    'export const fooPreviewStory = () => {}',
    '```',
  ].join('\n');

  it('extracts code blocks with "js story" and "js preview-story" and places marker tags', async () => {
    const expected = [
      '<p>Intro</p>',
      '<pre class="language-js"><code class="language-js"><span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>',
      '</code></pre>',
      '<mdjs-story mdjs-story-name="fooStory"></mdjs-story>',
      '<mdjs-preview mdjs-story-name="fooPreviewStory">',
      '',
      '',
      '',
      '<pre class="language-js"><code class="language-js"><span class="token keyword">export</span> <span class="token keyword">const</span> <span class="token function-variable function">fooPreviewStory</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span><span class="token punctuation">}</span>',
      '</code></pre>',
      '',
      '',
      '',
      '</mdjs-preview>',
    ].join('\n');
    const expectedJsCode = [
      '/** script code **/',
      'const bar = 2;',
      '/** stories code **/',
      'export const fooStory = () => {}',
      'export const fooPreviewStory = () => {}',
      '/** stories setup code **/',
      'const rootNode = document;',
      `const stories = [{ key: 'fooStory', story: fooStory }, { key: 'fooPreviewStory', story: fooPreviewStory }];`,
      'let needsMdjsElements = false;',
      'for (const story of stories) {',
      '  const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);',
      '  if (storyEl) {',
      '    storyEl.story = story.story;',
      '    storyEl.key = story.key;',
      '    needsMdjsElements = true;',
      '    Object.assign(storyEl, {});',
      '  }',
      '};',
      'if (needsMdjsElements) {',
      `  if (!customElements.get('mdjs-preview')) { import('@mdjs/mdjs-preview/define'); }`,
      `  if (!customElements.get('mdjs-story')) { import('@mdjs/mdjs-story/define'); }`,
      '}',
    ].join('\n');

    const result = await mdjsProcess(input);

    expect(result.html).to.equal(expected);
    expect(result.jsCode).to.equal(expectedJsCode);
  });

  it('has no js code if there are no stories', async () => {
    const result = await mdjsProcess('## Intro');
    expect(result.html).to.equal(
      '<h2 id="intro"><a aria-hidden="true" tabindex="-1" href="#intro"><span class="icon icon-link"></span></a>Intro</h2>',
    );
    expect(result.jsCode).to.equal('');
  });

  it('handles files which have js but no stories', async () => {
    const md = [
      //
      '## Intro',
      '```js script',
      'const bar = 2;',
      '```',
    ].join('\n');

    const result = await mdjsProcess(md);
    expect(result.html).to.equal(
      '<h2 id="intro"><a aria-hidden="true" tabindex="-1" href="#intro"><span class="icon icon-link"></span></a>Intro</h2>',
    );
    expect(result.jsCode).to.equal('const bar = 2;');
  });

  it('can setup all unified plugins via "setupUnifiedPlugins" which accepts a single function or an array of functions', async () => {
    const expected = [
      '<p>Intro</p>',
      '<pre class="language-js"><code class="language-js"><span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>',
      '</code></pre>',
      '<my-story mdjs-story-name="fooStory"></my-story>',
      '<my-preview mdjs-story-name="fooPreviewStory"></my-preview>',
    ].join('\n');

    function replaceStoryTag(plugins) {
      return plugins.map(pluginObj => {
        if (pluginObj.plugin === mdjsStoryParse) {
          return {
            ...pluginObj,
            options: {
              storyTag: name => `<my-story mdjs-story-name="${name}"></my-story>`,
              previewStoryTag: name => `<my-preview mdjs-story-name="${name}"></></my-preview>`,
            },
          };
        }
        return pluginObj;
      });
    }

    const result = await mdjsProcess(input, {
      setupUnifiedPlugins: [replaceStoryTag],
    });
    expect(result.html).to.equal(expected);

    // Works with arrays

    const expectedForArray = [
      '<p>Intro</p>',
      '<pre class="language-js"><code class="language-js"><span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>',
      '</code></pre>',
      '<my-story2 mdjs-story-name="fooStory"></my-story2>',
      '<my-preview2 mdjs-story-name="fooPreviewStory"></my-preview2>',
    ].join('\n');

    function replaceStoryTag2(plugins) {
      return plugins.map(pluginObj => {
        if (pluginObj.plugin === mdjsStoryParse) {
          return {
            ...pluginObj,
            options: {
              storyTag: name => `<my-story2 mdjs-story-name="${name}"></my-story2>`,
              previewStoryTag: name => `<my-preview2 mdjs-story-name="${name}"></></my-preview2>`,
            },
          };
        }
        return pluginObj;
      });
    }

    const resultOfArray = await mdjsProcess(input, {
      setupUnifiedPlugins: [replaceStoryTag, replaceStoryTag2],
    });
    expect(resultOfArray.html).to.equal(expectedForArray);
  });

  it('handles tables', async () => {
    const input = [
      //
      '| Page  | Type |',
      '| ----- | ---- |',
      '| About | Info |',
    ].join('\n');

    const expected =
      '<table><thead><tr><th>Page</th><th>Type</th></tr></thead><tbody><tr><td>About</td><td>Info</td></tr></tbody></table>';
    const result = await mdjsProcess(input);
    expect(result.html.trim()).to.equal(expected);
  });

  it('can adjust languages for story preview', async () => {
    const input = [
      'Intro',
      '```js preview-story',
      'export const fooPreviewStory = () => {}',
      '```',
    ].join('\n');

    const expected = [
      `/** script code **/`,
      ``,
      `/** stories code **/`,
      `export const fooPreviewStory = () => {}`,
      `/** stories setup code **/`,
      `const rootNode = document;`,
      `const stories = [{ key: 'fooPreviewStory', story: fooPreviewStory }];`,
      `let needsMdjsElements = false;`,
      `for (const story of stories) {`,
      '  const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);',
      `  if (storyEl) {`,
      `    storyEl.story = story.story;`,
      `    storyEl.key = story.key;`,
      `    needsMdjsElements = true;`,
      '    Object.assign(storyEl, {"languages":[{"key":"en","name":"English"}]});',
      `  }`,
      `};`,
      `if (needsMdjsElements) {`,
      `  if (!customElements.get('mdjs-preview')) { import('@mdjs/mdjs-preview/define'); }`,
      `  if (!customElements.get('mdjs-story')) { import('@mdjs/mdjs-story/define'); }`,
      `}`,
    ].join('\n');
    const result = await mdjsProcess(input, {
      setupUnifiedPlugins: [
        adjustPluginOptions(mdjsSetupCode, {
          simulationSettings: { languages: [{ key: 'en', name: 'English' }] },
        }),
      ],
    });
    expect(result.jsCode.trim()).to.equal(expected);
  });
});
