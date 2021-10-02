import chai from 'chai';

import { applyPlugins, addPlugin } from '../index.js';

const { expect } = chai;

describe('applyPlugins', () => {
  const insertPlugin = () => `-- insertPlugin --`;
  /**
   * @template T
   * @type {import('../types/main.js').MetaPlugin<T>[]}
   */
  const oneExistingPlugin = [{ plugin: () => 'firstPlugin', options: {} }];
  /**
   * @template T
   * @type {import('../types/main.js').MetaPlugin<T>[]}
   */
  const threeExistingPlugin = [
    { plugin: () => 'firstPlugin', options: {} },
    { plugin: () => 'secondPlugin', options: {} },
    { plugin: () => 'thirdPlugin', options: {} },
  ];

  it('converts meta config by executing the plugins and assigning it to the config', async () => {
    const config = applyPlugins({}, threeExistingPlugin);
    expect(config.plugins).to.deep.equal(['firstPlugin', 'secondPlugin', 'thirdPlugin']);
  });

  it('incorporates "setupPlugin" functions in the config & removes "setupPlugins"', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [addPlugin(insertPlugin)],
      },
      oneExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['firstPlugin', '-- insertPlugin --']);
    expect(config.setupPlugins).to.be.undefined;
  });

  it('a provided plugins property will always win even if it is an empty array', async () => {
    const config = applyPlugins({
      setupPlugins: [addPlugin(insertPlugin)],
      plugins: [],
    });
    expect(config.plugins).to.deep.equal([]);
    expect(config.setupPlugins).to.be.undefined;
  });

  it('prefers a user set config.plugins', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [addPlugin(insertPlugin)],
        plugins: ['user-set'],
      },
      threeExistingPlugin,
    );
    expect(config.plugins).to.deep.equal(['user-set']);
    expect(config.setupPlugins).to.be.undefined;
  });

  it('works with classes', async () => {
    class FirstClass {
      constructor({ firstName = 'initial-first' } = {}) {
        this.options = { firstName };
      }

      render() {
        return `[[ firstName: ${this.options.firstName} ]]`;
      }
    }
    class SecondClass {
      constructor({ lastName = 'initial-second' } = {}) {
        this.options = { lastName };
      }

      render() {
        return `[[ lastName: ${this.options.lastName} ]]`;
      }
    }

    const config = applyPlugins({
      setupPlugins: [
        addPlugin(FirstClass),
        addPlugin(SecondClass, { lastName: 'set-via-addPlugin' }),
      ],
    });

    expect(
      config.plugins.map(/** @param {FirstClass | SecondClass} cls */ cls => cls.render()),
    ).to.deep.equal(['[[ firstName: initial-first ]]', '[[ lastName: set-via-addPlugin ]]']);
  });
});
