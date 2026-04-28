import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { treeFromPages } from './menu.js';

describe('treeFromPages', () => {
  it('01: groups a page under a custom menu parent without changing the page URL', () => {
    const pageTree = treeFromPages(
      new Map([
        ['/', page('/', 'Home', { menu: false })],
        ['/guides', page('/guides', 'Guides', { menu: { noLink: true, order: 10 } })],
        [
          '/component-loading',
          page('/component-loading', 'Component Loading', {
            menu: { parent: '/guides', order: 10 },
          }),
        ],
      ]),
    );

    assert.deepEqual(pageTree.children, [
      {
        name: 'guides',
        url: '/guides',
        file: '/guides.rocket.md',
        module: {
          config: {
            path: '/guides',
            metadata: { title: 'Guides' },
            menu: { noLink: true, order: 10 },
          },
        },
        children: [
          {
            name: 'component-loading',
            url: '/component-loading',
            file: '/component-loading.rocket.md',
            module: {
              config: {
                path: '/component-loading',
                metadata: { title: 'Component Loading' },
                menu: { parent: '/guides', order: 10 },
              },
            },
            children: [],
            linkText: 'Component Loading',
            menuNoLink: undefined,
          },
        ],
        linkText: 'Guides',
        menuNoLink: true,
      },
    ]);
  });

  it('02: flattens nested URL paths when pages share a shallower menu parent', () => {
    const pageTree = treeFromPages(
      new Map([
        ['/', page('/', 'Home', { menu: false })],
        ['/tutorials', page('/tutorials', 'Build a Site', { menu: { noLink: true } })],
        [
          '/tutorials/acme-ui-docs',
          page('/tutorials/acme-ui-docs', 'Overview', {
            menu: { parent: '/tutorials', order: 10 },
          }),
        ],
        [
          '/tutorials/acme-ui-docs/create-project',
          page('/tutorials/acme-ui-docs/create-project', 'Create the project shell', {
            menu: { parent: '/tutorials', order: 20 },
          }),
        ],
      ]),
    );

    const tutorials = pageTree.children[0];

    assert.equal(tutorials.linkText, 'Build a Site');
    assert.deepEqual(
      tutorials.children.map(child => child.linkText),
      ['Overview', 'Create the project shell'],
    );
    assert.deepEqual(
      tutorials.children.map(child => child.url),
      ['/tutorials/acme-ui-docs', '/tutorials/acme-ui-docs/create-project'],
    );
  });

  it('03: builds menu link text from normalized Page Metadata', () => {
    const pageTree = treeFromPages(
      new Map([
        [
          '/',
          metadataPage('/', {
            title: 'Home',
            config: { menu: false },
          }),
        ],
        [
          '/guides',
          metadataPage('/guides', {
            title: 'Guides',
            linkText: 'Docs guides',
          }),
        ],
        [
          '/guides/component-loading',
          metadataPage('/guides/component-loading', {
            title: 'Component Loading Strategies',
          }),
        ],
      ]),
    );

    assert.deepEqual(
      pageTree.children.map(child => child.linkText),
      ['Docs guides'],
    );
    assert.deepEqual(
      pageTree.children[0].children.map(child => child.linkText),
      ['Component Loading Strategies'],
    );
  });

  it('04: exposes configured menu icon names on page tree nodes', () => {
    const pageTree = treeFromPages(
      new Map([
        ['/', page('/', 'Home', { menu: false })],
        [
          '/setup/build-with-ai',
          metadataPage('/setup/build-with-ai', {
            title: 'Start With AI',
            linkText: 'Start with AI',
            config: { menu: { iconName: 'stars', order: 10 } },
          }),
        ],
      ]),
    );

    assert.equal(pageTree.children[0].linkText, 'Setup');
    assert.equal(pageTree.children[0].children[0].linkText, 'Start with AI');
    assert.equal(pageTree.children[0].children[0].iconName, 'stars');
  });
});

/**
 * @param {string} path
 * @param {string} title
 * @param {Partial<import('@rocket/js/types.js').PageConfig>} config
 * @returns {import('@rocket/js/types.js').Page}
 */
function page(path, title, config = {}) {
  return {
    file: `${path}.rocket.md`,
    metadata: { title },
    module: {
      config: {
        path,
        metadata: { title },
        ...config,
      },
    },
  };
}

/**
 * @param {string} path
 * @param {{ title: string; linkText?: string; config?: Partial<import('@rocket/js/types.js').PageConfig> }} options
 * @returns {import('@rocket/js/types.js').Page}
 */
function metadataPage(path, { title, linkText, config = {} }) {
  return {
    file: `${path}.rocket.md`,
    metadata: { title, ...(linkText ? { linkText } : {}) },
    module: {
      config: {
        path,
        ...config,
      },
    },
  };
}
