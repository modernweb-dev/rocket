import chai from 'chai';
import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Config', () => {
  it('01: no config file', async () => {
    const {
      build,
      readOutput,
      readDevOutput,
    } = await setupTestCli('fixtures/01-config/01-no-config/', undefined, { buildOptimize: true });
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
  });

  it('02: change input dir', async () => {
    const { build, readDevOutput } = await setupTestCli('fixtures/01-config/02-change-input-dir/');
    await build();

    expect(readDevOutput('index.html')).to.equal(['Hello World!'].join('\n'));
  });
});
