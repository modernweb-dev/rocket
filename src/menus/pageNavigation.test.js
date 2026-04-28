import assert from 'node:assert/strict';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { describe, it } from 'node:test';

import { treeFromPages } from '../menu.js';
import { RocketNextPage } from './RocketNextPage.js';
import { RocketPreviousPage } from './RocketPreviousPage.js';
import { pageNavigationLinks } from './pageNavigation.js';

describe('pageNavigationLinks', () => {
  it('01: finds adjacent linkable pages with section labels', () => {
    const links = pageNavigationLinks(makePageTree(), '/guides/component-loading');

    assert.deepEqual(links, {
      previous: {
        url: '/start/build-with-ai',
        linkText: 'Build with AI',
        sectionLabel: 'Start',
      },
      next: {
        url: '/guides/deploy',
        linkText: 'Deploy',
        sectionLabel: 'Guides',
      },
    });
  });

  it('02: skips no-link pages and returns null at the edges', () => {
    const pageTree = makePageTree();

    assert.deepEqual(pageNavigationLinks(pageTree, '/'), {
      previous: null,
      next: {
        url: '/start/build-with-ai',
        linkText: 'Build with AI',
        sectionLabel: 'Start',
      },
    });
    assert.deepEqual(pageNavigationLinks(pageTree, '/guides/deploy'), {
      previous: {
        url: '/guides/component-loading',
        linkText: 'Component Loading',
        sectionLabel: 'Guides',
      },
      next: null,
    });
  });

  it('03: renders no placeholder text when an adjacent page is missing', async () => {
    const previousPage = new RocketPreviousPage();
    previousPage.pageTree = makePageTree();
    previousPage.currentPath = '/start/build-with-ai';

    const body = await ssrRender(previousPage.render());

    assert.equal(withoutLitComments(body), '');
    assert.doesNotMatch(body, /No previous page/);
  });

  it('04: renders directional card content with arrows in the expected order', async () => {
    const pageTree = makePageTree();
    const previousPage = new RocketPreviousPage();
    previousPage.pageTree = pageTree;
    previousPage.currentPath = '/guides/component-loading';
    const nextPage = new RocketNextPage();
    nextPage.pageTree = pageTree;
    nextPage.currentPath = '/guides/component-loading';

    const previousBody = await ssrRender(previousPage.render());
    const nextBody = await ssrRender(nextPage.render());

    assert.match(previousBody, /Previous Page/);
    assert.match(previousBody, /Build with AI/);
    assert.match(previousBody, /Start/);
    assert.match(previousBody, /<svg[\s\S]*class="page-card-arrow"/);
    assert.match(previousBody, /<path d="M31 8H6m7-6-7 6 7 6"/);
    assert.match(
      previousBody,
      /<a[\s\S]*class="page-card previous"[\s\S]*<span class="page-card-icon"[\s\S]*<span class="page-card-text"/,
    );

    assert.match(nextBody, /Next Page/);
    assert.match(nextBody, /Deploy/);
    assert.match(nextBody, /Guides/);
    assert.match(nextBody, /<svg[\s\S]*class="page-card-arrow"/);
    assert.match(nextBody, /<path d="M5 8h25m-7-6 7 6-7 6"/);
    assert.match(
      nextBody,
      /<a[\s\S]*class="page-card next"[\s\S]*<span class="page-card-text"[\s\S]*<span class="page-card-icon"/,
    );
  });
});

/**
 * @param {unknown} template
 */
async function ssrRender(template) {
  return collectResult(render(template));
}

/**
 * @param {string} value
 */
function withoutLitComments(value) {
  return value.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * @returns {import('@rocket/js/types.js').PageTree}
 */
function makePageTree() {
  return treeFromPages(
    new Map([
      ['/', page('/', 'Home', { menu: false })],
      ['/start', page('/start', 'Start', { menu: { noLink: true, order: 10 } })],
      [
        '/start/build-with-ai',
        page('/start/build-with-ai', 'Build with AI', {
          menu: { parent: '/start', order: 10 },
        }),
      ],
      ['/guides', page('/guides', 'Guides', { menu: { noLink: true, order: 20 } })],
      [
        '/guides/component-loading',
        page('/guides/component-loading', 'Component Loading', {
          menu: { parent: '/guides', order: 10 },
        }),
      ],
      [
        '/guides/deploy',
        page('/guides/deploy', 'Deploy', {
          menu: { parent: '/guides', order: 20 },
        }),
      ],
    ]),
  );
}

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
