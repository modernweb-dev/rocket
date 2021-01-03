import chai from 'chai';
import { RocketCli } from '../src/RocketCli.js';
import computedConfig from '../src/public/computedConfig.cjs';

const { expect } = chai;

const { getComputedConfig } = computedConfig;

describe('RocketCli', () => {
  let cli;

  afterEach(async () => {
    if (cli?.cleanup) {
      await cli.cleanup();
    }
  });

  it('has the default command help', async () => {
    cli = new RocketCli({ argv: [] });
    await cli.setup();
    expect(cli.config.command).to.equal('help');
  });

  it('does accept a command as the 2nd parameter', async () => {
    cli = new RocketCli({ argv: ['build'] });
    await cli.setup();
    expect(cli.config.command).to.equal('build');
  });

  it('does stores the computed config', async () => {
    cli = new RocketCli();
    await cli.setup();
    expect(getComputedConfig()).to.not.deep.equal({});
  });
});
