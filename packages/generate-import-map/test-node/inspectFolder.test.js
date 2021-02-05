import chai from 'chai';
import { execute } from './test-helpers.js';

const { expect } = chai;

describe('inspectFolder', () => {
  it.skip('can handle script src', async () => {
    const { localSpecifiers, bareSpecifiers } = await execute('fixtures/script-src');
    expect(localSpecifiers).lengthOf(1);
    expect(bareSpecifiers).lengthOf(0);
  });

  it.skip('can handle script content', async () => {
    const { localSpecifiers, bareSpecifiers } = await execute('fixtures/script-content');
    expect(localSpecifiers).lengthOf(1);
    expect(bareSpecifiers).lengthOf(0);
  });

  it('can handle multiple levels', async () => {
    const { localSpecifiers, bareSpecifiers } = await execute('fixtures/test-case');
    expect(localSpecifiers).lengthOf(3);
    expect(bareSpecifiers).lengthOf(2);
  });
});
