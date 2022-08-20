import chai from 'chai';
import { white, bold, gray } from 'colorette';

import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Preview', () => {
  it('01: Preview Message', async () => {
    const { cli, capturedLogs, cleanup } = await setupTestCli({
      cwd: 'fixtures/06-preview/01-preview-message',
      cliOptions: ['preview'],
      testOptions: { captureLogs: true },
    });

    await cli.start();
    await cleanup();

    expect(capturedLogs[0]).to.equal(`${bold(`👀 Previewing Production Build`)}`);
    expect(capturedLogs[1]).to.equal('');
    expect(capturedLogs[2].startsWith(`${white('  🚧 Local:')}`)).to.be.true;
    expect(capturedLogs[3].startsWith(`${white('  🌐 Network:')}`)).to.be.true;
    expect(capturedLogs[4].startsWith(`${white('  📝 Source:')}`)).to.be.true;
    expect(capturedLogs[5]).to.equal('');
    expect(capturedLogs[6]).to.equal(
      `${gray(
        'If what you see works as expected then you can upload "source" to your production web server.',
      )}`,
    );
  });

  it('02: Error Message if there is no build output', async () => {
    const { cli, capturedLogs, cleanup } = await setupTestCli({
      cwd: 'fixtures/06-preview/02-error-no-build',
      cliOptions: ['preview'],
      testOptions: { captureLogs: true },
    });

    await cli.start();
    await cleanup();

    expect(capturedLogs[0]).to.equal(`${bold(`👀 Previewing Production Build`)}`);
    expect(capturedLogs[1]).to.equal('');
    expect(capturedLogs[2].startsWith(`  🛑 No index.html found in the build directory`)).to.be
      .true;
    expect(capturedLogs[3]).to.equal('  🤔 Did you forget to run `rocket build` before?');
    expect(capturedLogs[4]).to.equal('');
  });
});
