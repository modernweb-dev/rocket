import chai from 'chai';
import fetch from 'node-fetch';
import chalk from 'chalk';
import {
  executeBootstrap,
  executeBuild,
  executeLint,
  executeStart,
  expectThrowsAsync,
  readBuildOutput,
  readStartOutput,
  getfixtureExpectedFiles,
  setFixtureDir,
} from '@rocket/cli/test-helpers';
import fs from 'fs-extra';

const { expect } = chai;

describe('RocketCli e2e', () => {
  let cli;

  before(() => {
    // ignore colors in tests as most CIs won't support it
    chalk.level = 0;
    setFixtureDir(import.meta.url);
  });

  afterEach(async () => {
    if (cli?.cleanup) {
      await cli.cleanup();
    }
  });

  it('can add a unified plugin via the config', async () => {
    cli = await executeStart('e2e-fixtures/unified-plugin/rocket.config.js');
    const indexHtml = await readStartOutput(cli, 'index.html');
    expect(indexHtml).to.equal(`<p>See a 🐶</p>`);
  });

  describe('bootstrap command', () => {
    it('can bootstrap a project', async () => {
      cli = await executeBootstrap('e2e-fixtures/bootstrap/__output');

      for (const p of await getfixtureExpectedFiles('e2e-fixtures/bootstrap/expected')) {
        const actual = await fs.readFile(
          p.replace('expected', '__output').replace('_gitignore', '.gitignore'),
          'utf8',
        );
        const expected = await fs.readFile(p, 'utf8');
        expect(actual, p).to.equal(expected);
      }
    });
  });

  describe('eleventy in config', () => {
    it('can modify eleventy via an elventy function in the config', async () => {
      cli = await executeStart('e2e-fixtures/content/eleventy.rocket.config.js');
      const indexHtml = await readStartOutput(cli, 'index.html');
      expect(indexHtml).to.equal(
        ['# BEFORE #', '<p>Content inside <code>docs/index.md</code></p>'].join('\n'),
      );
    });

    it('will throw if you try to set options by returning an object', async () => {
      await expectThrowsAsync(
        () => executeStart('e2e-fixtures/content/eleventy-return.rocket.config.js'),
        {
          errorMatch: /Error in your Eleventy config file.*/,
        },
      );
    });
  });

  describe('setupDevAndBuildPlugins in config', () => {
    it('can add a rollup plugin via setupDevAndBuildPlugins for build command', async () => {
      cli = await executeBuild('e2e-fixtures/rollup-plugin/devbuild.rocket.config.js');
      const inlineModule = await readBuildOutput(cli, 'e97af63d.js');
      expect(inlineModule).to.equal('var a={test:"data"};console.log(a);');
    });

    it('can add a rollup plugin via setupDevAndBuildPlugins for start command', async () => {
      cli = await executeStart('e2e-fixtures/rollup-plugin/devbuild.rocket.config.js');

      const response = await fetch('http://localhost:8080/test-data.json');
      expect(response.ok).to.be.true; // no server error

      const text = await response.text();
      expect(text).to.equal('export var test = "data";\nexport default {\n\ttest: test\n};\n');
    });
  });

  it('can add a rollup plugin for dev & build and modify a build only plugin via the config', async () => {
    cli = await executeBuild('e2e-fixtures/rollup-plugin/devbuild-build.rocket.config.js');
    const inlineModule = await readBuildOutput(cli, 'e97af63d.js');
    expect(inlineModule).to.equal('var a={test:"data"};console.log(a);');
  });

  it('can adjust the inputDir', async () => {
    cli = await executeStart('e2e-fixtures/change-input-dir/rocket.config.js');

    const indexHtml = await readStartOutput(cli, 'index.html');
    expect(indexHtml).to.equal('<p>Markdown in <code>docs/page/index.md</code></p>');
  });

  it('can access main rocket config values via {{rocketConfig.value}}', async () => {
    cli = await executeStart('e2e-fixtures/rocket-config-in-template/rocket.config.js');

    const indexHtml = await readStartOutput(cli, 'index.html');
    expect(indexHtml).to.equal(
      '<p>You can show Rocket config data like rocketConfig.absoluteBaseUrl = <a href="http://test-domain.com/">http://test-domain.com/</a></p>',
    );
  });

  it('can add a pathPrefix that will not influence the start command', async () => {
    cli = await executeStart('e2e-fixtures/content/pathPrefix.rocket.config.js');

    const linkHtml = await readStartOutput(cli, 'link/index.html');
    expect(linkHtml).to.equal(
      ['<p><a href="../">home</a></p>', '<p><a href="/">absolute home</a></p>'].join('\n'),
    );
    const assetHtml = await readStartOutput(cli, 'use-assets/index.html');
    expect(assetHtml).to.equal('<link rel="stylesheet" href="/_merged_assets/some.css">');
    const imageHtml = await readStartOutput(cli, 'image/index.html', { replaceImageHashes: true });
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
    cli = await executeBuild('e2e-fixtures/content/pathPrefix.rocket.config.js');

    const linkHtml = await readBuildOutput(cli, 'link/index.html', {
      stripToBody: true,
    });
    expect(linkHtml).to.equal(
      ['<p><a href="../">home</a></p>', '<p><a href="/my-sub-folder/">absolute home</a></p>'].join(
        '\n',
      ),
    );
    const assetHtml = await readBuildOutput(cli, 'use-assets/index.html');
    expect(assetHtml).to.equal(
      '<html><head><link rel="stylesheet" href="../41297ffa.css">\n\n</head><body>\n\n</body></html>',
    );
    let imageHtml = await readBuildOutput(cli, 'image/index.html');
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
    await expectThrowsAsync(() => executeLint('e2e-fixtures/lint-links/rocket.config.js'), {
      errorMatch: /Found 1 missing reference targets/,
    });
  });

  it('can completely take over the rollup config', async () => {
    cli = await executeBuild('e2e-fixtures/rollup-override/rocket.config.js');

    const indexHtml = await readBuildOutput(cli, 'index.html', {
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
