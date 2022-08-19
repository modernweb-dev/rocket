import chai from 'chai';
import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Upgrade System', () => {
  it('2021-09-menu', async () => {
    const { build, sourceExists, readSource, backupOrRestoreSource, restoreSource } =
      await setupTestCli({
        cwd: 'fixtures/03-upgrade/2022-03-menu',
        cliOptions: ['upgrade'],
        testOptions: { captureLogs: true },
      });
    await backupOrRestoreSource();

    await build();

    expect(sourceExists('index.rocket.md')).to.be.true;
    expect(sourceExists('31--components/index.rocket.md')).to.be.true;
    expect(readSource('31--components/index.rocket.md')).to.equal(
      [
        '```js server',
        "export const menuLinkText = 'Components';",
        '```',
        '',
        '# Component Directory',
        '',
        'Here you get started.',
      ].join('\n'),
    );

    expect(sourceExists('31--components/10--content/20--accordion/overview.rocket.md')).to.be.false;
    expect(sourceExists('31--components/10--content/20--accordion/10--overview.rocket.md')).to.be
      .true;
    expect(readSource('31--components/10--content/20--accordion/10--overview.rocket.md')).to.equal(
      '# Overview',
    );

    await restoreSource();
  });
});
