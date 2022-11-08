import { expect } from 'chai';
import { red, green, gray } from 'colorette';

import { LocalReferencesPlugin, ExternalReferencesPlugin } from 'check-website';
import { setupTestCli } from './test-helpers.js';

function getOptions() {
  return {
    originUrl: 'https://example.com',
    plugins: [new LocalReferencesPlugin()],
  };
}

describe('Config', () => {
  it('01: reads config file', async () => {
    const { execute, capturedLogs, cli } = await setupTestCli(
      'fixtures/06-config/01-change-origin-url/site',
      { plugins: [new LocalReferencesPlugin()] },
      { captureLogs: true },
    );
    await execute();
    expect(cli.options.originUrl).to.equal('https://some-domain.com');
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  it('02: supports skips', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/06-config/02-skips/site',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${gray('1 skipped')}`);
  });

  it('03: supports skips for external', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/06-config/03-skips-external/site',
      { originUrl: 'https://example.com', plugins: [new ExternalReferencesPlugin()] },
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${gray('2 skipped')}`);
  });
});
