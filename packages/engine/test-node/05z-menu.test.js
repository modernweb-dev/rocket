import chai from 'chai';
import { setupTestEngine } from './test-helpers.js';

const { expect } = chai;

describe('Engine menus', () => {
  it('can add a static menu', async () => {
    const { readOutput, build } = await setupTestEngine('fixtures/05-menu/01-two-pages/docs');
    await build();

    expect(readOutput('index.html')).to.equal(
      [
        '<a href="/about/"> About </a>',
        '<a href="/components/"> Components </a>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    expect(readOutput('about/index.html')).to.equal(
      [
        '<a href="/about/" aria-current="page"> About </a>',
        '<a href="/components/"> Components </a>',
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

    expect(readOutput('index.html')).to.equal(
      [
        '<a href="/about/"> About </a>',
        '<a href="/components/"> Components </a>',
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

    expect(readOutput('index.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header"></header>',
        '    <div class="content-area">',
        '      <div id="sidebar">',
        '        <a href="/about/"> About </a>',
        '        <a href="/components/"> Components </a>',
        '      </div>',
        '      <main class="markdown-body">',
        '        <meta name="menu:link.text" content="Home" />',
        '        <h1>This is Home</h1>',
        '      </main>',
        '    </div>',
        '    <footer id="main-footer"></footer>',
        '  </body>',
        '</html>',
      ].join('\n'),
    );

    expect(readOutput('about/index.html')).to.equal(
      [
        '<!DOCTYPE html>',
        '<html lang="en-US">',
        '  <head> </head>',
        '  <body class="  " layout="layout">',
        '    <header id="main-header"></header>',
        '    <div class="content-area">',
        '      <div id="sidebar">',
        '        <a href="/about/" aria-current="page"> About </a>',
        '        <a href="/components/"> Components </a>',
        '      </div>',
        '      <main class="markdown-body">',
        '        <meta name="menu:link.text" content="About" />',
        '        <h1>This is About</h1>',
        '      </main>',
        '    </div>',
        '    <footer id="main-footer"></footer>',
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

  it('05: [md] updates the PageTree when a file changes', async () => {
    const { readSource, writeSource, anEngineEvent, cleanup, engine, build } =
      await setupTestEngine('fixtures/05-menu/05-update-on-change/docs');
    await writeSource('index.rocket.md', '# First\n');
    await build();
    // 👆 ensures a valid setup

    await engine.start();
    await writeSource('index.rocket.md', '# Second\n');
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

  it('06: saves all string, number, boolean exports to the pageTree', async () => {
    const { readSource, build } = await setupTestEngine('fixtures/05-menu/06-saves-exports/docs');
    await build();

    expect(readSource('pageTreeData.rocketGenerated.json')).to.equal(
      JSON.stringify(
        {
          h1: 'Welcome to Hello World!',
          headlinesWithId: [
            {
              text: 'Welcome to Hello World!',
              id: 'welcome-to-hello-world',
              level: 1,
            },
          ],
          name: 'Hello world!',
          menuLinkText: 'Welcome to Hello World!',
          url: '/',
          outputRelativeFilePath: 'index.html',
          sourceRelativeFilePath: 'index.rocket.md',
          level: 0,
          author: 'Thomas Allmer (@daKmoR)',
          authorHref: 'https://twitter.com/daKmoR',
          description: 'Just a Hello World Post!',
          flag: true,
          publishDate: '12 Sep 2021',
          title: 'Hello world!',
          value: 128,
        },
        null,
        2,
      ),
    );
  });

  it('06b: saves objects/arrays containing only string, number, booleans to the pageTree', async () => {
    const { readSource, build } = await setupTestEngine(
      'fixtures/05-menu/06b-saves-exports-simple-arrays-objects/docs',
    );
    await build();

    expect(readSource('pageTreeData.rocketGenerated.json')).to.equal(
      JSON.stringify(
        {
          h1: 'Welcome',
          name: 'Welcome',
          menuLinkText: 'Welcome',
          url: '/',
          outputRelativeFilePath: 'index.html',
          sourceRelativeFilePath: 'index.rocket.js',
          level: 0,
          authors: [
            {
              name: 'Thomas',
              age: 10,
            },
          ],
          extras: {
            flag: true,
          },
          tags: ['web', 'javascript'],
        },
        null,
        2,
      ),
    );
  });

  it('06c: saves & restores Dates to the pageTree', async () => {
    const { readSource, readOutput, build } = await setupTestEngine(
      'fixtures/05-menu/06c-saves-exports-dates/docs',
    );
    await build();

    expect(readSource('pageTreeData.rocketGenerated.json')).to.equal(
      JSON.stringify(
        {
          h1: 'Welcome',
          name: 'Welcome',
          menuLinkText: 'Welcome',
          url: '/',
          outputRelativeFilePath: 'index.html',
          sourceRelativeFilePath: 'index.rocket.js',
          level: 0,
          authors: [
            {
              birthDate: '2000-01-01T00:00:00.000Z',
            },
          ],
          dates: ['2002-01-01T00:00:00.000Z', '2003-01-01T00:00:00.000Z'],
          extras: {
            flagDate: '2001-01-01T00:00:00.000Z',
          },
          publishDate: '2004-01-01T00:00:00.000Z',
        },
        null,
        2,
      ),
    );

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<h1>Welcome</h1>',
        '<p>1/1/2004</p>',
      ].join('\n'),
    );
  });

  it('07: on file save updates exports to the pageTree', async () => {
    const { readSource, writeSource, anEngineEvent, cleanup, engine, build } =
      await setupTestEngine('fixtures/05-menu/07-update-exports/docs');
    await writeSource(
      'index.rocket.js',
      "export const menuLinkText = 'Guid'; export default () => '<h1>Learning Rocket</h1>';",
    );
    await build();
    // 👆 ensures a valid setup

    await engine.start();
    await writeSource(
      'index.rocket.js',
      [
        "export const menuLinkText = 'Guides';",
        "export default () => '<h1>Learning Rocket</h1>';",
      ].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readSource('pageTreeData.rocketGenerated.json', { format: 'json' })).to.equal(
      [
        '{',
        '  "h1": "Learning Rocket",',
        '  "name": "Learning Rocket",',
        '  "menuLinkText": "Guides",',
        '  "url": "/",',
        '  "outputRelativeFilePath": "index.html",',
        '  "sourceRelativeFilePath": "index.rocket.js",',
        '  "level": 0',
        '}',
      ].join('\n'),
    );

    await writeSource(
      'index.rocket.js',
      [
        "export const menuLinkText = 'Guides';",
        'export const flag = true;',
        "export default () => '<h1>Learning Rocket</h1>';",
      ].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readSource('pageTreeData.rocketGenerated.json', { format: 'json' })).to.equal(
      [
        '{',
        '  "h1": "Learning Rocket",',
        '  "name": "Learning Rocket",',
        '  "menuLinkText": "Guides",',
        '  "url": "/",',
        '  "outputRelativeFilePath": "index.html",',
        '  "sourceRelativeFilePath": "index.rocket.js",',
        '  "level": 0,',
        '  "flag": true',
        '}',
      ].join('\n'),
    );

    await cleanup();
  });

  it('07b: on file save updates exports to the pageTree [md]', async () => {
    const { readSource, writeSource, anEngineEvent, cleanup, engine, build } =
      await setupTestEngine('fixtures/05-menu/07b-update-exports-[md]/docs');
    await writeSource(
      'index.rocket.md',
      [
        //
        '```js server',
        "export const menuLinkText = 'Guid';",
        '```',
        '# Learning Rocket',
      ].join('\n'),
    );
    await build();
    // 👆 ensures a valid setup

    await engine.start();
    await writeSource(
      'index.rocket.md',
      [
        //
        '```js server',
        "export const menuLinkText = 'Guides';",
        '```',
        '# Learning Rocket',
      ].join('\n'),
    );
    await anEngineEvent('rocketUpdated');

    expect(readSource('pageTreeData.rocketGenerated.json', { format: 'json' })).to.equal(
      [
        '{',
        '  "h1": "Learning Rocket",',
        '  "headlinesWithId": [',
        '    {',
        '      "text": "Learning Rocket",',
        '      "id": "learning-rocket",',
        '      "level": 1',
        '    }',
        '  ],',
        '  "name": "Learning Rocket",',
        '  "menuLinkText": "Guides",',
        '  "url": "/",',
        '  "outputRelativeFilePath": "index.html",',
        '  "sourceRelativeFilePath": "index.rocket.md",',
        '  "level": 0',
        '}',
      ].join('\n'),
    );

    await cleanup();
  });

  it('08: syncs disk delete to pageTree', async () => {
    const {
      readSource,
      writeSource,
      anEngineEvent,
      cleanup,
      engine,
      deleteSource,
      readOutput,
      setAsOpenedInBrowser,
      build,
    } = await setupTestEngine('fixtures/05-menu/08-syncs-delete-to-page-tree/docs');
    await writeSource('index.rocket.js', 'export default () => html`<h1>Home</h1>`;');
    await writeSource('about.rocket.js', 'export default () => html`<h1>About</h1>`;');
    await build();
    // 👆 ensures a valid setup

    expect(readOutput('index.html')).to.equal(
      ['<a href="/about/"> About </a>', '<main><h1>Home</h1></main>'].join('\n'),
    );

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');
    await deleteSource('about.rocket.js');
    await anEngineEvent('rocketUpdated');

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      children: [],
      h1: 'Home',
      level: 0,
      menuLinkText: 'Home',
      name: 'Home',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      url: '/',
    });

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    await cleanup();
  });

  it('09: syncs disk rename to pageTree', async () => {
    const {
      readSource,
      writeSource,
      anEngineEvent,
      cleanup,
      engine,
      renameSource,
      deleteSource,
      readOutput,
      setAsOpenedInBrowser,
      build,
    } = await setupTestEngine('fixtures/05-menu/09-syncs-rename-to-page-tree/docs');
    await writeSource('index.rocket.js', 'export default () => html`<h1>Home</h1>`;');
    await writeSource('about.rocket.js', 'export default () => html`<h1>About</h1>`;');
    await deleteSource('about-me.rocket.js');
    await build();
    // 👆 ensures a valid setup

    expect(readOutput('index.html')).to.equal(
      ['<a href="/about/"> About </a>', '<main><h1>Home</h1></main>'].join('\n'),
    );

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');
    await renameSource('about.rocket.js', 'about-me.rocket.js');
    await anEngineEvent('rocketUpdated');

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      children: [
        {
          h1: 'About',
          level: 1,
          menuLinkText: 'About',
          name: 'About',
          outputRelativeFilePath: 'about-me/index.html',
          sourceRelativeFilePath: 'about-me.rocket.js',
          url: '/about-me/',
        },
      ],
      h1: 'Home',
      level: 0,
      menuLinkText: 'Home',
      name: 'Home',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      url: '/',
    });

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<a href="/about-me/"> About </a>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    await cleanup();
  });

  it('10: syncs disk folder delete to pageTree', async () => {
    const {
      readSource,
      writeSource,
      anEngineEvent,
      cleanup,
      engine,
      deleteSource,
      readOutput,
      setAsOpenedInBrowser,
      build,
    } = await setupTestEngine('fixtures/05-menu/10-syncs-folder-delete-to-page-tree/docs');
    await writeSource('index.rocket.js', 'export default () => html`<h1>Home</h1>`;');
    await writeSource('about/index.rocket.js', 'export default () => html`<h1>About</h1>`;');
    await writeSource('about/me.rocket.js', 'export default () => html`<h1>About Me</h1>`;');
    await build();
    // 👆 ensures a valid setup

    expect(readOutput('index.html')).to.equal(
      [
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-1">',
        '    <li class="  ">',
        '      <a href="/about/">About</a>',
        '      <ul class="lvl-2">',
        '        <li class="  ">',
        '          <a href="/about/me/">About Me</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Home',
      name: 'Home',
      menuLinkText: 'Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
      children: [
        {
          h1: 'About',
          name: 'About',
          menuLinkText: 'About',
          url: '/about/',
          outputRelativeFilePath: 'about/index.html',
          sourceRelativeFilePath: 'about/index.rocket.js',
          level: 1,
          children: [
            {
              h1: 'About Me',
              name: 'About Me',
              menuLinkText: 'About Me',
              url: '/about/me/',
              outputRelativeFilePath: 'about/me/index.html',
              sourceRelativeFilePath: 'about/me.rocket.js',
              level: 2,
            },
          ],
        },
      ],
    });

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');
    await deleteSource('about');

    await anEngineEvent('rocketUpdated');

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      children: [],
      h1: 'Home',
      level: 0,
      menuLinkText: 'Home',
      name: 'Home',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      url: '/',
    });

    expect(readOutput('index.html')).to.equal(
      [
        //
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-1"></ul>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    await cleanup();
  });

  it('11: syncs disk folder rename to pageTree', async () => {
    const {
      readSource,
      writeSource,
      anEngineEvent,
      cleanup,
      engine,
      deleteSource,
      readOutput,
      setAsOpenedInBrowser,
      renameSource,
      build,
    } = await setupTestEngine('fixtures/05-menu/11-syncs-folder-rename-to-page-tree/docs');
    await writeSource('index.rocket.js', 'export default () => html`<h1>Home</h1>`;');
    await writeSource('about/index.rocket.js', 'export default () => html`<h1>About</h1>`;');
    await writeSource('about/me.rocket.js', 'export default () => html`<h1>About Me</h1>`;');
    await deleteSource('about-me');
    await build();
    // 👆 ensures a valid setup

    expect(readOutput('index.html')).to.equal(
      [
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-1">',
        '    <li class="  ">',
        '      <a href="/about/">About</a>',
        '      <ul class="lvl-2">',
        '        <li class="  ">',
        '          <a href="/about/me/">About Me</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Home',
      name: 'Home',
      menuLinkText: 'Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
      children: [
        {
          h1: 'About',
          name: 'About',
          menuLinkText: 'About',
          url: '/about/',
          outputRelativeFilePath: 'about/index.html',
          sourceRelativeFilePath: 'about/index.rocket.js',
          level: 1,
          children: [
            {
              h1: 'About Me',
              name: 'About Me',
              menuLinkText: 'About Me',
              url: '/about/me/',
              outputRelativeFilePath: 'about/me/index.html',
              sourceRelativeFilePath: 'about/me.rocket.js',
              level: 2,
            },
          ],
        },
      ],
    });

    await engine.start();
    setAsOpenedInBrowser('index.rocket.js');

    await renameSource('about', 'about-me');

    await anEngineEvent('rocketUpdated');

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      children: [
        {
          h1: 'About',
          name: 'About',
          menuLinkText: 'About',
          url: '/about-me/',
          outputRelativeFilePath: 'about-me/index.html',
          sourceRelativeFilePath: 'about-me/index.rocket.js',
          level: 1,
          children: [
            {
              h1: 'About Me',
              name: 'About Me',
              menuLinkText: 'About Me',
              url: '/about-me/me/',
              outputRelativeFilePath: 'about-me/me/index.html',
              sourceRelativeFilePath: 'about-me/me.rocket.js',
              level: 2,
            },
          ],
        },
      ],
      h1: 'Home',
      level: 0,
      menuLinkText: 'Home',
      name: 'Home',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      url: '/',
    });

    expect(readOutput('index.html')).to.equal(
      [
        '<nav aria-label="Child List Menu" data-type="child-list-menu">',
        '  <ul class="lvl-1">',
        '    <li class="  ">',
        '      <a href="/about-me/">About</a>',
        '      <ul class="lvl-2">',
        '        <li class="  ">',
        '          <a href="/about-me/me/">About Me</a>',
        '        </li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '<main><h1>Home</h1></main>',
      ].join('\n'),
    );

    await cleanup();
  });

  it('12: can completely exclude a page', async () => {
    const { build, readSource } = await setupTestEngine('fixtures/05-menu/12-exclude/docs');
    await build();

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Home',
      name: 'Home',
      menuLinkText: 'Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
    });
  });

  it('13: modifying exclude while running update the pageTree', async () => {
    const { build, writeSource, readSource, engine, cleanup, anEngineEvent } =
      await setupTestEngine('fixtures/05-menu/13-modify-exclude/docs');
    await writeSource('about.rocket.js', "export default () => '<h1>About</h1>';");
    await build();

    const withAbout = {
      h1: 'Home',
      name: 'Home',
      menuLinkText: 'Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
      children: [
        {
          h1: 'About',
          name: 'About',
          menuLinkText: 'About',
          url: '/about/',
          outputRelativeFilePath: 'about/index.html',
          sourceRelativeFilePath: 'about.rocket.js',
          level: 1,
        },
      ],
    };
    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal(withAbout);

    await engine.start();

    // 1. Remove page from tree as we add the menuExclude
    await writeSource(
      'about.rocket.js',
      [
        //
        'export const menuExclude = true;',
        "export default () => '<h1>About</h1>';",
      ].join('\n'),
    );
    await anEngineEvent('rocketUpdated');
    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Home',
      name: 'Home',
      menuLinkText: 'Home',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
      children: [],
    });

    // 2. Add page to tree as we removed the menuExclude
    await writeSource('about.rocket.js', "export default () => '<h1>About</h1>';");
    await anEngineEvent('rocketUpdated');
    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal(withAbout);

    await cleanup();
  });

  it('14: get-all-text-but-strip-html', async () => {
    const { build, readSource } = await setupTestEngine(
      'fixtures/05-menu/14-get-all-text-but-strip-html/docs',
    );
    await build();

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Hello World of JS (JavaScript)!',
      name: 'Hello World of JS (JavaScript)!',
      menuLinkText: 'Hello World of JS (JavaScript)!',
      url: '/',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      level: 0,
    });
  });

  it('15: markdown special characters', async () => {
    const { build, readSource } = await setupTestEngine(
      'fixtures/05-menu/15-md-special-characters/docs',
    );
    await build();

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      children: [
        {
          h1: '&lt;some-button>',
          headlinesWithId: [
            {
              id: 'some-button',
              level: 1,
              text: '&lt;some-button>',
            },
          ],
          level: 1,
          menuLinkText: '&lt;some-button>',
          name: '&lt;some-button>',
          outputRelativeFilePath: 'component/index.html',
          sourceRelativeFilePath: 'component.rocket.md',
          url: '/component/',
        },
      ],
      h1: 'Fun Errors & Feedback',
      headlinesWithId: [
        {
          id: 'fun-errors--feedback',
          level: 1,
          text: 'Fun Errors & Feedback',
        },
      ],
      level: 0,
      menuLinkText: 'Fun Errors & Feedback',
      name: 'Fun Errors & Feedback',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.md',
      url: '/',
    });
  });

  it('16: link-text attribute', async () => {
    const { build, readSource } = await setupTestEngine(
      'fixtures/05-menu/16-link-text-attribute/docs',
    );
    await build();

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Home',
      headlinesWithId: [
        {
          id: 'home',
          level: 1,
          rawText: 'Welcome to Rocket',
          text: 'Home',
        },
        {
          id: 'first',
          level: 2,
          text: 'First',
        },
        {
          id: 'second',
          level: 2,
          rawText: 'Second is best',
          text: 'Second',
        },
      ],
      level: 0,
      menuLinkText: 'Home',
      name: 'Home',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      url: '/',
    });
  });

  it('17: title-tag', async () => {
    const { build, readSource, deleteSource } = await setupTestEngine(
      'fixtures/05-menu/17-title-tag/docs',
    );
    await deleteSource('pageTreeData.rocketGenerated.json');
    await build();

    expect(JSON.parse(readSource('pageTreeData.rocketGenerated.json'))).to.deep.equal({
      h1: 'Welcome to Rocket',
      level: 0,
      menuLinkText: 'Welcome to Rocket',
      name: 'Welcome to Rocket',
      outputRelativeFilePath: 'index.html',
      sourceRelativeFilePath: 'index.rocket.js',
      title: 'Welcome to Rocket | Rocket',
      url: '/',
    });
  });
});
