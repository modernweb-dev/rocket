import chai from 'chai';
import chalk from 'chalk';
import path from 'path';
import { executeUpgrade, setFixtureDir } from '@rocket/cli/test-helpers';
import { move, remove } from 'fs-extra';
import { existsSync } from 'fs';

const { expect } = chai;

describe('Upgrade System', () => {
  let cli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cli?.cleanup) {
      await cli.cleanup();
    }
    if (cli?.config._inputDirCwdRelative) {
      const backupDir = path.join(cli.config._inputDirCwdRelative, '..', 'docs_backup');
      if (existsSync(backupDir)) {
        await remove(cli.config._inputDirCwdRelative);
        await move(backupDir, cli.config._inputDirCwdRelative);
      }
    }
  });

  it('2021-09-menu', async () => {
    const run = await executeUpgrade('fixtures-upgrade/2021-09-menu/rocket.config.js');
    cli = run.cli;
    expect(run.fileExists('index.md')).to.be.true;
    expect(run.fileExists('31--components/index.md')).to.be.true;
    expect(await run.readFile('31--components/index.md')).to.equal(
      [
        '---',
        'menu:',
        '  linkText: Components',
        '---',
        '',
        '# Component Directory',
        '',
        'Here you get started.',
        '',
      ].join('\n'),
    );

    expect(run.fileExists('31--components/10--content/20--accordion/overview.md')).to.be.false;
    expect(run.fileExists('31--components/10--content/20--accordion/10--overview.md')).to.be.true;
    expect(await run.readFile('31--components/10--content/20--accordion/10--overview.md')).to.equal(
      '# Overview\n',
    );
  });
});
