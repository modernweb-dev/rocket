import chai from 'chai';
import chalk from 'chalk';
import { executeStart, readStartOutput, setFixtureDir } from '@rocket/cli/test-helpers';

const { expect } = chai;

describe('RocketLaunch preset', () => {
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

  it('sets layout-sidebar as default', async () => {
    cli = await executeStart('fixtures/layout-sidebar/rocket.config.js');

    const indexHtml = await readStartOutput(cli, 'page/index.html', {
      stripScripts: true,
      formatHtml: true,
    });
    expect(indexHtml).to.equal(
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
        '    <link',
        '      rel="apple-touch-icon"',
        '      sizes="180x180"',
        '      href="/_merged_assets/_static/icons/apple-touch-icon.png"',
        '    />',
        '    <link',
        '      rel="icon"',
        '      type="image/png"',
        '      sizes="32x32"',
        '      href="/_merged_assets/_static/icons/favicon-32x32.png"',
        '    />',
        '    <link',
        '      rel="icon"',
        '      type="image/png"',
        '      sizes="16x16"',
        '      href="/_merged_assets/_static/icons/favicon-16x16.png"',
        '    />',
        '    <link rel="manifest" href="/_merged_assets/webmanifest.json" />',
        '    <link',
        '      rel="mask-icon"',
        '      href="/_merged_assets/_static/icons/safari-pinned-tab.svg"',
        '      color="#3f93ce"',
        '    />',
        '    <meta name="msapplication-TileColor" content="#1d3557" />',
        '    <meta name="theme-color" content="#1d3557" />',
        '',
        '    <meta property="og:site_name" content="Rocket" />',
        '    <meta property="og:type" content="website" />',
        '',
        '    <meta property="og:image" content="do-not-generate-a-social-media-image" />',
        '    <meta property="og:url" content="/page/" />',
        '',
        '    <meta name="twitter:card" content="summary_large_image" />',
        '',
        '    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />',
        '',
        '    <link',
        '      href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&amp;display=optional"',
        '      rel="stylesheet"',
        '    />',
        '    <link',
        '      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&amp;display=optional"',
        '      rel="stylesheet"',
        '    />',
        '',
        '    <link rel="stylesheet" href="/_merged_assets/variables.css" />',
        '    <link rel="stylesheet" href="/_merged_assets/layout.css" />',
        '    <link rel="stylesheet" href="/_merged_assets/markdown.css" />',
        '    <link rel="stylesheet" href="/_merged_assets/style.css" />',
        '',
        '    <noscript><link rel="stylesheet" href="/_merged_assets/_static/noscript.css" /></noscript>',
        '  </head>',
        '',
        '  <body layout="layout-sidebar">',
        '    <header id="main-header">',
        '      <div class="content-area">',
        '        <button id="mobile-menu-trigger" data-action="trigger-mobile-menu">',
        '          <span class="sr-only">Show Menu</span>',
        '          <svg',
        '            xmlns="http://www.w3.org/2000/svg"',
        '            aria-hidden="true"',
        '            role="img"',
        '            viewbox="0 0 448 512"',
        '            class="icon"',
        '          >',
        '            <path',
        '              fill="currentColor"',
        '              d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"',
        '            ></path>',
        '          </svg>',
        '        </button>',
        '',
        '        <a class="logo-link" href="/">',
        '          <img src="/_merged_assets/logo.svg" alt="Rocket Logo" />',
        '          <span>Rocket</span>',
        '        </a>',
        '',
        '        <launch-dark-switch class="light-dark-switch" label="Toggle darkmode"',
        '          >Toggle darkmode</launch-dark-switch',
        '        >',
        '',
        '        <a',
        '          class="social-link"',
        '          href="https://github.com/modernweb-dev/rocket"',
        '          aria-label="Rocket on GitHub"',
        '          rel="noopener noreferrer"',
        '          target="_blank"',
        '        >',
        '          <span class="sr-only">GitHub</span>',
        '',
        '          <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 17 16" fill="none">',
        '            <title>GitHub</title>',
        '            <path',
        '              fill="currentColor"',
        '              fill-rule="evenodd"',
        '              d="M8.18391.249268C3.82241.249268.253906 3.81777.253906 8.17927c0 3.46933 2.279874 6.44313 5.451874 7.53353.3965.0991.49563-.1983.49563-.3965v-1.3878c-2.18075.4956-2.67638-.9912-2.67638-.9912-.3965-.8922-.89212-1.1895-.89212-1.1895-.69388-.4957.09912-.4957.09912-.4957.793.0992 1.1895.793 1.1895.793.69388 1.2887 1.88338.8922 2.27988.6939.09912-.4956.29737-.8921.49562-1.0904-1.78425-.1982-3.5685-.8921-3.5685-3.96496 0-.89212.29738-1.586.793-2.08162-.09912-.19825-.3965-.99125.09913-2.08163 0 0 .69387-.19825 2.18075.793.59475-.19825 1.28862-.29737 1.9825-.29737.69387 0 1.38775.09912 1.98249.29737 1.4869-.99125 2.1808-.793 2.1808-.793.3965 1.09038.1982 1.88338.0991 2.08163.4956.59475.793 1.28862.793 2.08162 0 3.07286-1.8834 3.66766-3.66764 3.86586.29737.3965.59474.8921.59474 1.586v2.1808c0 .1982.0991.4956.5948.3965 3.172-1.0904 5.4518-4.0642 5.4518-7.53353-.0991-4.3615-3.6676-7.930002-8.02909-7.930002z"',
        '              clip-rule="evenodd"',
        '            ></path>',
        '          </svg>',
        '        </a>',
        '        <a',
        '          class="social-link"',
        '          href="https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw"',
        '          aria-label="Rocket on Slack"',
        '          rel="noopener noreferrer"',
        '          target="_blank"',
        '        >',
        '          <span class="sr-only">Slack</span>',
        '',
        '          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 123 123" fill="currentColor">',
        '            <title>Slack</title>',
        '            <path',
        '              stroke="none"',
        '              stroke-width="1"',
        '              stroke-dasharray="none"',
        '              stroke-linecap="butt"',
        '              stroke-dashoffset="0"',
        '              stroke-linejoin="miter"',
        '              stroke-miterlimit="4"',
        '              fill-rule="nonzero"',
        '              d="M26.4 78.2c0 7.1-5.8 12.9-12.9 12.9S.6 85.3.6 78.2c0-7.1 5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V78.2zm12.9-51.8c-7.1 0-12.9-5.8-12.9-12.9S38.7.6 45.8.6s12.9 5.8 12.9 12.9v12.9H45.8zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H13.5C6.4 58.7.6 52.9.6 45.8s5.8-12.9 12.9-12.9h32.3zM97.6 45.8c0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H97.6V45.8zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9V13.5C65.3 6.4 71.1.6 78.2.6c7.1 0 12.9 5.8 12.9 12.9v32.3zM78.2 97.6c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9V97.6h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9H78.2z"',
        '            />',
        '          </svg>',
        '        </a>',
        '      </div>',
        '    </header>',
        '',
        '    <div id="content-wrapper">',
        '      <div class="content-area">',
        '        <rocket-drawer id="sidebar">',
        '          <nav slot="content" id="sidebar-nav">',
        '            <a class="logo-link" href="/">',
        '              <img src="/_merged_assets/logo.svg" alt="Rocket Logo" />',
        '              <span>Rocket</span>',
        '            </a>',
        '',
        '            <rocket-navigation>',
        '              <div class="sidebar-bottom">',
        '                <hr />',
        '                <launch-dark-switch class="light-dark-switch" label="Toggle darkmode"',
        '                  >Toggle darkmode</launch-dark-switch',
        '                >',
        '',
        '                <a href="https://github.com/modernweb-dev/rocket/issues">Help and Feedback</a>',
        '              </div>',
        '            </rocket-navigation>',
        '          </nav>',
        '        </rocket-drawer>',
        '',
        '        <main class="markdown-body">',
        '          <h1 id="page">',
        '            <a class="anchor" href="#page"',
        '              ><svg',
        '                class="octicon octicon-link"',
        '                viewBox="0 0 16 16"',
        '                aria-hidden="true"',
        '                width="16"',
        '                height="16"',
        '              >',
        '                <path',
        '                  fill-rule="evenodd"',
        '                  d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"',
        '                ></path></svg></a',
        '            >Page',
        '          </h1>',
        '',
        '          <div class="content-footer">',
        '            <p>',
        '              Caught a mistake or want to contribute to the documentation?',
        '              <a',
        '                href="https://github.com/modernweb-dev/rocket/edit/master/./packages/launch/test-node/fixtures/layout-sidebar/docs/page.md"',
        '                >Edit this page on GitHub!</a',
        '              >',
        '            </p>',
        '          </div>',
        '        </main>',
        '      </div>',
        '    </div>',
        '',
        '    <footer id="main-footer">',
        '      <div id="footer-menu">',
        '        <div class="content-area">',
        '          <nav>',
        '            <h3>Discover</h3>',
        '            <ul>',
        '              <li>',
        '                <a href="https://github.com/modernweb-dev/rocket/issues">Help and Feedback</a>',
        '              </li>',
        '            </ul>',
        '          </nav>',
        '        </div>',
        '      </div>',
        '    </footer>',
        '',
        '    <script type="module" src="/_merged_assets/scripts/init-navigation.js"></script>',
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

  it('offers a layout-home', async () => {
    cli = await executeStart('fixtures/layout-home/rocket.config.js');

    const indexHtml = await readStartOutput(cli, 'index.html', {
      stripScripts: true,
      formatHtml: true,
    });
    expect(indexHtml).to.equal(
      [
        '<!DOCTYPE html>',
        '',
        '<html lang="en" dir="ltr">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '    <title>Rocket</title>',
        '    <meta property="og:title" content="Rocket" />',
        '',
        '    <meta name="generator" content="rocket 0.1" />',
        '    <link rel="canonical" href="/" />',
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
        '    <link',
        '      rel="apple-touch-icon"',
        '      sizes="180x180"',
        '      href="/_merged_assets/_static/icons/apple-touch-icon.png"',
        '    />',
        '    <link',
        '      rel="icon"',
        '      type="image/png"',
        '      sizes="32x32"',
        '      href="/_merged_assets/_static/icons/favicon-32x32.png"',
        '    />',
        '    <link',
        '      rel="icon"',
        '      type="image/png"',
        '      sizes="16x16"',
        '      href="/_merged_assets/_static/icons/favicon-16x16.png"',
        '    />',
        '    <link rel="manifest" href="/_merged_assets/webmanifest.json" />',
        '    <link',
        '      rel="mask-icon"',
        '      href="/_merged_assets/_static/icons/safari-pinned-tab.svg"',
        '      color="#3f93ce"',
        '    />',
        '    <meta name="msapplication-TileColor" content="#1d3557" />',
        '    <meta name="theme-color" content="#1d3557" />',
        '',
        '    <meta property="og:site_name" content="Rocket" />',
        '    <meta property="og:type" content="website" />',
        '',
        '    <meta property="og:image" content="do-not-generate-a-social-media-image" />',
        '    <meta property="og:url" content="/" />',
        '',
        '    <meta name="twitter:card" content="summary_large_image" />',
        '',
        '    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />',
        '',
        '    <link',
        '      href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&amp;display=optional"',
        '      rel="stylesheet"',
        '    />',
        '    <link',
        '      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&amp;display=optional"',
        '      rel="stylesheet"',
        '    />',
        '',
        '    <link rel="stylesheet" href="/_merged_assets/variables.css" />',
        '    <link rel="stylesheet" href="/_merged_assets/layout.css" />',
        '    <link rel="stylesheet" href="/_merged_assets/markdown.css" />',
        '    <link rel="stylesheet" href="/_merged_assets/style.css" />',
        '',
        '    <noscript><link rel="stylesheet" href="/_merged_assets/_static/noscript.css" /></noscript>',
        '  </head>',
        '',
        '  <body layout="layout-home">',
        '    <header id="main-header">',
        '      <div class="content-area">',
        '        <button id="mobile-menu-trigger" data-action="trigger-mobile-menu">',
        '          <span class="sr-only">Show Menu</span>',
        '          <svg',
        '            xmlns="http://www.w3.org/2000/svg"',
        '            aria-hidden="true"',
        '            role="img"',
        '            viewbox="0 0 448 512"',
        '            class="icon"',
        '          >',
        '            <path',
        '              fill="currentColor"',
        '              d="M436 124H12c-6.627 0-12-5.373-12-12V80c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12zm0 160H12c-6.627 0-12-5.373-12-12v-32c0-6.627 5.373-12 12-12h424c6.627 0 12 5.373 12 12v32c0 6.627-5.373 12-12 12z"',
        '            ></path>',
        '          </svg>',
        '        </button>',
        '',
        '        <a class="logo-link" href="/">',
        '          <img src="/_merged_assets/logo.svg" alt="Rocket Logo" />',
        '          <span>Rocket</span>',
        '        </a>',
        '',
        '        <launch-dark-switch class="light-dark-switch" label="Toggle darkmode"',
        '          >Toggle darkmode</launch-dark-switch',
        '        >',
        '',
        '        <a',
        '          class="social-link"',
        '          href="https://github.com/modernweb-dev/rocket"',
        '          aria-label="Rocket on GitHub"',
        '          rel="noopener noreferrer"',
        '          target="_blank"',
        '        >',
        '          <span class="sr-only">GitHub</span>',
        '',
        '          <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 17 16" fill="none">',
        '            <title>GitHub</title>',
        '            <path',
        '              fill="currentColor"',
        '              fill-rule="evenodd"',
        '              d="M8.18391.249268C3.82241.249268.253906 3.81777.253906 8.17927c0 3.46933 2.279874 6.44313 5.451874 7.53353.3965.0991.49563-.1983.49563-.3965v-1.3878c-2.18075.4956-2.67638-.9912-2.67638-.9912-.3965-.8922-.89212-1.1895-.89212-1.1895-.69388-.4957.09912-.4957.09912-.4957.793.0992 1.1895.793 1.1895.793.69388 1.2887 1.88338.8922 2.27988.6939.09912-.4956.29737-.8921.49562-1.0904-1.78425-.1982-3.5685-.8921-3.5685-3.96496 0-.89212.29738-1.586.793-2.08162-.09912-.19825-.3965-.99125.09913-2.08163 0 0 .69387-.19825 2.18075.793.59475-.19825 1.28862-.29737 1.9825-.29737.69387 0 1.38775.09912 1.98249.29737 1.4869-.99125 2.1808-.793 2.1808-.793.3965 1.09038.1982 1.88338.0991 2.08163.4956.59475.793 1.28862.793 2.08162 0 3.07286-1.8834 3.66766-3.66764 3.86586.29737.3965.59474.8921.59474 1.586v2.1808c0 .1982.0991.4956.5948.3965 3.172-1.0904 5.4518-4.0642 5.4518-7.53353-.0991-4.3615-3.6676-7.930002-8.02909-7.930002z"',
        '              clip-rule="evenodd"',
        '            ></path>',
        '          </svg>',
        '        </a>',
        '        <a',
        '          class="social-link"',
        '          href="https://join.slack.com/t/lit-and-friends/shared_invite/zt-llwznvsy-LZwT13R66gOgnrg12PUGqw"',
        '          aria-label="Rocket on Slack"',
        '          rel="noopener noreferrer"',
        '          target="_blank"',
        '        >',
        '          <span class="sr-only">Slack</span>',
        '',
        '          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 123 123" fill="currentColor">',
        '            <title>Slack</title>',
        '            <path',
        '              stroke="none"',
        '              stroke-width="1"',
        '              stroke-dasharray="none"',
        '              stroke-linecap="butt"',
        '              stroke-dashoffset="0"',
        '              stroke-linejoin="miter"',
        '              stroke-miterlimit="4"',
        '              fill-rule="nonzero"',
        '              d="M26.4 78.2c0 7.1-5.8 12.9-12.9 12.9S.6 85.3.6 78.2c0-7.1 5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V78.2zm12.9-51.8c-7.1 0-12.9-5.8-12.9-12.9S38.7.6 45.8.6s12.9 5.8 12.9 12.9v12.9H45.8zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H13.5C6.4 58.7.6 52.9.6 45.8s5.8-12.9 12.9-12.9h32.3zM97.6 45.8c0-7.1 5.8-12.9 12.9-12.9 7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H97.6V45.8zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9V13.5C65.3 6.4 71.1.6 78.2.6c7.1 0 12.9 5.8 12.9 12.9v32.3zM78.2 97.6c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9-7.1 0-12.9-5.8-12.9-12.9V97.6h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9 0-7.1 5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9 0 7.1-5.8 12.9-12.9 12.9H78.2z"',
        '            />',
        '          </svg>',
        '        </a>',
        '      </div>',
        '    </header>',
        '',
        '    <div id="content-wrapper">',
        '      <div class="content-area">',
        '        <rocket-drawer id="sidebar">',
        '          <nav slot="content" id="sidebar-nav">',
        '            <a class="logo-link" href="/">',
        '              <img src="/_merged_assets/logo.svg" alt="Rocket Logo" />',
        '              <span>Rocket</span>',
        '            </a>',
        '',
        '            <rocket-navigation>',
        '              <ul></ul>',
        '              <div class="sidebar-bottom">',
        '                <hr />',
        '                <launch-dark-switch class="light-dark-switch" label="Toggle darkmode"',
        '                  >Toggle darkmode</launch-dark-switch',
        '                >',
        '',
        '                <a href="https://github.com/modernweb-dev/rocket/issues">Help and Feedback</a>',
        '              </div>',
        '            </rocket-navigation>',
        '          </nav>',
        '        </rocket-drawer>',
        '',
        '        <main class="markdown-body">',
        '          <img class="page-logo" src="/_merged_assets/logo.svg" alt=" Logo" />',
        '',
        '          <h1 class="page-title">Rocket</h1>',
        '',
        '          <p class="page-slogan">',
        '            The modern web setup for static sites with a sprinkle of JavaScript.',
        '          </p>',
        '',
        '          <div class="call-to-action-list" role="list">',
        '            <a class="call-to-action" href="/" role="listitem">Follow Guides</a>',
        '',
        '            <a class="call-to-action" href="/" role="listitem">Browse Docs</a>',
        '          </div>',
        '',
        '          <h2 class="reason-header">Why Rocket?</h2>',
        '',
        '          <section class="reasons">',
        '            <article>',
        '              <h3>Small</h3>',
        '              No overblown tools or frontend frameworks, add JavaScript and/or Web Components only',
        '              on pages where needed.',
        '            </article>',
        '',
        '            <article>',
        '              <h3>Pre-Rendered</h3>',
        '              Statically generated content means less JavaScript to ship and process.',
        '            </article>',
        '',
        '            <article>',
        '              <h3>Zero Configuration</h3>',
        '              Automatic code splitting, filesystem based routing, and JavaScript in markdown.',
        '            </article>',
        '',
        '            <article>',
        '              <h3>Meta Framework</h3>',
        '              Build on top of giants like <a href="https://www.11ty.dev/">eleventy</a>,',
        '              <a href="https://rollupjs.org/">Rollup</a>, and',
        '              <a href="https://www.modern-web.dev/">Modern Web</a>.',
        '            </article>',
        '',
        '            <article>',
        '              <h3>Powerful Default Template</h3>',
        '              Provide content and you are ready to go.',
        '            </article>',
        '',
        '            <article>',
        '              <h3>Ready for Production</h3>',
        '              Optimized for a smaller build size, faster dev compilation and dozens of other',
        '              improvements.',
        '            </article>',
        '          </section>',
        '        </main>',
        '      </div>',
        '    </div>',
        '',
        '    <footer id="main-footer">',
        '      <div id="footer-menu">',
        '        <div class="content-area">',
        '          <nav>',
        '            <h3>Discover</h3>',
        '            <ul>',
        '              <li>',
        '                <a href="https://github.com/modernweb-dev/rocket/issues">Help and Feedback</a>',
        '              </li>',
        '            </ul>',
        '          </nav>',
        '        </div>',
        '      </div>',
        '    </footer>',
        '',
        '    <script type="module" src="/_merged_assets/scripts/init-navigation.js"></script>',
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
});
