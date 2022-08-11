import chai from 'chai';

import { executeSetupFunctions, addPlugin } from '../index.js';

const { expect } = chai;

describe('executeSetupFunctions', () => {
  const firstPlugin = () => 'firstPlugin';
  const secondPlugin = () => 'secondPlugin';
  const thirdPlugin = () => 'thirdPlugin';

  /**
   * @template T
   * @type {import('../types/main.js.js').MetaPlugin<T>[]}
   */
  const threeExistingPlugin = [
    { plugin: firstPlugin, options: {} },
    { plugin: secondPlugin, options: {} },
    { plugin: thirdPlugin, options: {} },
  ];

  it('executes and returns a new array not adjusting the original', async () => {
    const metaPlugins = executeSetupFunctions(
      [addPlugin(() => 'a'), addPlugin(() => 'b')],
      threeExistingPlugin,
    );
    expect(metaPlugins.length).to.equal(5);

    // does not change original array
    expect(threeExistingPlugin).to.deep.equal([
      { plugin: firstPlugin, options: {} },
      { plugin: secondPlugin, options: {} },
      { plugin: thirdPlugin, options: {} },
    ]);
  });
});
