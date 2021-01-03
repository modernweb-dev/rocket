import chai from 'chai';

import { addPlugin, metaConfigToRollupConfig } from 'plugins-manager';

const { expect } = chai;

describe('addPlugin', () => {
  const insertPlugin = (options = 'insert') => `-- ${options}Plugin --`;
  const oneExistingPlugin = [{ name: 'first', plugin: () => 'firstPlugin' }];
  const threeExistingPlugins = [
    { name: 'first', plugin: () => 'firstPlugin' },
    { name: 'second', plugin: () => 'secondPlugin' },
    { name: 'third', plugin: () => 'thirdPlugin' },
  ];

  it('adds plugins at the bottom by default', async () => {
    const config = metaConfigToRollupConfig({
      setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin })],
    });
    expect(config.plugins).to.deep.equal(['-- insertPlugin --']);

    const config2 = metaConfigToRollupConfig(
      {
        setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin })],
      },
      oneExistingPlugin,
    );
    expect(config2.plugins).to.deep.equal(['firstPlugin', '-- insertPlugin --']);
  });

  it('can add at the top', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin, location: 'top' })],
      },
      oneExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['-- insertPlugin --', 'firstPlugin']);
  });

  it('handles inserting "before" the 0 index ', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [
          addPlugin({ name: 'insert', plugin: insertPlugin, location: 'top', how: 'before' }),
        ],
      },
      oneExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['-- insertPlugin --', 'firstPlugin']);
  });

  it('adds after a given location by default', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin, location: 'second' })],
      },
      threeExistingPlugins,
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin',
      'secondPlugin',
      '-- insertPlugin --',
      'thirdPlugin',
    ]);
  });

  it('can adds before a given location', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [
          addPlugin({ name: 'insert', plugin: insertPlugin, location: 'second', how: 'before' }),
        ],
      },
      threeExistingPlugins,
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin',
      '-- insertPlugin --',
      'secondPlugin',
      'thirdPlugin',
    ]);
  });

  it('throws if given location does not exist', async () => {
    expect(() => {
      metaConfigToRollupConfig({
        setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin, location: 'not-found' })],
      });
    }).to.throw('Could not find a plugin with the name "not-found" to insert "insert" after it.');
  });

  it('accepts options', async () => {
    const config = metaConfigToRollupConfig({
      setupPlugins: [addPlugin({ name: 'insert', plugin: insertPlugin, options: 'extra' })],
    });
    expect(config.plugins).to.deep.equal(['-- extraPlugin --']);
  });
});
