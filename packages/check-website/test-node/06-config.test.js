import { expect } from 'chai';
import { red, green } from 'colorette';

import { LocalReferencesPlugin } from 'check-website';
import { setupTestCli } from './test-helpers.js';

function getOptions() {
  return {
    plugins: [new LocalReferencesPlugin()],
  };
}

describe('Config', () => {
  it('01: reads config file', async () => {
    const { execute, capturedLogs, cli } = await setupTestCli(
      'fixtures/06-config/01-change-origin-url/site',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(cli.options.originUrl).to.equal('https://some-domain.com');
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });
});
