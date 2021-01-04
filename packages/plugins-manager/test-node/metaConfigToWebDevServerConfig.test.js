import chai from 'chai';

import { metaConfigToWebDevServerConfig, addPlugin } from 'plugins-manager';

const { expect } = chai;

describe('metaConfigToWebDevServerConfig', () => {
  const twoExistingPlugin = [
    { name: 'first', plugin: () => 'firstPlugin' },
    { name: 'second', plugin: () => 'secondPlugin' },
  ];

  it('accepts a rollupWrapperFunction for setupRollupPlugins', async () => {
    function rollupWrapperFunction(srcFn) {
      return () => `*wrapped* ${srcFn()}`;
    }

    const config = metaConfigToWebDevServerConfig(
      {
        setupRollupPlugins: [
          addPlugin({ name: 'third', plugin: () => 'thirdPlugin' }),
          addPlugin({ name: 'fourth', plugin: () => 'fourthPlugin' }),
        ],
        setupPlugins: [
          addPlugin({ name: 'fifth', plugin: () => 'fifthPlugin' }),
          addPlugin({ name: 'sixth', plugin: () => 'sixthPlugin' }),
        ],
      },
      twoExistingPlugin,
      { rollupWrapperFunction },
    );

    expect(config.plugins).to.deep.equal([
      'firstPlugin',
      'secondPlugin',
      '*wrapped* thirdPlugin',
      '*wrapped* fourthPlugin',
      'fifthPlugin',
      'sixthPlugin',
    ]);
  });

  it('prefers a user set config.plugins', async () => {
    const config = metaConfigToWebDevServerConfig(
      {
        setupPlugins: [addPlugin({ name: 'first', plugin: () => 'firstPlugin' })],
        setupRollupPlugins: [addPlugin({ name: 'second', plugin: () => 'secondPlugin' })],
        plugins: ['user-set'],
      },
      twoExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['user-set']);
    expect(config.setupPlugins).to.be.undefined;
    expect(config.setupRollupPlugins).to.be.undefined;
  });
});
