import chai from 'chai';
import { findCurrentNode, Menu } from '../index.js';

import TreeModel from 'tree-model';

import { formatHtml } from './test-helpers.js';

const { expect } = chai;

const tree = new TreeModel({});

const twoLevels = tree.parse({
  name: 'Root',
  level: 0,
  url: '#',
  children: [
    { name: 'Home', url: '#', level: 1 },
    { name: 'About', url: '#', level: 1, children: [{ name: 'Career', url: '#', level: 2 }] },
  ],
});

const defaultMenu = new Menu();

describe('renderMenu', () => {
  it('can build a menu only for the first level', async () => {
    class FirstLevelMenu extends Menu {
      childCondition = node => node.model.level === 0;
    }
    const myMenu = new FirstLevelMenu();

    const htmlNavigation = await myMenu.render(twoLevels);
    expect(formatHtml(htmlNavigation)).to.equal(
      [
        '<nav aria-label="index">',
        '  <ul class="lvl-1">',
        '    <li><a href="#">Home</a></li>',
        '    <li><a href="#">About</a></li>',
        '  </ul>',
        '</nav>',
        '',
      ].join('\n'),
    );
  });

  it('can customize the render function completely', async () => {
    class FlatMenu extends Menu {
      async render(node) {
        return node.children.map(child => this.link(child)).join('\n');
      }
    }
    const myMenu = new FlatMenu();
    const htmlNavigation = await myMenu.render(twoLevels);
    expect(htmlNavigation).to.equal(
      [
        //
        '<a href="#">Home</a>',
        '<a href="#">About</a>',
      ].join('\n'),
    );
  });

  it('can build a nested tree', async () => {
    const components = tree.parse({
      name: 'Root',
      level: 0,
      url: '#',
      children: [
        { name: 'Home', url: '#', level: 1 },
        {
          name: 'Components',
          url: '#',
          level: 1,
          children: [
            { name: 'Accordion', url: '#', level: 2 },
            { name: 'Button', url: '#', level: 2 },
          ],
        },
      ],
    });
    const htmlNavigation = await defaultMenu.render(components);
    expect(formatHtml(htmlNavigation)).to.equal(
      [
        '<nav aria-label="index">',
        '  <ul class="lvl-1">',
        '    <li><a href="#">Home</a></li>',
        '    <li>',
        '      <a href="#">Components</a>',
        '      <ul class="lvl-2">',
        '        <li><a href="#">Accordion</a></li>',
        '        <li><a href="#">Button</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '',
      ].join('\n'),
    );
  });

  it('puts classes for the active "path" and the current page', async () => {
    const componentsActive = tree.parse({
      name: 'Root',
      level: 0,
      children: [
        { name: 'Home', url: '#', level: 1 },
        {
          name: 'Components',
          url: '#',
          level: 1,
          active: true,
          children: [
            { name: 'Accordion', url: '#', level: 2 },
            { name: 'Button', url: '#', level: 2, current: true },
          ],
        },
      ],
    });
    defaultMenu.currentNode = findCurrentNode(componentsActive);
    const htmlNavigation = await defaultMenu.render(componentsActive);
    expect(formatHtml(htmlNavigation)).to.equal(
      [
        '<nav aria-label="index">',
        '  <ul class="lvl-1">',
        '    <li><a href="#">Home</a></li>',
        '    <li class="web-menu-active">',
        '      <a href="#">Components</a>',
        '      <ul class="lvl-2">',
        '        <li><a href="#">Accordion</a></li>',
        '        <li class="web-menu-current"><a href="#" aria-current="page">Button</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</nav>',
        '',
      ].join('\n'),
    );
  });
});
