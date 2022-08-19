import chai from 'chai';
import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Build', () => {
  it('01: copy public files', async () => {
    const { build, readOutput, outputExists, readDevOutput } = await setupTestCli({
      cwd: 'fixtures/02-build/01-copy-public-files/',
      options: {
        buildOptimize: true,
      },
      testOptions: { captureLogs: true },
    });
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<html>',
        '  <head> </head>',
        '  <body>',
        '    Hello World!',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readDevOutput('index.html')).to.equal('Hello World!');

    expect(outputExists('favicon.ico')).to.be.true;
  });
});
