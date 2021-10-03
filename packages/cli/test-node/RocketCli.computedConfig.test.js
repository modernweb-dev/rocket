import chai from 'chai';
import chalk from 'chalk';
import { execute, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli computedConfig', () => {
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

  it('will extract a title from markdown and set first folder as section', async () => {
    const { cli, readOutput } = await execute(
      'computed-config-fixtures/headlines/rocket.config.js',
      { captureLog: true },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    const [indexTitle, indexSection] = indexHtml.split('\n');
    expect(indexTitle).to.equal('Root');
    expect(indexSection).to.be.undefined;

    const subHtml = await readOutput('sub/index.html');
    const [subTitle, subSection] = subHtml.split('\n');
    expect(subTitle).to.equal('Root: Sub');
    expect(subSection).to.equal('sub');

    const subSubHtml = await readOutput('sub/subsub/index.html');
    const [subSubTitle, subSubSection] = subSubHtml.split('\n');
    expect(subSubTitle).to.equal('Sub: SubSub');
    expect(subSubSection).to.equal('sub');

    const sub2Html = await readOutput('sub2/index.html');
    const [sub2Title, sub2Section] = sub2Html.split('\n');
    expect(sub2Title).to.equal('Root: Sub2');
    expect(sub2Section).to.equal('sub2');

    const withDataHtml = await readOutput('with-data/index.html');
    const [withDataTitle, withDataSection] = withDataHtml.split('\n');
    expect(withDataTitle).to.equal('Set via data');
    expect(withDataSection).be.undefined;
  });

  it('will note create a social media image in "start"', async () => {
    const { cli, readOutput } = await execute(
      'computed-config-fixtures/social-images-only-build/rocket.config.js',
      {
        captureLog: true,
      },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.equal('');
  });

  it('will create a social media image in "build"', async () => {
    const { cli, readOutput } = await execute(
      'computed-config-fixtures/social-images-only-build/rocket.config.js',
      {
        captureLog: true,
        type: 'build',
      },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html', {
      stripToBody: true,
    });
    expect(indexHtml).to.equal('/_merged_assets/11ty-img/5893749-1200.png');
  });

  it('will create a social media image for every page', async () => {
    const { cli, readOutput } = await execute(
      'computed-config-fixtures/social-images/rocket.config.js',
      {
        captureLog: true,
      },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.equal('/_merged_assets/11ty-img/c4c29ec7-1200.png');

    const guidesHtml = await readOutput('guides/index.html');
    expect(guidesHtml).to.equal('/_merged_assets/11ty-img/c593a8cd-1200.png');

    const gettingStartedHtml = await readOutput('guides/first-pages/getting-started/index.html');
    expect(gettingStartedHtml).to.equal('/_merged_assets/11ty-img/d989ab1a-1200.png');
  });

  it('can override the svg function globally to adjust all social media image', async () => {
    const { cli, readOutput } = await execute(
      'computed-config-fixtures/social-images-override/rocket.config.js',
      {
        captureLog: true,
      },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.equal('/_merged_assets/11ty-img/d76265ed-1200.png');

    const guidesHtml = await readOutput('guides/index.html');
    expect(guidesHtml).to.equal('/_merged_assets/11ty-img/d76265ed-1200.png');

    const gettingStartedHtml = await readOutput('guides/first-pages/getting-started/index.html');
    expect(gettingStartedHtml).to.equal('/_merged_assets/11ty-img/d76265ed-1200.png');
  });

  it('will add "../" for links and image urls only within named template files', async () => {
    const {
      cli,
      readOutput,
    } = await execute('computed-config-fixtures/image-link/rocket.config.js', { captureLog: true });
    cleanupCli = cli;

    const namedMdContent = [
      '<p>',
      '  <a href="../">Root</a>',
      '  <a href="../one-level/raw/">Raw</a>',
      '  <img src="../images/my-img.svg" alt="my-img" />',
      '  <img src="/images/my-img.svg" alt="absolute-img" />',
      '</p>',
    ];

    const namedHtmlContent = [
      '<div id="with-anchor">',
      '  <a href="../">Root</a>',
      '  <a href="../one-level/raw/">Raw</a>',
      '  <img src="../images/my-img.svg" alt="my-img" />',
      '  <img src="/images/my-img.svg" alt="absolute-img" />',
      '  <picture>',
      '    <source media="(min-width:465px)" srcset="../images/picture-min-465.jpg" />',
      '    <img src="../images/picture-fallback.jpg" alt="Fallback" style="width: auto" />',
      '  </picture>',
      '</div>',
    ];

    const templateHtml = await readOutput('template/index.html', { formatHtml: true });
    expect(templateHtml, 'template/index.html does not match').to.equal(
      namedHtmlContent.join('\n'),
    );

    const guidesHtml = await readOutput('guides/index.html', { formatHtml: true });
    expect(guidesHtml, 'guides/index.html does not match').to.equal(
      [...namedMdContent, ...namedHtmlContent].join('\n'),
    );

    const noAdjustHtml = await readOutput('no-adjust/index.html');
    expect(noAdjustHtml, 'no-adjust/index.html does not match').to.equal(
      '<p>Nothing to adjust in here</p>',
    );

    const rawHtml = await readOutput('one-level/raw/index.html');
    expect(rawHtml, 'raw/index.html does not match').to.equal(
      [
        '<div>',
        '  <a href="../../">Root</a>',
        '  <a href="../../guides/#with-anchor">Guides</a>',
        '  <img src="../../images/my-img.svg" alt="my-img">',
        '  <img src="/images/my-img.svg" alt="absolute-img">',
        '  <picture>',
        '    <source media="(min-width:465px)" srcset="/images/picture-min-465.jpg">',
        '    <img src="../../images/picture-fallback.jpg" alt="Fallback" style="width:auto;">',
        '  </picture>',
        '</div>',
      ].join('\n'),
    );

    // for index files no '../' will be added
    const indexHtml = await readOutput('index.html', { formatHtml: true });
    expect(indexHtml, 'index.html does not match').to.equal(
      [
        '<p>',
        '  <a href="./">Root</a>',
        '  <a href="guides/#with-anchor">Guides</a>',
        '  <a href="./one-level/raw/">Raw</a>',
        '  <a href="template/">Template</a>',
        '  <a href="./rules/tabindex/">EndingIndex</a>',
        '  <img src="./images/my-img.svg" alt="my-img" />',
        '  <img src="/images/my-img.svg" alt="absolute-img" />',
        '</p>',
        '<div>',
        '  <a href="./">Root</a>',
        '  👇<a href="guides/#with-anchor">Guides</a> 👉 <a href="./one-level/raw/">Raw</a>',
        '  <a href="template/">Template</a>',
        '  <a href="./rules/tabindex/">EndingIndex</a>',
        '  <img src="./images/my-img.svg" alt="my-img" />',
        '  <img src="/images/my-img.svg" alt="absolute-img" />',
        '  <picture>',
        '    <source media="(min-width:465px)" srcset="./images/picture-min-465.jpg" />',
        '    <img src="./images/picture-fallback.jpg" alt="Fallback" style="width: auto" />',
        '  </picture>',
        '</div>',
      ].join('\n'),
    );
  });

  it('can be configured via setupEleventyComputedConfig', async () => {
    const { cli, readOutput } = await execute(
      'computed-config-fixtures/setup/addPlugin.rocket.config.js',
      {
        captureLog: true,
      },
    );
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.equal('test-value');
  });

  it('always assigns layout-default exept for index.* files who get layout-index', async () => {
    const { cli, readOutput } = await execute('computed-config-fixtures/layout/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.include('<body layout="layout-index">');

    const pageHtml = await readOutput('page/index.html');
    expect(pageHtml).to.include('<body layout="layout-default">');
  });
});
