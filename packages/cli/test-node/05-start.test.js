import chai from 'chai';
import { white, bold } from 'colorette';

import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Start', () => {
  it('Start Message', async () => {
    const { cli, capturedLogs, cleanup } = await setupTestCli({
      cwd: 'fixtures/05-start/01-start-message',
      cliOptions: ['start'],
      testOptions: { captureLogs: true },
    });

    await cli.start();
    await cleanup();

    expect(capturedLogs[0].startsWith(`${bold(`🚀 Rocket Engine`)} `)).to.be.true;
    expect(capturedLogs[1]).to.equal('');
    expect(capturedLogs[2].startsWith(`${white('  🚧 Local:')}`)).to.be.true;
    expect(capturedLogs[3].startsWith(`${white('  🌐 Network:')}`)).to.be.true;
    expect(capturedLogs[4]).to.equal('');
  });
});
