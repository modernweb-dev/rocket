import chai from 'chai';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { execute, expectThrowsAsync, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli e2e', () => {
  let cleanupCli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cleanupCli?.cleanup) {
      await cleanupCli.cleanup();
    }
  });

  describe('setupDevAndBuildPlugins in config', () => {
    it('can add a rollup plugin via setupDevAndBuildPlugins for build command', async () => {
      const { cli, readOutput } = await execute(
        'e2e-fixtures/rollup-plugin/devbuild.rocket.config.js',
        {
          captureLog: true,
          type: 'build',
        },
      );
      cleanupCli = cli;
      const inlineModule = await readOutput('e97af63d.js');
      expect(inlineModule).to.equal('var a={test:"data"};console.log(a);');
    });

    it('can add a rollup plugin via setupDevAndBuildPlugins for start command', async () => {
      const { cli } = await execute('e2e-fixtures/rollup-plugin/devbuild.rocket.config.js', {
        captureLog: true,
      });
      cleanupCli = cli;

      const response = await fetch('http://localhost:8080/test-data.json');
      expect(response.ok).to.be.true; // no server error

      const text = await response.text();
      expect(text).to.equal('export var test = "data";\nexport default {\n\ttest: test\n};\n');
    });
  });

  it('can add a rollup plugin for dev & build and modify a build only plugin via the config', async () => {
    const { cli, readOutput } = await execute(
      'e2e-fixtures/rollup-plugin/devbuild-build.rocket.config.js',
      {
        captureLog: true,
        type: 'build',
      },
    );
    cleanupCli = cli;
    const inlineModule = await readOutput('e97af63d.js');
    expect(inlineModule).to.equal('var a={test:"data"};console.log(a);');
  });

  it('can adjust the inputDir', async () => {
    const { cli, readOutput } = await execute('e2e-fixtures/change-input-dir/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.equal('<p>Markdown in <code>docs/page/index.md</code></p>');
  });

  it('can add a pathPrefix that will not influence the start command', async () => {
    const { cli, readOutput } = await execute('e2e-fixtures/content/pathPrefix.rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const linkHtml = await readOutput('link/index.html');
    expect(linkHtml).to.equal(
      ['<p><a href="../">home</a></p>', '<p><a href="/">absolute home</a></p>'].join('\n'),
    );
    const assetHtml = await readOutput('use-assets/index.html');
    expect(assetHtml).to.equal('<link rel="stylesheet" href="/_merged_assets/some.css">');
    const imageHtml = await readOutput('image/index.html', { replaceImageHashes: true });
    expect(imageHtml).to.equal(
      [
        '<p>',
        '      <figure>',
        '        <picture>',
        '<source type="image/avif" srcset="/images/__HASH__-600.avif 600w, /images/__HASH__-900.avif 900w" sizes="100vw">',
        '<source type="image/jpeg" srcset="/images/__HASH__-600.jpeg 600w, /images/__HASH__-900.jpeg 900w" sizes="100vw">',
        '          <img',
        '            alt="My Image Alternative Text" rocket-image="responsive"',
        '            src="/images/__HASH__-600.jpeg"',
        '            ',
        '            ',
        '            width="600"',
        '            height="316"',
        '            loading="lazy"',
        '            decoding="async"',
        '          />',
        '        </picture>',
        '      <figcaption>My Image Description</figcaption>',
        '</figure>',
        '    </p>',
      ].join('\n'),
    );
  });

  it('can add a pathPrefix that will be used in the build command', async () => {
    const { cli, readOutput } = await execute('e2e-fixtures/content/pathPrefix.rocket.config.js', {
      captureLog: true,
      type: 'build',
    });
    cleanupCli = cli;

    const linkHtml = await readOutput('link/index.html', {
      stripToBody: true,
    });
    expect(linkHtml).to.equal(
      ['<p><a href="../">home</a></p>', '<p><a href="/my-sub-folder/">absolute home</a></p>'].join(
        '\n',
      ),
    );
    const assetHtml = await readOutput('use-assets/index.html');
    expect(assetHtml).to.equal(
      '<html><head><link rel="stylesheet" href="../41297ffa.css">\n\n</head><body>\n\n</body></html>',
    );
    let imageHtml = await readOutput('image/index.html');
    imageHtml = imageHtml.replace(/\.\.\/([a-z0-9]+)\./g, '../__HASH__.');
    expect(imageHtml).to.equal(
      [
        '<html><head>',
        '</head><body><p>',
        '      </p><figure>',
        '        <picture>',
        '<source type="image/avif" srcset="../__HASH__.avif 600w, ../__HASH__.avif 900w" sizes="100vw">',
        '<source type="image/jpeg" srcset="../__HASH__.jpeg 600w, ../__HASH__.jpeg 900w" sizes="100vw">',
        '          <img alt="My Image Alternative Text" rocket-image="responsive" src="../__HASH__.jpeg" width="600" height="316" loading="lazy" decoding="async">',
        '        </picture>',
        '      <figcaption>My Image Description</figcaption>',
        '</figure>',
        '    <p></p>',
        '',
        '',
        '</body></html>',
      ].join('\n'),
    );
  });

  it('smoke test for link checking', async () => {
    await expectThrowsAsync(
      () => execute('e2e-fixtures/lint-links/rocket.config.js', { captureLog: true, type: 'lint' }),
      {
        errorMatch: /Found 1 missing reference targets/,
      },
    );
  });

  it('can completely take over the rollup config', async () => {
    const { cli, readOutput } = await execute('e2e-fixtures/rollup-override/rocket.config.js', {
      captureLog: true,
      type: 'build',
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html', {
      stripToBody: true,
      formatHtml: true,
    });
    expect(indexHtml).to.equal(
      [
        '<h1 id="importing-foo">',
        '  <a aria-hidden="true" tabindex="-1" href="#importing-foo"><span class="icon icon-link"></span></a',
        '  >Importing foo',
        '</h1>',
        '',
        '<script type="module" src="./7338509a.js" mdjs-setup=""></script>',
      ].join('\n'),
    );
  });
});
