import chai from 'chai';
import { createBasicConfig, createSpaConfig, createMpaConfig } from '@rocket/building-rollup';

const { expect } = chai;

describe('plugin count', () => {
  it('createBasicConfig has 3 plugins', () => {
    const config = createBasicConfig();
    expect(config.plugins.length).to.equal(3);
  });

  it('createSpaConfig has 6 plugins', () => {
    const config = createSpaConfig();
    expect(config.plugins.length).to.equal(6);
  });

  it('createMpaConfig has 6 plugins', () => {
    const config = createMpaConfig();
    expect(config.plugins.length).to.equal(6);
  });
});
