import chai from 'chai';
import chalk from 'chalk';
import { execute, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli preset', () => {
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

  it('offers a default layout (with head, header, content, footer, bottom) and raw layout', async () => {
    const { cli, readOutput } = await execute('preset-fixtures/default/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const rawHtml = await readOutput('raw/index.html');
    expect(rawHtml).to.equal('<p>Just raw</p>');

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.include('<body layout="layout-index">');

    const pageHtml = await readOutput('page/index.html', {
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
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });

  it('allows to add content to the head without overriding', async () => {
    const { cli, readOutput } = await execute('preset-fixtures/add-to-head/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html');
    expect(indexHtml).to.include('<meta name="added" content="at the top" />');
  });

  it('a preset can provide an adjustImagePresets() function', async () => {
    const { cli, readOutput } = await execute('preset-fixtures/use-preset/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;

    const indexHtml = await readOutput('index.html', {
      formatHtml: true,
      replaceImageHashes: true,
    });
    expect(indexHtml).to.equal(
      [
        '<p>',
        '  <img',
        '    alt="My Image Alternative Text"',
        '    rocket-image="responsive"',
        '    src="/images/__HASH__-30.jpeg"',
        '    srcset="/images/__HASH__-30.jpeg 30w, /images/__HASH__-60.jpeg 60w"',
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
