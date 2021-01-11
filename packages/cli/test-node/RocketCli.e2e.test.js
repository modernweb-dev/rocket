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

  function readStartOutput(fileName, options = {}) {
    options.type = 'start';
    return readOutput(fileName, options);
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

  async function executeStart(pathToConfig) {
    cli = new RocketCli({
      argv: [
        'start',
        '--config-file',
        path.join(__dirname, pathToConfig.split('/').join(path.sep)),
      ],
    });
    await execute();
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
      '<html><head><link rel="stylesheet" href="../41297ffa.css">\n\n</head><body>\n\n</body></html>',
    );
  });

  it('will extract a title from markdown and set first folder as section', async () => {
    cli = new RocketCli({
      argv: [
        'start',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'headlines', 'rocket.config.js'),
      ],
    });
    await execute();

    const indexHtml = await readOutput('index.html', {
      type: 'start',
    });
    const [indexTitle, indexSection] = indexHtml.split('\n');
    expect(indexTitle).to.equal('Root');
    expect(indexSection).to.be.undefined;

    const subHtml = await readOutput('sub/index.html', {
      type: 'start',
    });
    const [subTitle, subSection] = subHtml.split('\n');
    expect(subTitle).to.equal('Root: Sub');
    expect(subSection).to.equal('sub');

    const subSubHtml = await readOutput('sub/subsub/index.html', {
      type: 'start',
    });
    const [subSubTitle, subSubSection] = subSubHtml.split('\n');
    expect(subSubTitle).to.equal('Sub: SubSub');
    expect(subSubSection).to.equal('sub');

    const sub2Html = await readOutput('sub2/index.html', {
      type: 'start',
    });
    const [sub2Title, sub2Section] = sub2Html.split('\n');
    expect(sub2Title).to.equal('Root: Sub2');
    expect(sub2Section).to.equal('sub2');

    const withDataHtml = await readOutput('with-data/index.html', {
      type: 'start',
    });
    const [withDataTitle, withDataSection] = withDataHtml.split('\n');
    expect(withDataTitle).to.equal('Set via data');
    expect(withDataSection).be.undefined;
  });

  it('will create a social media image for every page', async () => {
    cli = new RocketCli({
      argv: [
        'start',
        '--config-file',
        path.join(__dirname, 'e2e-fixtures', 'social-images', 'rocket.config.js'),
      ],
    });
    await execute();

    const indexHtml = await readOutput('index.html', {
      type: 'start',
    });
    expect(indexHtml).to.equal('/_merged_assets/11ty-img/c0a892f2-1200.png');

    const guidesHtml = await readOutput('guides/first-pages/getting-started/index.html', {
      type: 'start',
    });
    expect(guidesHtml).to.equal('/_merged_assets/11ty-img/58b7e437-1200.png');
  });

  it('will add "../" for links and image urls only within named template files', async () => {
    await executeStart('e2e-fixtures/image-link/rocket.config.js');

    const namedMdContent = [
      '<p><a href="../">Root</a>',
      '<a href="../guides/#with-anchor">Guides</a>',
      '<a href="../one-level/raw/">Raw</a>',
      '<a href="../../up-one-level/template/">Template</a>',
      '<img src="../images-one-level/my-img.svg" alt="my-img">',
      '<img src="/absolute-img.svg" alt="absolute-img"></p>',
    ];

    const namedHtmlContent = [
      '<div>',
      '  <a href="../">Root</a>',
      '  <a href="../guides/#with-anchor">Guides</a>',
      '  <a href="../one-level/raw/">Raw</a>',
      '  <a href="../../up-one-level/template/">Template</a>',
      '  <img src="../images-one-level/my-img.svg" alt="my-img">',
      '  <img src="/absolute-img.svg" alt="absolute-img">',
      '  <picture>',
      '    <source media="(min-width:465px)" srcset="../picture-min-465.jpg">',
      '    <img src="../../images-up-one-level/picture-fallback.jpg" alt="Fallback" style="width:auto;">',
      '  </picture>',
      '</div>',
    ];

    const rawHtml = await readStartOutput('raw/index.html');
    expect(rawHtml, 'raw/index.html does not match').to.equal(namedHtmlContent.join('\n'));

    const templateHtml = await readStartOutput('template/index.html');
    expect(templateHtml, 'template/index.html does not match').to.equal(
      namedHtmlContent.join('\n'),
    );

    const guidesHtml = await readStartOutput('guides/index.html');
    expect(guidesHtml, 'guides/index.html does not match').to.equal(
      [...namedMdContent, ...namedHtmlContent].join('\n'),
    );

    const noAdjustHtml = await readStartOutput('no-adjust/index.html');
    expect(noAdjustHtml, 'no-adjust/index.html does not match').to.equal(
      '<p>Nothing to adjust in here</p>',
    );

    // for index files no '../' will be added
    const indexHtml = await readStartOutput('index.html');
    expect(indexHtml, 'index.html does not match').to.equal(
      [
        '<p><a href="./">Root</a>',
        '<a href="guides/#with-anchor">Guides</a>',
        '<a href="./one-level/raw/">Raw</a>',
        '<a href="../up-one-level/template/">Template</a>',
        '<img src="./images-one-level/my-img.svg" alt="my-img">',
        '<img src="/absolute-img.svg" alt="absolute-img"></p>',
        '<div>',
        '  <a href="./">Root</a>',
        '  <a href="guides/#with-anchor">Guides</a>',
        '  <a href="./one-level/raw/">Raw</a>',
        '  <a href="../up-one-level/template/">Template</a>',
        '  <img src="./images-one-level/my-img.svg" alt="my-img">',
        '  <img src="/absolute-img.svg" alt="absolute-img">',
        '  <picture>',
        '    <source media="(min-width:465px)" srcset="./picture-min-465.jpg">',
        '    <img src="../images-up-one-level/picture-fallback.jpg" alt="Fallback" style="width:auto;">',
        '  </picture>',
        '</div>',
      ].join('\n'),
    );
  });
});
