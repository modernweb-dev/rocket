import chai from 'chai';
import { green } from 'colorette';
import { executeCli } from './test-helpers.js';

const { expect } = chai;

describe('cli', () => {
  it('works for two pages', async () => {
    const { readOutput, log } = await executeCli(
      {
        docsDir: 'fixtures/two-pages',
      },
      { captureLog: true },
    );
    expect(log[0]).to.match(/^👀 Analyzing file tree at/);
    expect(log[1]).to.equal(`📖 Found ${green(2)} pages`);
    expect(log[2]).to.equal(`📝 Inserted ${green(2)} menus!`);
    expect(log[3]).to.match(/^✍️ {2}Writing files to/);
    expect(log[4]).to.match(/^✅ Menus inserted and written to filesystem. \(executed in/);

    expect(readOutput('index.html')).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Welcome to two pages | My Page</title>',
        '    <meta name="menu:link.text" content="Home" />',
        '  </head>',
        '  <body>',
        '    <header>',
        '      <web-menu name="site">',
        '        <nav aria-label="site">',
        '          <a href="/about/">About Us</a>',
        '        </nav>',
        '      </web-menu>',
        '    </header>',
        '    <main>',
        '      <h1>Welcome to two pages</h1>',
        '      Content',
        '    </main>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
  });

  it('works for multiple nested pages', async () => {
    const { readOutput, log } = await executeCli(
      {
        docsDir: 'fixtures/nested-pages',
      },
      { captureLog: true },
    );
    expect(log[1]).to.equal(`📖 Found ${green(6)} pages`);
    expect(log[2]).to.equal(`📝 Inserted ${green(6)} menus!`);

    expect(readOutput('index.html')).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Welcome to two pages | My Page</title>',
        '    <meta name="menu:link.text" content="Home" />',
        '  </head>',
        '  <body>',
        '    <header>',
        '      <web-menu name="site">',
        '        <nav aria-label="site">',
        '          <a href="/about/">About Us</a>',
        '          <a href="/components/">Components</a>',
        '        </nav>',
        '      </web-menu>',
        '    </header>',
        '    <main>',
        '      <h1>Welcome to two pages</h1>',
        '      Content',
        '    </main>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );

    expect(readOutput('about/career/index.html')).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Career</title>',
        '  </head>',
        '  <body>',
        '    <header>',
        '      <web-menu name="site">',
        '        <nav aria-label="site">',
        '          <a href="/about/">About Us</a>',
        '          <a href="/components/">Components</a>',
        '        </nav>',
        '      </web-menu>',
        '    </header>',
        '    <main>Content</main>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
  });

  it('supports custom config files', async () => {
    const { readOutput } = await executeCli(
      {
        configFile: 'fixtures/my-menu.web-menu.config.js',
      },
      { captureLog: true },
    );
    expect(readOutput('index.html')).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Welcome to my menu | My Menu Page</title>',
        '  </head>',
        '  <body>',
        '    <header>',
        '      <web-menu name="site">',
        '        <nav aria-label="site">',
        '          <a href="/about/">About Us | My Menu Page</a>',
        '        </nav>',
        '      </web-menu>',
        '    </header>',
        '    <aside>',
        '      <web-menu name="my-menu">--- My Menu ---</web-menu>',
        '    </aside>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
  });

  it('can order pages via <meta name="menu:order" content="10" />', async () => {
    const { readOutput } = await executeCli(
      {
        docsDir: 'fixtures/order',
      },
      { captureLog: true },
    );

    expect(readOutput('index.html')).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Welcome to two pages | My Page</title>',
        '  </head>',
        '  <body>',
        '    <web-menu name="site">',
        '      <nav aria-label="site">',
        '        <a href="/page-c/">Page C</a>',
        '        <a href="/page-b/">Page B</a>',
        '        <a href="/page-b2/">Page B2</a>',
        '        <a href="/page-a/">Page A</a>',
        '      </nav>',
        '    </web-menu>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
  });

  it('can exclude pages via <meta name="menu:exclude" content="true" />', async () => {
    const { readOutput } = await executeCli(
      {
        docsDir: 'fixtures/exclude',
      },
      { captureLog: true },
    );

    expect(readOutput('index.html')).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Welcome to two pages | My Page</title>',
        '  </head>',
        '  <body>',
        '    <web-menu name="site">',
        '      <nav aria-label="site">',
        '        <a href="/contact/">Contact</a>',
        '      </nav>',
        '    </web-menu>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
  });
});
