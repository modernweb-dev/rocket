import chai from 'chai';
import TreeModel from 'tree-model';
import { insertMenus } from '../src/insertMenus.js';
import { Site } from '../src/menus/Site.js';
import { formatHtml } from './test-helpers.js';

const { expect } = chai;
const treeModel = new TreeModel({});

describe('insertMenus', () => {
  it('will adjust the fileString of the tree', async () => {
    const onePage = treeModel.parse({
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
      level: 0,
      name: 'Single Menu Header',
      title: 'Single Menu Header',
      children: [
        { name: 'Getting Started', url: '#', level: 1 },
        { name: 'Components', url: '#', level: 1 },
        { name: 'Blog', url: '#', level: 1 },
      ],
    });

    await insertMenus(onePage, {
      plugins: [new Site()]
    });

    expect(formatHtml(onePage.model.fileString)).to.equal(
      [
        '<html>',
        '  <head>',
        '    <title>Single Menu Header</title>',
        '  </head>',
        '  <body>',
        '    <header>',
        '      <web-menu name="site">',
        '        <nav aria-label="site">',
        '          <a href="#">Getting Started</a>',
        '          <a href="#">Components</a>',
        '          <a href="#">Blog</a>',
        '        </nav>',
        '      </web-menu>',
        '    </header>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),
    );
  });
});
