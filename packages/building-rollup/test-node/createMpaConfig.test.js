import chai from 'chai';
import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';

const { expect } = chai;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {import('@rocket/building-rollup').BuildingRollupOptions} config
 */
async function buildAndWrite(config) {
  const bundle = await rollup(config);

  if (Array.isArray(config.output)) {
    await bundle.write(config.output[0]);
    await bundle.write(config.output[1]);
  } else if (config.output) {
    await bundle.write(config.output);
  }
}

/**
 * @param {string} configString
 * @returns
 */
async function execute(configString) {
  const configPath = path.join(__dirname, 'fixtures', configString.split('/').join(path.sep));
  const config = (await import(configPath)).default;
  await buildAndWrite(config);

  /**
   * @param {string} fileName
   */
  return async (fileName, { stripToBody = false, stripStartEndWhitespace = true } = {}) => {
    let text = (
      await readFile(path.join(config.output.dir, fileName.split('/').join(path.sep)))
    ).toString();
    if (stripToBody) {
      const bodyOpenTagEnd = text.indexOf('>', text.indexOf('<body') + 1) + 1;
      const bodyCloseTagStart = text.indexOf('</body>');
      text = text.substring(bodyOpenTagEnd, bodyCloseTagStart);
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
    });
    expect(indexHtml).to.equal('<h1>Only static HTML content in index.html</h1>');

    const subHtmlIndexHtml = await readOutput('sub-html/index.html', {
      stripToBody: true,
    });
    expect(subHtmlIndexHtml).to.equal('<h1>Only static HTML content in sub-html/index.html</h1>');

    const subJsIndexHtml = await readOutput('sub-js/index.html', {
      stripToBody: true,
    });
    expect(subJsIndexHtml).to.equal(
      '<h1>Has js in sub-js/index.html</h1>\n\n\n<script type="module" src="../sub-js.js"></script>',
    );

    const subJsAbsoluteIndexHtml = await readOutput('sub-js-absolute/index.html', {
      stripToBody: true,
    });
    expect(subJsAbsoluteIndexHtml).to.equal(
      '<h1>Has js in sub-js-absolute/index.html</h1>\n\n\n<script type="module" src="../sub-js-absolute.js"></script>',
    );
  });
});
