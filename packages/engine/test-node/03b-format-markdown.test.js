import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Format Markdown', () => {
  it('01: Basic', async () => {
    const { build, readOutput, outputExists } = await setupTestEngine(
      'fixtures/03b-format-markdown/01-basic',
    );
    await build();

    expect(readOutput('empty/index.html')).to.equal(
      '<p>empty.rocket.md sourceRelativeFilePath: "empty.rocket.md"</p>',
    );
    expect(readOutput('index.html')).to.equal(
      [
        '<p>index.rocket.md sourceRelativeFilePath: "index.rocket.md"</p>',
        '<p>bar</p>',
        '<p>bar2</p>',
      ].join('\n'),
    );

    expect(outputExists('index-')).to.be.false;
  });

  it('02: mdjs', async () => {
    const { build, readOutput, readSource } = await setupTestEngine(
      'fixtures/03b-format-markdown/02-mdjs/docs',
    );
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<p>index.rocket.md sourceRelativeFilePath: "index.rocket.md"</p>',
        '<script type="module" src="../docs/index-mdjs-generated.js" mdjs-setup></script>',
      ].join('\n'),
    );
    expect(readSource('index-mdjs-generated.js')).to.equal("const foo = 'bar';");
  });

  it('03: cleans up generated markdown files after render', async () => {
    const { build, readOutput, sourceExists } = await setupTestEngine(
      'fixtures/03b-format-markdown/03-cleanup',
    );
    await build();

    expect(readOutput('index.html')).to.equal(['<p>Rocket</p>'].join('\n'));
    expect(sourceExists('index-converted-md-source.js')).to.be.false;
    expect(sourceExists('index-converted-md.js')).to.be.false;
  });

  it('04: keeps converted markdown files via "export const keepConvertedFiles = true"', async () => {
    const { build, readOutput, sourceExists } = await setupTestEngine(
      'fixtures/03b-format-markdown/04-keep-converted-files',
    );
    await build();

    expect(readOutput('index.html')).to.equal(['<p>Rocket</p>'].join('\n'));
    expect(sourceExists('index-converted-md-source.js')).to.be.true;
    expect(sourceExists('index-converted-md.js')).to.be.true;
  });

  it('06: does not break when escaping ${ in code blocks', async () => {
    const { build, readOutput } = await setupTestEngine(
      'fixtures/03b-format-markdown/06-format-js',
    );
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<p>Escape JS</p>',
        '<pre',
        '  class="language-js"',
        '><code class="language-js code-highlight"><span class="code-line"><span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token string">\'one\'</span><span class="token punctuation">;</span>',
        '</span><span class="code-line"><span class="token keyword">const</span> bar <span class="token operator">=</span> html<span class="token template-string"><span class="token template-punctuation string">`</span><span class="token html language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;</span>p</span><span class="token punctuation">></span></span>${foo}<span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;/</span>p</span><span class="token punctuation">></span></span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span>',
        '</span><span class="code-line"><span class="token keyword">const</span> baz <span class="token operator">=</span> html<span class="token template-string"><span class="token template-punctuation string">`</span><span class="token html language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;</span>span</span><span class="token punctuation">></span></span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\\${</span>foo<span class="token interpolation-punctuation punctuation">}</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&#x3C;/</span>span</span><span class="token punctuation">></span></span></span><span class="token template-punctuation string">`</span></span><span class="token punctuation">;</span>',
        '</span></code></pre>',
      ].join('\n'),
    );
  });
});
