import chai from 'chai';

import { adjustPluginOptions, applyPlugins } from 'plugins-manager';

const { expect } = chai;

describe('adjustPluginOptions', () => {
  const firstPlugin = ({ flag = 'default-flag' } = {}) => `firstPlugin-${flag}`;

  /**
   * @param {object} options
   * @param {object} [options.other]
   * @param {string} [options.other.nested]
   * @param {string} [options.other.nested2]
   * @returns
   */
  const secondPlugin = ({ other = { nested: 'other.nested', nested2: 'other.nested2' } } = {}) =>
    `secondPlugin-${other.nested}-${other.nested2}`;
  const thirdPlugin = ({ name = 'name' }) => `thirdPlugin-${name}`;

  const defaultCurrentMetaPlugins = [
    { plugin: firstPlugin, options: { flag: 'firstSettings' } },
    {
      plugin: secondPlugin,
      options: { other: { nested: 'other.nested', nested2: 'other.nested2' } },
    },
    { plugin: thirdPlugin, options: { name: 'name' } },
  ];
  function newCurrentMetaPlugins() {
    return defaultCurrentMetaPlugins.map(obj => ({ ...obj }));
  }

  it('will merge options objects (flatly)', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [
          adjustPluginOptions(firstPlugin, { flag: '#mod#FirstSettings' }),
          adjustPluginOptions(secondPlugin, { other: { nested: '#mod#other.nested' } }),
        ],
      },
      newCurrentMetaPlugins(),
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin-#mod#FirstSettings',
      'secondPlugin-#mod#other.nested-undefined',
      'thirdPlugin-name',
    ]);
  });

  it('will override non object settings', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [adjustPluginOptions(thirdPlugin, { name: '#mod#aString' })],
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
    const config = applyPlugins(
      {
        setupPlugins: [
          adjustPluginOptions(secondPlugin, config => ({
            other: { ...config?.other, nested: '#mod#other.nested' },
          })),
        ],
      },
      newCurrentMetaPlugins(),
    );
    expect(config.plugins).to.deep.equal([
      'firstPlugin-firstSettings',
      'secondPlugin-#mod#other.nested-other.nested2',
      'thirdPlugin-name',
    ]);
  });

  it('throws if given plugin does not exist', async () => {
    expect(() => {
      applyPlugins({
        setupPlugins: [adjustPluginOptions(firstPlugin, { flag: 'newFlag' })],
      });
    }).to.throw(
      [
        'Could not find a plugin with the name "firstPlugin" to adjust it\'s options with:',
        '{',
        '  "flag": "newFlag"',
        '}',
      ].join('\n'),
    );
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

    /**
     * @typedef {object} SecondClassOptions
     * @property {string} lastName
     */

    class SecondClass {
      /** @type {SecondClassOptions} */
      options = {
        lastName: 'initial-second',
      };

      /**
       * @param {Partial<SecondClassOptions>} options
       */
      constructor(options = {}) {
        this.options = { ...this.options, ...options };
      }

      render() {
        return `[[ lastName: ${this.options.lastName} ]]`;
      }
    }

    const config = applyPlugins(
      {
        setupPlugins: [
          adjustPluginOptions(SecondClass, { lastName: 'set-via-adjustPluginOptions' }),
        ],
      },
      [
        { plugin: FirstClass, options: {} },
        { plugin: SecondClass, options: {} },
      ],
    );

    expect(
      config.plugins.map(/** @param {FirstClass | SecondClass} cls */ cls => cls.render()),
    ).to.deep.equal([
      '[[ firstName: initial-first ]]',
      '[[ lastName: set-via-adjustPluginOptions ]]',
    ]);
  });
});
