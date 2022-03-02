import chai from 'chai';

import { addPlugin, applyPlugins } from '../index.js';

const { expect } = chai;

describe('addPlugin', () => {
  const insertPlugin = ({ firstName = 'first', lastName = 'last' } = {}) =>
    `-- ${firstName} ${lastName} Plugin --`;
  const firstPlugin = () => 'firstPlugin';
  const secondPlugin = () => 'secondPlugin';
  const thirdPlugin = () => 'thirdPlugin';

  /**
   * @template T
   * @type {import('../types/main.js.js').MetaPlugin<T>[]}
   */
  const oneExistingPlugin = [{ plugin: firstPlugin, options: {} }];
  /**
   * @template T
   * @type {import('../types/main.js.js').MetaPlugin<T>[]}
   */
  const threeExistingPlugins = [
    { plugin: firstPlugin, options: {} },
    { plugin: secondPlugin, options: {} },
    { plugin: thirdPlugin, options: {} },
  ];

  it('adds plugins at the bottom by default', async () => {
    const config = applyPlugins({
      setupPlugins: [addPlugin(insertPlugin)],
    });
    expect(config.plugins).to.deep.equal(['-- first last Plugin --']);

    const config2 = applyPlugins(
      {
        setupPlugins: [addPlugin(insertPlugin)],
      },
      oneExistingPlugin,
    );
    expect(config2.plugins).to.deep.equal(['firstPlugin', '-- first last Plugin --']);
  });

  it('can add at the top', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [addPlugin(insertPlugin, undefined, { location: 'top' })],
      },
      oneExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['-- first last Plugin --', 'firstPlugin']);
  });

  it('handles inserting "before" the 0 index ', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [addPlugin(insertPlugin, undefined, { location: 'top', how: 'before' })],
      },
      oneExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['-- first last Plugin --', 'firstPlugin']);
  });

  it('adds after a given location by default', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [addPlugin(insertPlugin, undefined, { location: secondPlugin })],
      },
      threeExistingPlugins,
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin',
      'secondPlugin',
      '-- first last Plugin --',
      'thirdPlugin',
    ]);
  });

  it('can adds before a given location', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [
          addPlugin(insertPlugin, undefined, { location: secondPlugin, how: 'before' }),
        ],
      },
      threeExistingPlugins,
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin',
      '-- first last Plugin --',
      'secondPlugin',
      'thirdPlugin',
    ]);
  });

  it('throws if given location does not exist', async () => {
    expect(() => {
      applyPlugins({
        setupPlugins: [addPlugin(insertPlugin, undefined, { location: firstPlugin })],
      });
    }).to.throw(
      'Could not find a plugin with the name "firstPlugin" to insert "insertPlugin" after it.',
    );
  });

  it('accepts options', async () => {
    const config = applyPlugins({
      setupPlugins: [addPlugin(insertPlugin, { firstName: 'newFirst' })],
    });
    expect(config.plugins).to.deep.equal(['-- newFirst last Plugin --']);
  });
});
