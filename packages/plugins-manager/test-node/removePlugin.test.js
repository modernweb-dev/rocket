import chai from 'chai';

import { removePlugin, applyPlugins } from '../index.js';

const { expect } = chai;

describe('removePlugin', () => {
  const firstPlugin = () => 'firstPlugin';
  const secondPlugin = () => 'secondPlugin';
  const thirdPlugin = () => 'thirdPlugin';
  const fourthPlugin = () => 'fourthPlugin';

  const defaultCurrentMetaPlugins = [
    { plugin: firstPlugin, options: {} },
    { plugin: secondPlugin, options: {} },
    { plugin: thirdPlugin, options: {} },
  ];
  function newCurrentMetaPlugins() {
    return defaultCurrentMetaPlugins.map(obj => ({ ...obj }));
  }

  it('removes a plugin', async () => {
    const config = applyPlugins(
      {
        setupPlugins: [removePlugin(secondPlugin)],
      },
      newCurrentMetaPlugins(),
    );
    expect(config.plugins).to.deep.equal(['firstPlugin', 'thirdPlugin']);
  });

  it('throws if given plugin does not exist', async () => {
    expect(() => {
      applyPlugins({
        setupPlugins: [removePlugin(fourthPlugin)],
      });
    }).to.throw('Could not find a plugin with the name "fourthPlugin" to remove.');
  });
});
