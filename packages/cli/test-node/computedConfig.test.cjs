const { expect } = require('chai');

const { getComputedConfig, setComputedConfig } = require('../src/public/computedConfig.cjs');

describe('computedConfig', () => {
  it('does not reset its value if file is required multiple times', () => {
    setComputedConfig({ setInTest: true });
    expect(getComputedConfig()).to.deep.equal({ setInTest: true });

    if (process.platform === 'win32' || process.platform === 'darwin') {
      // simulate a separate request to the same file (on windows/mac as not case sensitive while node is)
      const { getComputedConfig: getComputedConfig2 } = require('../src/public/ComputedConfig.cjs');
      expect(getComputedConfig2()).to.deep.equal({ setInTest: true });
    }
  });
});
