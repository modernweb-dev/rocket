import chai from 'chai';
import fetch from 'node-fetch';
import { RocketCli } from '../src/RocketCli.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { expect } = chai;

/**
 * @param {function} method
 * @param {string} errorMessage
 */
async function expectThrowsAsync(method, errorMessage) {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error', 'No error was thrown');
  if (errorMessage) {
    expect(error.message).to.match(errorMessage);
  }
}

describe('RocketCli e2e', () => {
  let cli;

  async function readOutput(
    fileName,
    {
      stripServiceWorker = false,
      stripToBody = false,
      stripStartEndWhitespace = true,
      type = 'build',
    } = {},
  ) {
    const outputDir = type === 'build' ? cli.config.outputDir : cli.config.outputDevDir;
    let text = await fs.promises.readFile(path.join(outputDir, fileName));
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
  }

  async function execute() {
    await cli.setup();
    cli.config.outputDevDir = path.join(__dirname, 'e2e-fixtures', '__output-dev');
    cli.config.devServer.open = false;
    cli.config.devServer.port = 8080;
    cli.config.watch = false;
    cli.config.outputDir = path.join(__dirname, 'e2e-fixtures', '__output');
    await cli.run();
  }

  afterEach(async () => {
    if (cli?.cleanup) {
      await cli.cleanup();
    }
  });

  it('can add a unified plugin via the config', async () => {
    cli = new RocketCli({
      argv: [
        'build',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'unified-plugin', 'rocket.config.js'),
      ],
    });
    await execute();
    const indexHtml = await readOutput('index.html', {
      stripServiceWorker: true,
      stripToBody: true,
    });

    expect(indexHtml).to.equal('<p>See a 🐶</p>');
  });

  describe('eleventy in config', () => {
    it('can modify eleventy via an elventy function in the config', async () => {
      cli = new RocketCli({
        argv: [
          'start',
          '--config-file',
          path.join(__dirname, 'e2e-fixtures', 'content', 'eleventy.rocket.config.js'),
        ],
      });
      await execute();
      const indexHtml = await readOutput('index.html', {
        type: 'start',
      });
      expect(indexHtml).to.equal(
        ['# BEFORE #', '<p>Content inside <code>docs/index.md</code></p>'].join('\n'),
      );
    });

    it('will throw if you try to set options by returning an object', async () => {
      cli = new RocketCli({
        argv: [
          'start',
          '--config-file',
          path.join(__dirname, 'e2e-fixtures', 'content', 'eleventy-return.rocket.config.js'),
        ],
      });

      await expectThrowsAsync(() => execute(), /Error in your Eleventy config file.*/);
    });
  });

  describe('setupDevAndBuildPlugins in config', () => {
    it('can add a rollup plugin via setupDevAndBuildPlugins for build command', async () => {
      cli = new RocketCli({
        argv: [
          'build',
          '--config-file',
          path.join(__dirname, 'e2e-fixtures', 'rollup-plugin', 'devbuild.rocket.config.js'),
        ],
      });
      await execute();
      const inlineModule = await readOutput('e97af63d.js');
      expect(inlineModule).to.equal('var a={test:"data"};console.log(a);');
    });

    it('can add a rollup plugin via setupDevAndBuildPlugins for start command', async () => {
      cli = new RocketCli({
        argv: [
          'start',
          '--config-file',
          path.join(__dirname, 'e2e-fixtures', 'rollup-plugin', 'devbuild.rocket.config.js'),
        ],
      });
      await execute();

      const response = await fetch('http://localhost:8080/test-data.json');
      expect(response.ok).to.be.true; // no server error

      const text = await response.text();
      expect(text).to.equal('export var test = "data";\nexport default {\n\ttest: test\n};\n');
    });
  });

  it('can add a rollup plugin for dev & build and modify a build only plugin via the config', async () => {
    cli = new RocketCli({
      argv: [
        'build',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'rollup-plugin', 'devbuild-build.rocket.config.js'),
      ],
    });
    await execute();
    const inlineModule = await readOutput('e97af63d.js');
    expect(inlineModule).to.equal('var a={test:"data"};console.log(a);');

    const swCode = await readOutput('my-service-worker.js');
    expect(swCode).to.not.be.undefined;
  });

  it('can adjust the inputDir', async () => {
    cli = new RocketCli({
      argv: [
        'start',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'change-input-dir', 'rocket.config.js'),
      ],
    });
    await execute();

    const indexHtml = await readOutput('index.html', {
      type: 'start',
    });
    expect(indexHtml).to.equal('<p>Markdown in <code>docs/page/index.md</code></p>');
  });

  it('can access main rocket config values via {{rocketConfig.value}}', async () => {
    cli = new RocketCli({
      argv: [
        'start',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'rocket-config-in-template', 'rocket.config.js'),
      ],
    });
    await execute();

    const indexHtml = await readOutput('index.html', {
      type: 'start',
    });
    expect(indexHtml).to.equal(
      '<p>You can show rocket config data like rocketConfig.absoluteBaseUrl = http://test-domain.com/</p>',
    );
  });

  it('can add a pathprefix that will not influence the start command', async () => {
    cli = new RocketCli({
      argv: [
        'start',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'content', 'pathprefix.rocket.config.js'),
      ],
    });
    await execute();

    const linkHtml = await readOutput('link/index.html', {
      type: 'start',
    });
    expect(linkHtml).to.equal(
      ['<p><a href="../../">home</a></p>', '<p><a href="/">absolute home</a></p>'].join('\n'),
    );
    const assetHtml = await readOutput('use-assets/index.html', {
      type: 'start',
    });
    expect(assetHtml).to.equal('<link rel="stylesheet" href="/_merged_assets/some.css">');
  });

  it('can add a pathPrefix that will be used in the build command', async () => {
    cli = new RocketCli({
      argv: [
        'build',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'content', 'pathPrefix.rocket.config.js'),
      ],
    });
    await execute();

    const linkHtml = await readOutput('link/index.html', {
      stripServiceWorker: true,
      stripToBody: true,
    });
    expect(linkHtml).to.equal(
      [
        '<p><a href="../../">home</a></p>',
        '<p><a href="/my-sub-folder/">absolute home</a></p>',
      ].join('\n'),
    );
    const assetHtml = await readOutput('use-assets/index.html', {
      stripServiceWorker: true,
    });
    expect(assetHtml).to.equal(
      '<html><head><link rel="stylesheet" href="../41297ffa.css">\n\n\n\n</head><body>\n\n</body></html>',
    );
  });
});
