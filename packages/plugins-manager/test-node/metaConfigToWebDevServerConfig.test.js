import chai from 'chai';

import { metaConfigToWebDevServerConfig } from 'plugins-manager';

const { expect } = chai;

describe('metaConfigToWebDevServerConfig', () => {
  const threeExistingPlugin = [
    { name: 'first', plugin: () => 'firstPlugin' },
    { name: 'second', plugin: () => 'secondPlugin' },
    { name: 'third', plugin: () => 'thirdPlugin' },
  ];

  it('accepts a wrapper function for plugins', async () => {
    function wrapperFunction(srcFn) {
      return () => `*wrapped* ${srcFn()}`;
    }

    const config = metaConfigToWebDevServerConfig({}, threeExistingPlugin, { wrapperFunction });
    expect(config.plugins).to.deep.equal([
      '*wrapped* firstPlugin',
      '*wrapped* secondPlugin',
      '*wrapped* thirdPlugin',
    ]);
  });
});
