/* eslint-disable no-unsafe-optional-chaining */
import chai from 'chai';
import http from 'http';
import fetch from 'node-fetch';
import { setupTestCli } from './test-helpers.js';

const { expect } = chai;

describe('Config', () => {
  it('01: no config file', async () => {
    const { build, readOutput, readDevOutput } = await setupTestCli({
      cwd: 'fixtures/01-config/01-no-config/',
      options: { buildOptimize: true },
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
  });

  it('02: change input dir', async () => {
    const { build, readDevOutput } = await setupTestCli({
      cwd: 'fixtures/01-config/02-change-input-dir/',
      testOptions: { captureLogs: true },
    });
    await build();

    expect(readDevOutput('index.html')).to.equal(['Hello World!'].join('\n'));
  });

  it('03: can add a middleware (api proxy) to the dev server', async () => {
    const { cleanup, cli } = await setupTestCli({
      cwd: 'fixtures/01-config/03-add-middleware/',
      cliOptions: ['start'],
      testOptions: { captureLogs: true },
    });
    const apiServer = http.createServer((request, response) => {
      if (request.url === '/api/message') {
        response.writeHead(200);
        response.end('Hello from API');
      }
    });
    apiServer.listen(9000);

    await cli.start();
    const { port } = cli?.activePlugin?.engine.devServer.config;

    const apiResponse = await fetch(`http://localhost:9000/api/message`).then(res => res.text());
    expect(apiResponse).to.equal('Hello from API');

    const response = await fetch(`http://localhost:${port}/api/message`).then(res => res.text());
    expect(response).to.equal('Hello from API');

    apiServer.close();
    await cleanup();
  });

  it('04: can add a rollup plugin via setupDevServerAndBuildPlugins to build', async () => {
    const { build, readOutput } = await setupTestCli({
      cwd: 'fixtures/01-config/04-add-rollup-plugin/',
      options: { buildOptimize: true },
      testOptions: { captureLogs: true },
    });
    await build();
    const inlineModule = await readOutput('e97af63d.js', { format: false });
    expect(inlineModule).to.equal('var a={test:"data"};console.log(a);\n');
  });

  it('04a: can add a rollup plugin via setupDevServerAndBuildPlugins to start', async () => {
    const { cli, cleanup } = await setupTestCli({
      cwd: 'fixtures/01-config/04-add-rollup-plugin/',
      cliOptions: ['start'],
      testOptions: { captureLogs: true },
    });
    await cli.start();
    const { port } = cli?.activePlugin?.engine.devServer.config;

    const response = await fetch(`http://localhost:${port}/copy-for-test.json`);
    expect(response.ok).to.be.true; // no server error

    const text = await response.text();
    expect(text).to.equal('export var test = "data";\nexport default {\n\ttest: test\n};\n');

    await cleanup();
  });

  it('05: long file header comments', async () => {
    const { build, readSource } = await setupTestCli({
      cwd: 'fixtures/01-config/05-long-file-header-comment/',
      testOptions: { captureLogs: true },
    });
    await build();

    expect(readSource('index.rocket.js', { format: false })).to.equal(
      [
        '/* START - Rocket auto generated - do not touch */',
        "export const sourceRelativeFilePath = 'index.rocket.js';",
        '// prettier-ignore',
        "import { veryLongFileHeaderValue, multipleLongFileHeaderValues, fakeHtml, fakeComponents, fakeLayout, components } from './local.data.js';",
        '// prettier-ignore',
        'export { veryLongFileHeaderValue, multipleLongFileHeaderValues, fakeHtml, fakeComponents, fakeLayout, components };',
        'export async function registerCustomElements() {',
        '  // server-only components',
        '  // prettier-ignore',
        "  customElements.define('my-el', await import('@test/components').then(m => m.MyVeryLongElementName));",
        '}',
        '/* END - Rocket auto generated - do not touch */',
        '',
        "export default () => '<my-el></my-el>';",
        '',
      ].join('\n'),
    );
  });
});
