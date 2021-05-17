import chai from 'chai';
import chalk from 'chalk';
import { executeStart, readStartOutput, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli preset', () => {
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

  it('offers a default layout (with head, header, content, footer, bottom) and raw layout', async () => {
    cli = await executeStart('preset-fixtures/default/rocket.config.js');

    const rawHtml = await readStartOutput(cli, 'raw/index.html');
    expect(rawHtml).to.equal('<p>Just raw</p>');

    const indexHtml = await readStartOutput(cli, 'index.html');
    expect(indexHtml).to.include('<body layout="layout-index">');

    const pageHtml = await readStartOutput(cli, 'page/index.html', {
      stripScripts: true,
      formatHtml: true,
    });
    expect(pageHtml).to.equal(
      [
        '<!DOCTYPE html>',
        '',
        '<html lang="en" dir="ltr">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '    <title>Page: Rocket</title>',
        '    <meta property="og:title" content="Page: Rocket" />',
        '',
        '    <meta name="generator" content="rocket 0.1" />',
        '    <link rel="canonical" href="/page/" />',
        '',
        '    <meta',
        '      name="description"',
        '      content="Rocket is the way to build fast static websites with a sprinkle of JavaScript"',
        '    />',
        '    <meta',
        '      property="og:description"',
        '      content="Rocket is the way to build fast static websites with a sprinkle of JavaScript"',
        '    />',
        '',
        '    <meta property="og:site_name" content="Rocket" />',
        '    <meta property="og:type" content="website" />',
        '',
        '    <meta property="og:image" content="do-not-generate-a-social-media-image" />',
        '    <meta property="og:url" content="/page/" />',
        '',
        '    <meta name="twitter:card" content="summary_large_image" />',
        '  </head>',
        '',
        '  <body layout="layout-default">',
        '    <header id="main-header">',
        '      <div class="content-area">',
        '        <a class="logo-link" href="/">',
        '          <img src="/_merged_assets/logo.svg" alt="" />',
        '          <span class="sr-only">Rocket</span>',
        '        </a>',
        '      </div>',
        '    </header>',
        '',
        '    <div id="content-wrapper">',
        '      <div class="content-area">',
        '        <main class="markdown-body">',
        '          <h1 id="page">',
        '            <a aria-hidden="true" tabindex="-1" href="#page"><span class="icon icon-link"></span></a',
        '            >Page',
        '          </h1>',
        '        </main>',
        '      </div>',
        '    </div>',
        '',
        '    <footer id="main-footer"></footer>',
        '',
        '    <script',
        '      type="module"',
        '      inject-service-worker=""',
        '      src="/_merged_assets/scripts/registerServiceWorker.js"',
        '    ></script>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });

  it('allows to add content to the head without overriding', async () => {
    cli = await executeStart('preset-fixtures/add-to-head/rocket.config.js');

    const indexHtml = await readStartOutput(cli, 'index.html');
    expect(indexHtml).to.include('<meta name="added" content="at the top" />');
  });

  it('a preset can provide an adjustImagePresets() function', async () => {
    cli = await executeStart('preset-fixtures/use-preset/rocket.config.js');

    const indexHtml = await readStartOutput(cli, 'index.html', { formatHtml: true });
    expect(indexHtml).to.equal(
      [
        '<p>',
        '  <img',
        '    alt="My Image Alternative Text"',
        '    rocket-image="responsive"',
        '    src="/images/1f847765-30.jpeg"',
        '    srcset="/images/1f847765-30.jpeg 30w, /images/1f847765-60.jpeg 60w"',
        '    sizes="30px"',
        '    width="30"',
        '    height="15"',
        '    loading="lazy"',
        '    decoding="async"',
        '  />',
        '</p>',
      ].join('\n'),
    );
  });
});
