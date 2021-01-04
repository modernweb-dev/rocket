import chai from 'chai';

import { metaConfigToRollupConfig, addPlugin } from 'plugins-manager';

const { expect } = chai;

describe('metaConfigToRollupConfig', () => {
  const insertPlugin = () => `-- insertPlugin --`;
  const oneExistingPlugin = [{ name: 'first', plugin: () => 'firstPlugin' }];
  const threeExistingPlugin = [
    { name: 'first', plugin: () => 'firstPlugin' },
    { name: 'second', plugin: () => 'secondPlugin' },
    { name: 'third', plugin: () => 'thirdPlugin' },
  ];

  it('converts meta config by executing the plugins and assigning it to the config', async () => {
    const config = metaConfigToRollupConfig({}, threeExistingPlugin);
    expect(config.plugins).to.deep.equal(['firstPlugin', 'secondPlugin', 'thirdPlugin']);
  });

  it('incorporates "setupPlugin" functions in the config & removes "setupPlugins"', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin })],
      },
      oneExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['firstPlugin', '-- insertPlugin --']);
    expect(config.setupPlugins).to.be.undefined;
  });

  it('prefers a user set config.plugins', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin })],
        plugins: ['user-set'],
      },
      threeExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['user-set']);
    expect(config.setupPlugins).to.be.undefined;
  });
});
