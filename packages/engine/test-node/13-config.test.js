import chai from 'chai';
import proxy from 'koa-proxy';
import http from 'http';
import rollupJson from '@rollup/plugin-json';
import { addPlugin } from 'plugins-manager';
import { setupTestEngine } from './test-helpers.js';
import { fromRollup } from '@web/dev-server-rollup';

const { expect } = chai;

const json = fromRollup(rollupJson);

describe('Config', () => {
  it('01: can add a rollup plugin', async () => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/13-config/01-add-rollup-plugin/docs',
      {
        setupDevServerPlugins: [addPlugin(json, {}, { location: 'bottom' })],
        adjustDevServerOptions: options => ({
          ...options,
          mimeTypes: {
            // serve all json files as js
            '**/*.json': 'js',
          },
        }),
      },
    );
    await engine.start();

    const { port } = engine.devServer.config;

    const response = await fetch(`http://localhost:${port}/test-data.json`);
    expect(response.ok).to.be.true; // no server error

    const text = await response.text();
    expect(text).to.equal('export var test = "data";\nexport default {\n\ttest: test\n};\n');

    await cleanup();
  });

  it('02: can add a middleware (api proxy) to the dev server', async () => {
    const { cleanup, engine } = await setupTestEngine(
      'fixtures/13-config/02-add-middleware/pages',
      {
        setupDevServerMiddleware: [
          addPlugin(proxy, {
            host: 'http://localhost:9000/',
            match: /^\/api\//,
          }),
        ],
      },
    );
    const apiServer = http.createServer((request, response) => {
      if (request.url === '/api/message') {
        response.writeHead(200);
        response.end('Hello from API');
      }
    });
    apiServer.listen(9000);

    await engine.start();
    const { port } = engine.devServer.config;

    const apiResponse = await fetch(`http://localhost:9000/api/message`).then(res => res.text());
    expect(apiResponse).to.equal('Hello from API');

    const contentResponse = await fetch(`http://localhost:${port}/`).then(res => res.text());
    expect(contentResponse).to.equal('<p>content</p>');

    const response = await fetch(`http://localhost:${port}/api/message`).then(res => res.text());
    expect(response).to.equal('Hello from API');

    apiServer.close();
    await cleanup();
  });

  it('03: can add a comment to lines longer then x characters in the file header', async () => {
    const { build, readSource } = await setupTestEngine(
      'fixtures/13-config/03-long-file-header-comment/pages',
      {
        longFileHeaderWidth: 100,
        longFileHeaderComment: '// prettier-ignore',
      },
    );

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
        'export default () => `',
        '  This will be a very long line that will explain a complex topic in multiple paragraphs. The level of detail is important.',
        '  <my-el></my-el>',
        '`;',
        '',
      ].join('\n'),
    );
  });
});
