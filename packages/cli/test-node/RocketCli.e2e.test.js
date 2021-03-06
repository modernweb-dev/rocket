import chai from 'chai';
import fetch from 'node-fetch';
import chalk from 'chalk';
import {
  executeBuild,
  executeLint,
  executeStart,
  expectThrowsAsync,
  readBuildOutput,
  readStartOutput,
  setFixtureDir,
} from '@rocket/cli/test-helpers';

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
    expect(indexHtml).to.equal('<p>See a 🐶</p>');
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

    const swCode = await readBuildOutput(cli, 'my-service-worker.js');
    expect(swCode).to.not.be.undefined;
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
  });

  it('can add a pathPrefix that will be used in the build command', async () => {
    cli = await executeBuild('e2e-fixtures/content/pathPrefix.rocket.config.js');

    const linkHtml = await readBuildOutput(cli, 'link/index.html', {
      stripServiceWorker: true,
      stripToBody: true,
    });
    expect(linkHtml).to.equal(
      ['<p><a href="../">home</a></p>', '<p><a href="/my-sub-folder/">absolute home</a></p>'].join(
        '\n',
      ),
    );
    const assetHtml = await readBuildOutput(cli, 'use-assets/index.html', {
      stripServiceWorker: true,
    });
    expect(assetHtml).to.equal(
      '<html><head><link rel="stylesheet" href="../41297ffa.css">\n\n</head><body>\n\n</body></html>',
    );
  });

  it('smoke test for link checking', async () => {
    await expectThrowsAsync(() => executeLint('e2e-fixtures/lint-links/rocket.config.js'), {
      errorMatch: /Found 1 missing reference targets/,
    });
  });
});
