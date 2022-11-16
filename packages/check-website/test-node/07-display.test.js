import { expect } from 'chai';

import { LocalReferencesPlugin, ExternalReferencesPlugin } from 'check-website';
import { setupTestCli } from './test-helpers.js';

function getOptions() {
  return {
    originUrl: 'https://example.com',
    plugins: [new LocalReferencesPlugin(), new ExternalReferencesPlugin()],
  };
}

describe('Display', () => {
  it('01: duration is correct for multiple plugins', async () => {
    const { execute, capturedLogs } = await setupTestCli(
      'fixtures/07-display/01-duration',
      getOptions(),
      { captureLogs: true },
    );
    await execute();

    const lastDynamic = capturedLogs
      .join('\n')
      .split('────────────────────────────────────────────────────────────────────────────────')
      // @ts-ignore
      .at(-1);
    const matches = lastDynamic.match(/\| 1\/1 links \| 🕑 (.*)s \|/g);

    expect(matches).to.have.lengthOf(2);
    expect(matches[0]).to.not.equal(matches[1]);
  });
});
