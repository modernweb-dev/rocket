import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRobotsFile, createSitemap } from './siteDiscoverability.js';

describe('Test siteDiscoverability', () => {
  it('01: creates a Sitemap for concrete Pages and excludes Standalone Demo URLs', () => {
    const sitemap = createSitemap({
      siteOrigin: 'https://docs.rocket.test/',
      pages: new Map([
        [
          '/demos',
          makePage({
            path: '/demos',
            file: 'docs/demos.rocket.md',
            demoNames: ['simpleButton'],
          }),
        ],
        [
          '/live',
          makePage({
            path: '/live',
            file: 'docs/live.rocket.js',
            renderMode: 'server',
          }),
        ],
        [
          '/components/:componentName',
          makePage({
            path: '/components/:componentName',
            file: 'docs/component.rocket.js',
            renderMode: 'server',
          }),
        ],
      ]),
    });

    assert.deepEqual(readSitemapLocations(sitemap), [
      'https://docs.rocket.test/demos',
      'https://docs.rocket.test/live',
    ]);
    assert.doesNotMatch(sitemap, /_demo|simpleButton|:componentName/);
  });

  it('02: creates a Robots File directive for disallowed Pages and omits allowed Pages', () => {
    const robots = createRobotsFile({
      siteOrigin: 'https://docs.rocket.test/',
      pages: new Map([
        [
          '/private',
          makePage({
            path: '/private',
            discoverability: { robots: 'disallow' },
          }),
        ],
        [
          '/public',
          makePage({
            path: '/public',
            discoverability: { robots: 'allow' },
          }),
        ],
        ['/default', makePage({ path: '/default' })],
      ]),
    });

    assert.equal(
      robots,
      [
        'User-agent: *',
        'Disallow: /private',
        '',
        'Sitemap: https://docs.rocket.test/sitemap.xml',
        '',
      ].join('\n'),
    );
  });

  it('03: keeps Site Head Metadata indexing separate from Robots File directives', () => {
    const robots = createRobotsFile({
      siteOrigin: 'https://docs.rocket.test/',
      pages: new Map([
        [
          '/draft',
          makePage({
            path: '/draft',
            discoverability: { robots: 'allow' },
            siteHeadMetadata: { indexing: 'noindex' },
          }),
        ],
        [
          '/private',
          makePage({
            path: '/private',
            discoverability: { robots: 'disallow' },
            siteHeadMetadata: { indexing: 'index' },
          }),
        ],
      ]),
    });

    assert.equal(
      robots,
      [
        'User-agent: *',
        'Disallow: /private',
        '',
        'Sitemap: https://docs.rocket.test/sitemap.xml',
        '',
      ].join('\n'),
    );
    assert.doesNotMatch(robots, /draft|noindex|index/);
  });
});

/**
 * @param {{
 *   path?: string;
 *   file?: string;
 *   renderMode?: 'static' | 'server';
 *   demoNames?: string[];
 *   discoverability?: { sitemap?: boolean; robots?: 'allow' | 'disallow' };
 *   siteHeadMetadata?: { indexing?: 'index' | 'noindex' };
 * }} [options]
 */
function makePage({
  path = '/example',
  file = 'docs/example.rocket.md',
  renderMode = 'static',
  demoNames = [],
  discoverability,
  siteHeadMetadata,
} = {}) {
  return {
    file,
    module: {
      config: {
        path,
        render: renderMode,
        discoverability,
        siteHeadMetadata,
        metadata: { title: 'Example' },
      },
    },
    metadata: { title: 'Example', linkText: 'Example' },
    demoNames,
  };
}

/**
 * @param {string} sitemap
 */
function readSitemapLocations(sitemap) {
  return Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => match[1]);
}
