import chai from 'chai';
import { executeBuildTree, cleanup, modelComparatorFn } from './test-helpers.js';
import TreeModel from 'tree-model';

const { expect } = chai;
const treeModel = new TreeModel({ modelComparatorFn });

describe('buildTree', () => {
  it('builds a tree for one nested page', async () => {
    const tree = await executeBuildTree('fixtures/two-pages');

    const twoLevels = treeModel.parse({
      name: 'Home',
      level: 0,
      h1: 'Welcome to two pages',
      metaLinkText: 'Home',
      title: 'Welcome to two pages | My Page',
      url: '/',
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
      relPath: 'index.html',
      fileString:
        '<html>\n  <head>\n    <title>Welcome to two pages | My Page</title>\n    <meta name="menu:link.text" content="Home">\n  </head>\n  <body>\n    <header>\n      <web-menu name="site"></web-menu>\n    </header>\n    <main>\n      <h1>Welcome to two pages</h1>\n      Content\n    </main>\n  </body>\n</html>\n',
      children: [
        {
          name: 'About Us',
          url: '/about/',
          level: 1,
          title: 'About Us',
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
          relPath: 'about/index.html',
          fileString:
            '<html>\n  <head>\n    <title>About Us</title>\n  </head>\n  <body>\n    <header>\n      <web-menu name="site"></web-menu>\n    </header>\n    <main>\n      Content\n    </main>\n  </body>\n</html>\n',
        },
      ],
    });

    expect(tree).to.deep.equal(twoLevels);
  });

  it('builds a tree and treats named html files as children of the index', async () => {
    const tree = await executeBuildTree('fixtures/build-named-html-files');

    const twoLevels = treeModel.parse({
      name: 'Home',
      level: 0,
      h1: 'Welcome to two pages',
      metaLinkText: 'Home',
      title: 'Welcome to two pages | My Page',
      url: '/',
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
      relPath: 'index.html',
      fileString:
        '<html>\n  <head>\n    <title>Welcome to two pages | My Page</title>\n    <meta name="menu:link.text" content="Home">\n  </head>\n  <body>\n    <header>\n      <web-menu name="site"></web-menu>\n    </header>\n    <main>\n      <h1>Welcome to two pages</h1>\n      Content\n    </main>\n  </body>\n</html>\n',
      children: [
        {
          name: 'About Us',
          url: '/about.html',
          level: 1,
          title: 'About Us',
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
          relPath: 'about.html',
          fileString:
            '<html>\n  <head>\n    <title>About Us</title>\n  </head>\n  <body>\n    <header>\n      <web-menu name="site"></web-menu>\n    </header>\n    <main>\n      Content\n    </main>\n  </body>\n</html>\n',
        },
      ],
    });

    expect(tree).to.deep.equal(twoLevels);
  });

  it('builds a tree for multiple nested page', async () => {
    const tree = await executeBuildTree('fixtures/nested-pages');

    const nested = treeModel.parse({
      name: 'Home',
      level: 0,
      h1: 'Welcome to two pages',
      metaLinkText: 'Home',
      title: 'Welcome to two pages | My Page',
      url: '/',
      relPath: 'index.html',
      children: [
        {
          name: 'About Us',
          url: '/about/',
          relPath: 'about/index.html',
          level: 1,
          title: 'About Us',
          children: [
            {
              name: 'Career',
              url: '/about/career/',
              relPath: 'about/career/index.html',
              level: 2,
              title: 'Career',
            },
          ],
        },
        {
          name: 'Components',
          url: '/components/',
          relPath: 'components/index.html',
          level: 1,
          title: 'Components',
          children: [
            {
              name: 'Button Blue',
              url: '/components/button-blue/',
              relPath: 'components/button-blue/index.html',
              level: 2,
              title: 'Button Blue',
            },
            {
              name: 'Button Red',
              url: '/components/button-red/',
              relPath: 'components/button-red/index.html',
              level: 2,
              title: 'Button Red',
            },
          ],
        },
      ],
    });

    expect(cleanup(tree)).to.deep.equal(nested);
  });

  it('adds info about table of content', async () => {
    const tree = await executeBuildTree('fixtures/preset-tableOfContents');

    const toc = treeModel.parse({
      name: 'Welcome to the table of contents preset',
      level: 0,
      h1: 'Welcome to the table of contents preset',
      title: 'Welcome to the toc preset | My Page',
      url: '/',
      relPath: 'index.html',
      children: [
        {
          h1: 'Empty because no sub headlines',
          level: 1,
          name: 'Empty because no sub headlines',
          relPath: 'empty/index.html',
          title: 'Welcome to the toc preset | My Page',
          url: '/empty/',
        },
      ],
      tableOfContentsNode: treeModel.parse({
        name: 'Welcome to the table of contents preset',
        level: 1,
        url: '#welcome-to-the-table-of-contents-preset',
        children: [
          {
            name: 'Every headline',
            url: '#every-headline',
            level: 2,
            children: [
              {
                name: 'will be',
                url: '#will-be',
                level: 3,
              },
            ],
          },
          {
            name: 'listed',
            url: '#listed',
            level: 2,
            children: [
              {
                name: 'considering',
                url: '#considering',
                level: 3,
                children: [
                  {
                    name: 'nesting',
                    url: '#nesting',
                    level: 4,
                  },
                  {
                    name: 'and',
                    url: '#and',
                    level: 4,
                  },
                ],
              },
              {
                name: 'returning',
                url: '#returning',
                level: 3,
              },
            ],
          },
          {
            name: 'to the',
            url: '#to-the',
            level: 2,
          },
          {
            name: 'main level',
            url: '#main-level',
            level: 2,
          },
        ],
      }),
    });

    expect(cleanup(tree)).to.deep.equal(toc);
  });
});
