import chai from 'chai';
import chalk from 'chalk';
import { execute, trimWhiteSpace, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli mergeTemplates', () => {
  let cleanupCli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cleanupCli?.cleanup) {
      await cleanupCli.cleanup();
    }
  });

  it('merges it in the defined order', async () => {
    const { cli, readOutput } = await execute('merge-templates-fixtures/order/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(trimWhiteSpace(indexHtml)).to.equal(
      [
        '<p>30-first</p>',
        '<p>100-second</p>',
        '<p>bar-third</p>',
        '<p>foo-fourth</p>',
        '<p>10100-last</p>',
      ].join('\n'),
    );
  });

  it('presets can overwrite in order', async () => {
    const { cli, readOutput } = await execute(
      'merge-templates-fixtures/overwrite/rocket.config.js',
      { captureLog: true },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(trimWhiteSpace(indexHtml)).to.equal(
      ['<p>overwritten second</p>', '<p>third</p>', '<p>overwritten first to be last</p>'].join(
        '\n',
      ),
    );
  });

  it('presets can add inbetween', async () => {
    const { cli, readOutput } = await execute('merge-templates-fixtures/add/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(trimWhiteSpace(indexHtml)).to.equal(
      [
        '<p>first</p>',
        '<p>between first and second</p>',
        '<p>second</p>',
        '<p>third</p>',
        '<p>last</p>',
      ].join('\n'),
    );
  });
});
