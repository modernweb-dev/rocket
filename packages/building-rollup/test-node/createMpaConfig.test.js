import chai from 'chai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';

const { expect } = chai;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {object} config
 */
async function buildAndWrite(config) {
  const bundle = await rollup(config);

  if (Array.isArray(config.output)) {
    await bundle.write(config.output[0]);
    await bundle.write(config.output[1]);
  } else {
    await bundle.write(config.output);
  }
}

async function execute(configString) {
  const configPath = path.join(__dirname, 'fixtures', configString.split('/').join(path.sep));
  const config = (await import(configPath)).default;
  await buildAndWrite(config);

  return async (
    fileName,
    { stripServiceWorker = false, stripToBody = false, stripStartEndWhitespace = true } = {},
  ) => {
    let text = await fs.promises.readFile(
      path.join(config.output.dir, fileName.split('/').join(path.sep)),
    );
    text = text.toString();
    if (stripToBody) {
      const bodyOpenTagEnd = text.indexOf('>', text.indexOf('<body') + 1) + 1;
      const bodyCloseTagStart = text.indexOf('</body>');
      text = text.substring(bodyOpenTagEnd, bodyCloseTagStart);
    }
    if (stripServiceWorker) {
      const scriptOpenTagEnd = text.indexOf('<script inject-service-worker');
      const scriptCloseTagStart = text.indexOf('</script>', scriptOpenTagEnd) + 9;
      text = text.substring(0, scriptOpenTagEnd) + text.substring(scriptCloseTagStart);
    }
    if (stripStartEndWhitespace) {
      text = text.trim();
    }
    return text;
  };
}

describe('createMapConfig', () => {
  it('bundles files', async () => {
    const readOutput = await execute('mpa/rollup.mpa.config.js');

    const indexHtml = await readOutput('index.html', {
      stripToBody: true,
      stripServiceWorker: true,
    });
    expect(indexHtml).to.equal('<h1>Only static HTML content in index.html</h1>');

    const subHtmlIndexHtml = await readOutput('sub-html/index.html', {
      stripToBody: true,
      stripServiceWorker: true,
    });
    expect(subHtmlIndexHtml).to.equal('<h1>Only static HTML content in sub-html/index.html</h1>');

    const subJsIndexHtml = await readOutput('sub-js/index.html', {
      stripToBody: true,
      stripServiceWorker: true,
    });
    expect(subJsIndexHtml).to.equal(
      '<h1>Has js in sub-js/index.html</h1>\n\n\n<script type="module" src="../sub-js.js"></script>',
    );

    const serviceWorkerJs = await readOutput('service-worker.js');
    expect(serviceWorkerJs).to.include('Promise'); // not empty string might be enough...
  });
});
