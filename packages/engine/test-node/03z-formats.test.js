import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Formats', () => {
  it('javascript', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/03-formats/01-js-single');
    await build();

    expect(readOutput('index.html', { format: 'html' })).to.equal('<h1>Home index.rocket.js</h1>');
  });

  it('markdown', async () => {
    const { build, readOutput, outputExists } = await setupTestEngine('fixtures/03-formats/01a-md');
    await build();

    expect(readOutput('empty/index.html', { format: 'html' })).to.equal(
      '<p>empty.rocket.md sourceRelativeFilePath: "empty.rocket.md"</p>',
    );
    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<p>index.rocket.md sourceRelativeFilePath: "index.rocket.md"</p>',
        '<p>bar</p>',
        '<p>bar2</p>',
      ].join('\n'),
    );

    expect(outputExists('index-')).to.be.false;
  });

  it('mdjs', async () => {
    const { build, readOutput, readSource } = await setupTestEngine('fixtures/03-formats/01b-mdjs');
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<p>index.rocket.md sourceRelativeFilePath: "index.rocket.md"</p>',
        '<script type="module" src="../01b-mdjs/index-mdjs-generated.js" mdjs-setup></script>',
      ].join('\n'),
    );
    expect(readSource('index-mdjs-generated.js')).to.equal("const foo = 'bar';");
  });

  it('xml', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/03-formats/04-xml');
    await build();

    expect(readOutput('sitemap.xml')).to.equal(['<xml></xml>'].join('\n'));
  });

  // TODO: implement
  it.skip('html', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/03-formats/md');
    await build();

    expect(readOutput('empty/index.html')).to.equal(
      '<p>empty.rocket.html sourceRelativeFilePath: "empty.rocket.html"</p>',
    );
    expect(readOutput('index.html')).to.equal(
      '<p>index.rocket.html sourceRelativeFilePath: "index.rocket.html"</p>',
    );
  });
});
