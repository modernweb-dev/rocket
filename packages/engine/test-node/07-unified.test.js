import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Unified', () => {
  it('can add a plugin', async () => {
    const { build, readOutput } = await setupTestEngine('fixtures/07-unified/01-add-plugin/docs');
    await build();

    expect(readOutput('index.html')).to.equal(`<p>See a 🐶</p>`);
  });
});
