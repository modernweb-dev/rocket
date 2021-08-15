import chai from 'chai';

import { executeParse } from './test-helpers.js';

const { expect } = chai;

describe('parseHtmlFile', () => {
  it('extracts meta data for a single menu', async () => {
    const metaData = await executeParse('fixtures/single-menu-header.html');

    expect(metaData).to.deep.equal({
      __tocElements: [],
      fileString:
        '<html>\n  <head>\n    <title>Single Menu Header</title>\n  </head>\n  <body>\n    <header>\n      <web-menu name="site"></web-menu>\n    </header>\n  </body>\n</html>\n',
      menus: [
        {
          end: {
            character: 28,
            line: 6,
          },
          name: 'site',
          start: {
            character: 28,
            line: 6,
          },
        },
      ],
      name: 'Single Menu Header',
      title: 'Single Menu Header',
      relPath: 'single-menu-header.html',
    });
  });

  it('extracts meta data for multiple menus', async () => {
    const metaData = await executeParse('fixtures/two-pages/index.html', { rootDir: 'fixtures' });

    expect(metaData).to.deep.equal({
      __tocElements: [],
      title: 'Welcome to two pages | My Page',
      metaLinkText: 'Home',
      h1: 'Welcome to two pages',
      name: 'Home',
      fileString:
        '<html>\n  <head>\n    <title>Welcome to two pages | My Page</title>\n    <meta name="menu:link.text" content="Home">\n  </head>\n  <body>\n    <header>\n      <web-menu name="site"></web-menu>\n    </header>\n    <main>\n      <h1>Welcome to two pages</h1>\n      Content\n    </main>\n  </body>\n</html>\n',
      menus: [
        {
          end: {
            character: 28,
            line: 7,
          },
          name: 'site',
          start: {
            character: 28,
            line: 7,
          },
        },
      ],
      relPath: 'two-pages/index.html',
    });
  });

  it('only consider the first title tag (should be the one in the head)', async () => {
    const metaData = await executeParse('fixtures/ignore-title-in-body.html');
    expect(metaData.title).to.equal('Ignore title in body');
  });
});
