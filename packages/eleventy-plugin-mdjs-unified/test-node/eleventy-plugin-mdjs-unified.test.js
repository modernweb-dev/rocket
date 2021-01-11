const chai = require('chai');
const path = require('path');
const Eleventy = require('@11ty/eleventy');

const { expect } = chai;

async function renderEleventy(inputDir) {
  const mainOutputPath = '_site';
  const resolvedInputDir = path.resolve(path.dirname(__dirname), inputDir);
  const elev = new Eleventy(resolvedInputDir, mainOutputPath);

  // 11ty always wants a relative path to cwd - why?
  const rel = path.relative(process.cwd(), resolvedInputDir);
  const relCwdPathToConfig = path.join(rel, '.eleventy.cjs');
  elev.setConfigPathOverride(relCwdPathToConfig);
  elev.config.filters = {};

  elev.setDryRun(true);
  await elev.init();

  const htmlFiles = [];

  elev.config.filters['hook-for-test'] = (html, outputPath) => {
    const name = path.relative(mainOutputPath, outputPath);
    htmlFiles.push({
      html,
      name,
    });
    return html;
  };

  const orig = console.log;
  console.log = () => {
    // no logging
  };
  await elev.write();
  console.log = orig;

  return htmlFiles;
}

describe('eleventy-plugin-mdjs-unified', () => {
  it('renders markdown', async () => {
    const files = await renderEleventy('./test-node/fixtures/md');
    expect(files).to.deep.equal([
      {
        html:
          '<h1 id="first"><a aria-hidden="true" tabindex="-1" href="#first"><span class="icon icon-link"></span></a>First</h1>',
        name: 'first/index.html',
      },
    ]);
  });

  it('renders markdown with javascript', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs');
    expect(files).to.deep.equal([
      {
        html:
          '<h1 id="first"><a aria-hidden="true" tabindex="-1" href="#first"><span class="icon icon-link"></span></a>First</h1>\n<pre class="language-js"><code class="language-js"><span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token string">\'bar\'</span><span class="token punctuation">;</span>\n<span class="token keyword module">import</span> <span class="token punctuation">{</span> html <span class="token punctuation">}</span> <span class="token keyword module">from</span> <span class="token string">\'lit-html\'</span><span class="token punctuation">;</span>\n</code></pre>\n<mdjs-story mdjs-story-name="inline"></mdjs-story>\n<mdjs-preview mdjs-story-name="withBorder"></mdjs-preview>\n        <script type="module">\n          \nexport const inline = () => html` <p>main</p> `;\nexport const withBorder = () => html` <p>main</p> `;\nconst rootNode = document;\nconst stories = [{ key: \'inline\', story: inline, code: `<pre class="language-js"><code class="language-js"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function">inline</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=></span> html<span class="token template-string"><span class="token template-punctuation string">\\`</span><span class="token html language-html"> <span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;</span>p</span><span class="token punctuation">></span></span>main<span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;/</span>p</span><span class="token punctuation">></span></span> </span><span class="token template-punctuation string">\\`</span></span><span class="token punctuation">;</span>\n</code></pre>` }, { key: \'withBorder\', story: withBorder, code: `<pre class="language-js"><code class="language-js"><span class="token keyword module">export</span> <span class="token keyword">const</span> <span class="token function-variable function">withBorder</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token arrow operator">=></span> html<span class="token template-string"><span class="token template-punctuation string">\\`</span><span class="token html language-html"> <span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;</span>p</span><span class="token punctuation">></span></span>main<span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;/</span>p</span><span class="token punctuation">></span></span> </span><span class="token template-punctuation string">\\`</span></span><span class="token punctuation">;</span>\n</code></pre>` }];\nfor (const story of stories) {\n  const storyEl = rootNode.querySelector(`[mdjs-story-name="${story.key}"]`);\n  storyEl.codeHasHtml = true;\n  storyEl.story = story.story;\n  storyEl.code = story.code;\n};\nif (!customElements.get(\'mdjs-preview\')) { import(\'@mdjs/mdjs-preview/mdjs-preview.js\'); }\nif (!customElements.get(\'mdjs-story\')) { import(\'@mdjs/mdjs-story/mdjs-story.js\'); }\n        </script>\n      ',
        name: 'first/index.html',
      },
    ]);
  });

  it('rewrites relative import pathes', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs-import');
    expect(files).to.deep.equal([
      {
        html:
          "<p>first</p>\n        <script type=\"module\">\n          import '../import-me.js';\nimport('../import-me-too.js');\n        </script>\n      ",
        name: 'first/index.html',
      },
    ]);
  });

  it('rewrites relative import pathes in subpages', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs-import-in-subpage');
    expect(files).to.deep.equal([
      {
        html:
          "<p>first</p>\n        <script type=\"module\">\n          import '../../import-me.js';\nimport('../../import-me-too.js');\n        </script>\n      ",
        name: 'subpage/first/index.html',
      },
    ]);
  });

  it('does not touch relative imports of an index.md file', async () => {
    const files = await renderEleventy('./test-node/fixtures/mdjs-import-index');
    expect(files).to.deep.equal([
      {
        html:
          "<p>index</p>\n        <script type=\"module\">\n          import './import-me.js';\nimport('./import-me-too.js');\n        </script>\n      ",
        name: 'index.html',
      },
    ]);
  });

  it('allows to configure the plugins for unity', async () => {
    const files = await renderEleventy('./test-node/fixtures/plugin-configure');
    expect(files).to.deep.equal([
      {
        html:
          '<h1 id="first"><a class="anchor" href="#first"><span class="icon icon-link"></span></a>First</h1>',
        name: 'first/index.html',
      },
    ]);
  });
});
