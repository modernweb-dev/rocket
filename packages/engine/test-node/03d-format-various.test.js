import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Formats', () => {
  it('javascript', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/03d-format-various/01-js-single');
    await build();

    expect(readOutput('index.html')).to.equal('<h1>Home index.rocket.js</h1>');
  });

  it('xml', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/03d-format-various/04-xml');
    await build();

    expect(readOutput('sitemap.xml')).to.equal(['<xml></xml>'].join('\n'));
  });
});
