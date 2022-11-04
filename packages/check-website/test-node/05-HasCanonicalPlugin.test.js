import { expect } from 'chai';
import { red, green } from 'colorette';

import { HasCanonicalPlugin } from 'check-website';
import { setupTestCli } from './test-helpers.js';

function getOptions() {
  return {
    originUrl: 'https://example.com',
    plugins: [new HasCanonicalPlugin()],
  };
}

describe('HasCanonicalPlugin', () => {
  it('01: with a canonical', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/05-HasCanonicalPlugin/01-with-canonical',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}`);
  });

  it('02: without a canonical', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/05-HasCanonicalPlugin/02-without-canonical',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${red('1 failed')}`);
  });
});
