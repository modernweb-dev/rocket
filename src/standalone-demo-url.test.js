import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  matchStandaloneDemoUrl,
  parseStandaloneDemoUrl,
  standaloneDemoPath,
  standaloneDemoPaths,
  standaloneDemoRoutePattern,
  standaloneDemoRoutePatterns,
  standaloneDemoUrl,
} from './standalone-demo-url.js';

describe('Test standaloneDemoUrl', () => {
  it('01: uses generated child paths', () => {
    assert.equal(
      standaloneDemoUrl('https://rocket.test/basics/demos?tab=source#simpleButton', 'simpleButton'),
      'https://rocket.test/basics/demos/_demo/simpleButton/',
    );
    assert.equal(
      standaloneDemoUrl('https://rocket.test/basics/demos/', 'simpleButton'),
      'https://rocket.test/basics/demos/_demo/simpleButton/',
    );
    assert.equal(
      standaloneDemoPath('/basics/demos', 'simpleButton'),
      '/basics/demos/_demo/simpleButton/',
    );
  });

  it('02: requires the canonical trailing slash when parsing', () => {
    assert.deepEqual(parseStandaloneDemoUrl('/basics/demos/_demo/simpleButton/'), {
      parentPathname: '/basics/demos',
      demoName: 'simpleButton',
    });
    assert.equal(parseStandaloneDemoUrl('/basics/demos/_demo/simpleButton'), null);
    assert.equal(parseStandaloneDemoUrl('/basics/demos?standaloneDemo=simpleButton'), null);
  });

  it('03: returns the parent Markdown Page and Page Variant when matching', () => {
    const page = makePage({
      path: '/guide/:slug',
      file: 'docs/guide.rocket.md',
      demoNames: ['serverButton'],
    });
    const pages = makePageRegistry(page);

    const match = matchStandaloneDemoUrl(
      '/guide/runtime/_demo/serverButton/',
      'https://rocket.test',
      pages,
    );

    assert.deepEqual(match, {
      page,
      routePath: '/guide/:slug',
      params: { slug: 'runtime' },
      variant: { kind: 'standalone-demo', demoName: 'serverButton' },
    });
  });

  it('04: matches generated demo URLs for Page paths with and without trailing slashes', () => {
    for (const pagePath of ['/javascript-demo', '/javascript-demo/']) {
      const page = makePage({
        path: pagePath,
        file: 'docs/javascript-demo.rocket.md',
        demoNames: ['demoCard'],
      });

      const match = matchStandaloneDemoUrl(
        '/javascript-demo/_demo/demoCard/',
        'https://rocket.test',
        makePageRegistry(page),
      );

      assert.deepEqual(
        {
          routePath: match?.routePath,
          params: match?.params,
          variant: match?.variant,
          pagePath: match?.page.module.config.path,
        },
        {
          routePath: pagePath,
          params: {},
          variant: { kind: 'standalone-demo', demoName: 'demoCard' },
          pagePath,
        },
      );
    }
  });

  it('05: ignores unknown demos and JavaScript Pages when matching', () => {
    assert.equal(
      matchStandaloneDemoUrl(
        '/button/_demo/missing/',
        'https://rocket.test',
        makePageRegistry(
          makePage({
            path: '/button',
            file: 'docs/button.rocket.md',
            demoNames: ['buttonDemo'],
          }),
        ),
      ),
      null,
    );
    assert.equal(
      matchStandaloneDemoUrl(
        '/app/_demo/buttonDemo/',
        'https://rocket.test',
        makePageRegistry(
          makePage({
            path: '/app',
            file: 'docs/app.rocket.js',
            demoNames: ['buttonDemo'],
          }),
        ),
      ),
      null,
    );
  });

  it('06: generates paths and route patterns for Markdown Pages only', () => {
    const markdownPage = makePage({
      path: '/guide',
      file: 'docs/guide.rocket.md',
      demoNames: ['serverButton', 'advancedButton'],
    });
    const javascriptPage = makePage({
      path: '/app',
      file: 'docs/app.rocket.js',
      demoNames: ['ignoredDemo'],
    });

    assert.deepEqual(standaloneDemoPaths('/guide', markdownPage), [
      '/guide/_demo/serverButton/',
      '/guide/_demo/advancedButton/',
    ]);
    assert.deepEqual(standaloneDemoPaths('/app', javascriptPage), []);
    assert.equal(standaloneDemoRoutePattern('/guide/:slug'), '/guide/:slug/_demo/:demoName/');
    assert.deepEqual(standaloneDemoRoutePatterns('/guide/:slug', markdownPage), [
      '/guide/:slug/_demo/:demoName/',
    ]);
    assert.deepEqual(standaloneDemoRoutePatterns('/app', javascriptPage), []);
  });
});

/**
 * @param {{ path?: string; file?: string; title?: string; demoNames?: string[] }} [options]
 */
function makePage({
  path = '/example',
  file = 'docs/example.rocket.md',
  title = 'Example',
  demoNames = [],
} = {}) {
  return {
    file,
    module: { config: { path, metadata: { title } } },
    metadata: { title, linkText: title },
    demoNames,
  };
}

/**
 * @param {...ReturnType<typeof makePage>} pages
 */
function makePageRegistry(...pages) {
  return new Map(pages.map(page => [page.module.config.path, page]));
}
