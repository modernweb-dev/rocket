import chai from 'chai';

import { adjustPluginOptions, metaConfigToRollupConfig } from 'plugins-manager';

const { expect } = chai;

describe('adjustPluginOptions', () => {
  const defaultCurrentMetaPlugins = [
    {
      name: 'first',
      plugin: options => `firstPlugin-${options.flag}`,
      options: { flag: 'firstSettings' },
    },
    {
      name: 'second',
      plugin: options => `secondPlugin-${options.other.nested}-${options.other.nested2}`,
      options: { other: { nested: 'other.nested', nested2: 'other.nested2' } },
    },
    { name: 'third', plugin: options => `thirdPlugin-${options}`, options: 'aString' },
  ];
  function newCurrentMetaPlugins() {
    return defaultCurrentMetaPlugins.map(obj => ({ ...obj }));
  }

  it('will merge options objects (flatly)', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [
          adjustPluginOptions('first', { flag: '#mod#FirstSettings' }),
          adjustPluginOptions('second', { other: { nested: '#mod#other.nested' } }),
        ],
      },
      newCurrentMetaPlugins(),
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin-#mod#FirstSettings',
      'secondPlugin-#mod#other.nested-undefined',
      'thirdPlugin-aString',
    ]);
  });

  it('will override non object settings', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [adjustPluginOptions('third', '#mod#aString')],
      },
      newCurrentMetaPlugins(),
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin-firstSettings',
      'secondPlugin-other.nested-other.nested2',
      'thirdPlugin-#mod#aString',
    ]);
  });

  it('accepts a function as a setting to manually merge objects', async () => {
    const config = metaConfigToRollupConfig(
      {
        setupPlugins: [
          adjustPluginOptions('second', config => ({
            other: { ...config.other, nested: '#mod#other.nested' },
          })),
        ],
      },
      newCurrentMetaPlugins(),
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin-firstSettings',
      'secondPlugin-#mod#other.nested-other.nested2',
      'thirdPlugin-aString',
    ]);
  });

  it('throws if given location does not exist', async () => {
    expect(() => {
      metaConfigToRollupConfig({
        setupPlugins: [adjustPluginOptions('not-found', '#mod#aString')],
      });
    }).to.throw('Could not find a plugin with the name "not-found" to adjust the options.');
  });
});
