import chai from 'chai';
import chalk from 'chalk';
import { execute, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketCli Menu', () => {
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

  it('will render a menu', async () => {
    const { cli, readOutput } = await execute('e2e-fixtures/menu/rocket.config.js', {
      captureLog: true,
    });
    cleanupCli = cli;
    const indexHtml = await readOutput('index.html', {
      formatHtml: true,
    });
    expect(indexHtml).to.equal(
      [
        '<html>',
        '  <head> </head>',
        '  <body>',
        '    <web-menu name="site">',
        '      <nav aria-label="site">',
        '        <a href="/components/">Components</a>',
        '        <a href="/getting-started/">Getting Started</a>',
        '        <a href="/blog/">Blog</a>',
        '      </nav>',
        '    </web-menu>',
        '    <h1 id="menu-page">',
        '      <a aria-hidden="true" tabindex="-1" href="#menu-page"><span class="icon icon-link"></span></a',
        '      >Menu Page',
        '    </h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    const accordion = await readOutput('components/content/accordion/index.html', {
      formatHtml: true,
    });
    expect(accordion).to.equal(
      [
        '<html>',
        '  <head>',
        '    <meta name="menu:order" content="10" />',
        '  </head>',
        '  <body>',
        '    <web-menu name="site">',
        '      <nav aria-label="site">',
        '        <a href="/components/">Components</a>',
        '        <a href="/getting-started/">Getting Started</a>',
        '        <a href="/blog/">Blog</a>',
        '      </nav>',
        '    </web-menu>',
        '    <h1 id="accordion">',
        '      <a aria-hidden="true" tabindex="-1" href="#accordion"><span class="icon icon-link"></span></a',
        '      >Accordion',
        '    </h1>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });
});
