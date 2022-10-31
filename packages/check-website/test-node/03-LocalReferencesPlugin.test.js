import { expect } from 'chai';
import { red, green } from 'colorette';

import { LocalReferencesPlugin } from 'check-website';
import { setupTestCli } from './test-helpers.js';

function getOptions() {
  return {
    originUrl: 'https://example.com',
    plugins: [new LocalReferencesPlugin()],
  };
}

describe('LocalReferencesPlugin', () => {
  it('01: finds a missing page', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/01-page-missing',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  it('01b: finds a variation of missing pages', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/01b-page-missing-variations',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('6 passed')}, ${red('4 failed')}`);
  });

  it('02: finds a missing hash', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/02-hash-missing',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  it('03: can identify full urls as internal', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/03-absolute-url-as-internal',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  it('04: automatically finds internal base url via canonical url', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/04-auto-finds-internal-base-url',
      { plugins: [new LocalReferencesPlugin()] },
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('2 passed')}, ${red('1 failed')}`);
  });

  it('05: missing asset text file', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/05-asset-missing',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  it('06: starts crawling from the root index.html and ignores unlinked pages', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/06-crawls-from-root-index',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('2 failed')}`);
  });

  it('07: allow to mix urls with www and none www prefix', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/07-mix-www-and-none-www',
      { plugins: [new LocalReferencesPlugin()] },
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('3 passed')}, ${red('1 failed')}`);
  });

  it('08: handle url in a case insensitive way', async () => {
    const { capturedLogs, execute } = await setupTestCli(
      'fixtures/03-LocalReferencesPlugin/08-handle-urls-case-insensitive',
      { plugins: [new LocalReferencesPlugin()] },
      { captureLogs: true },
    );
    await execute();
    // tests today-I-learned vs today-i-learned
    expect(capturedLogs.join('\n')).to.include(`${green('2 passed')}, ${red('1 failed')}`);
  });
});
