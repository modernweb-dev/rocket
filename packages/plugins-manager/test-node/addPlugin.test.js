import { expect } from 'chai';

import { addPlugin, applyPlugins } from 'plugins-manager';

describe('addPlugin', () => {
  const insertPlugin = ({ firstName = 'first', lastName = 'last' } = {}) =>
    `-- ${firstName} ${lastName} Plugin --`;
  const firstPlugin = () => 'firstPlugin';
  const secondPlugin = () => 'secondPlugin';
  const thirdPlugin = () => 'thirdPlugin';

  const oneExistingPlugin = [{ plugin: firstPlugin, options: {} }];
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

  it('[advanced] can add a `wrapPlugin` property to the function itself which will call it on the plugin on init', async () => {
    /**
     * @param {import('plugins-manager').AnyFn} plugin
     */
    function myWrapper(plugin) {
      return () => 'wrapped' + plugin();
    }

    const config = applyPlugins({
      setupPlugins: [addPlugin(insertPlugin)].map(mod => {
        // @ts-ignore
        mod.wrapPlugin = myWrapper;
        return mod;
      }),
    });
    expect(config.plugins).to.deep.equal(['wrapped-- first last Plugin --']);
  });
});
