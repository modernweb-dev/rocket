import chai from 'chai';

import { executeSetupFunctions, addPlugin } from 'plugins-manager';

const { expect } = chai;

describe('executeSetupFunctions', () => {
  const firstPlugin = () => 'firstPlugin';
  const secondPlugin = () => 'secondPlugin';
  const thirdPlugin = () => 'thirdPlugin';

  const threeExistingPlugin = [
    { name: 'first', plugin: firstPlugin },
    { name: 'second', plugin: secondPlugin },
    { name: 'third', plugin: thirdPlugin },
  ];

  it('executes and returns a new array not adjusting the original', async () => {
    const metaPlugins = executeSetupFunctions(
      [
        addPlugin({ name: 'add-a', plugin: () => 'a' }),
        addPlugin({ name: 'add-b', plugin: () => 'b' }),
      ],
      threeExistingPlugin,
    );
    expect(metaPlugins.length).to.equal(5);

    // does not change original array
    expect(threeExistingPlugin).to.deep.equal([
      { name: 'first', plugin: firstPlugin },
      { name: 'second', plugin: secondPlugin },
      { name: 'third', plugin: thirdPlugin },
    ]);
  });
});
