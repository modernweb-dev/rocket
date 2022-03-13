import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Components', () => {
  it('01: loads components server side by default', async () => {
    const { build, readOutput } = await setupTestEngine(
      'fixtures/14-components/01-load-server-side/docs',
    );
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<p>',
        '  <my-el',
        '    ><template shadowroot="open"><p>Hello World</p></template></my-el',
        '  >',
        '</p>',
      ].join('\n'),
    );
  });
});
