import { expect } from 'chai';
import { red, green } from 'colorette';

import { ExternalReferencesPlugin } from 'check-website';
import { setupTestCli } from './test-helpers.js';

function getOptions() {
  return {
    originUrl: 'https://example.com',
    plugins: [new ExternalReferencesPlugin()],
  };
}

describe('ExternalReferencePlugin', () => {
  it('01: finds a missing page', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/04-ExternalReferencePlugin/01-page-missing',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  // it('02: finds a missing hash', async () => {
  //   const { cli } = await setupTestCli('fixtures/04-ExternalReferencePlugin/02-hash-missing');
  //   await cli.start();
  // });

  it('03: image service using a none http url', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/04-ExternalReferencePlugin/03-image-service-none-http',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(capturedLogs.join('\n')).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });

  it('04: data urls are not interpreted as external', async () => {
    const { execute, getLastDynamicLog } = await setupTestCli(
      'fixtures/04-ExternalReferencePlugin/04-data-urls-are-not-external',
      getOptions(),
      { captureLogs: true },
    );
    await execute();
    expect(getLastDynamicLog()).to.include(`${green('1 passed')}, ${red('1 failed')}`);
  });
});
