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
});
