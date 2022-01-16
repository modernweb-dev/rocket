import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine menus', () => {
  it('can add a static menu', async () => {
    const { readOutput, build } = await setupTestEngine('fixtures/05-menu/01-two-pages/docs');
    await build();

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="site">',
        '  <a href="/about/"> About </a>',
        '  <a href="/components/"> Components </a>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('about/index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="site">',
        '  <a href="/about/" aria-current="page"> About </a>',
        '  <a href="/components/"> Components </a>',
        '</nav>',
        '<main><h1>About</h1></main>',
      ].join('\n'),
    );
  });

  it('will create a complete new pageTreeData file when using build', async () => {
    const { writeSource, build, readSource, readOutput } = await setupTestEngine(
      'fixtures/05-menu/02-generate-page-tree/docs',
    );

    const startTreeData = {
      menuLinkText: 'existing Home',
      h1: 'This is existing Home',
      name: 'This is existing Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
      children: [],
    };
    // this simulates a pre existing file
    await writeSource('pageTreeData.rocketGenerated.json', JSON.stringify(startTreeData, null, 2));

    await build();

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      menuLinkText: 'Home',
      h1: 'This is Home',
      name: 'This is Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
      children: [
        {
          menuLinkText: 'About',
          h1: 'This is About',
          name: 'This is About',
          title: 'About | MyPage',
          url: '/about/',
          outputRelativeFilePath: 'about/index.html',
          sourceRelativeFilePath: 'about.rocket.js',
          level: 1,
        },
        {
          menuLinkText: 'Components',
          h1: 'This is Components',
          name: 'This is Components',
          url: '/components/',
          outputRelativeFilePath: 'components/index.html',
          sourceRelativeFilePath: 'components.rocket.js',
          level: 1,
        },
      ],
    });

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<nav aria-label="site">',
        '  <a href="/about/"> About </a>',
        '  <a href="/components/"> Components </a>',
        '</nav>',
        '<main>',
        '  <meta name="menu:link.text" content="Home" />',
        '  <h1>This is Home</h1>',
        '</main>',
      ].join('\n'),
    );
  });

  it('works with external layouts', async () => {
    const { readOutput, build } = await setupTestEngine(
      'fixtures/05-menu/03-dependency-layout/docs',
    );
    await build();

    expect(readOutput('index.html', { format: 'html' })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header">',
        '      <div class="content-area"></div>',
        '    </header>',
        '    <div class="content-area">',
        '      <div id="sidebar">',
        '        <nav aria-label="site">',
        '          <a href="/about/"> About </a>',
        '          <a href="/components/"> Components </a>',
        '        </nav>',
        '      </div>',
        '      <main class="markdown-body">',
        '        <meta name="menu:link.text" content="Home" />',
        '        <h1>This is Home</h1>',
        '      </main>',
        '    </div>',
        '    <footer id="main-footer">',
        '      <div class="content-area"></div>',
        '    </footer>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readOutput('about/index.html', { format: 'html' })).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header">',
        '      <div class="content-area"></div>',
        '    </header>',
        '    <div class="content-area">',
        '      <div id="sidebar">',
        '        <nav aria-label="site">',
        '          <a href="/about/" aria-current="page"> About </a>',
        '          <a href="/components/"> Components </a>',
        '        </nav>',
        '      </div>',
        '      <main class="markdown-body">',
        '        <meta name="menu:link.text" content="About" />',
        '        <h1>This is About</h1>',
        '      </main>',
        '    </div>',
        '    <footer id="main-footer">',
        '      <div class="content-area"></div>',
        '    </footer>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );
  });

  it('extracts correct data from markdown', async () => {
    const { readSource, build } = await setupTestEngine('fixtures/05-menu/04-markdown/docs');
    await build();

    expect(readSource('pageTreeData.rocketGenerated.json', { format: 'json' })).to.equal(
      [
        '{',
        '  "h1": "Home",',
        '  "headlinesWithId": [',
        '    {',
        '      "text": "Home",',
        '      "id": "home",',
        '      "level": 1',
        '    }',
        '  ],',
        '  "name": "Home",',
        '  "menuLinkText": "Home",',
        '  "url": "/",',
        '  "outputRelativeFilePath": "index.html",',
        '  "sourceRelativeFilePath": "index.rocket.md",',
        '  "level": 0',
        '}',
      ].join('\n'),
    );
  });

  it('[md] updates the PageTree when a file changes', async () => {
    const { readSource, writeSource, anEngineEvent, cleanup, engine } = await setupTestEngine(
      'fixtures/05-menu/05-update-on-change/docs',
    );
    await writeSource('index.rocket.md', '# First');
    await engine.build();
    // 👆 ensures a valid setup

    await engine.start();
    await writeSource('index.rocket.md', '# Second');
    await anEngineEvent('rocketUpdated');

    expect(readSource('pageTreeData.rocketGenerated.json', { format: 'json' })).to.equal(
      [
        '{',
        '  "h1": "Second",',
        '  "headlinesWithId": [',
        '    {',
        '      "text": "Second",',
        '      "id": "second",',
        '      "level": 1',
        '    }',
        '  ],',
        '  "name": "Second",',
        '  "menuLinkText": "Second",',
        '  "url": "/",',
        '  "outputRelativeFilePath": "index.html",',
        '  "sourceRelativeFilePath": "index.rocket.md",',
        '  "level": 0',
        '}',
      ].join('\n'),
    );

    await cleanup();
  });
});
