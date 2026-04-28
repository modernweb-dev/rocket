import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  assertPublicAssetsOutputDir,
  discoverPublicAssets,
  publicAssetRequestPaths,
  validatePublicAssetCollisions,
} from './publicAssets.js';

describe('Test publicAssets', () => {
  it('01: discovers regular Public Assets and ignores dotfiles except .well-known', () => {
    const projectRoot = makeTempProject('rocket-public-assets-discover-');
    try {
      mkdirSync(path.join(projectRoot, 'public/images'), { recursive: true });
      mkdirSync(path.join(projectRoot, 'public/.well-known'), { recursive: true });
      mkdirSync(path.join(projectRoot, 'public/.git'), { recursive: true });
      writeFileSync(path.join(projectRoot, 'public/favicon.svg'), '<svg></svg>');
      writeFileSync(path.join(projectRoot, 'public/images/logo.txt'), 'logo');
      writeFileSync(path.join(projectRoot, 'public/.well-known/security.txt'), 'security');
      writeFileSync(path.join(projectRoot, 'public/.DS_Store'), 'ignored');
      writeFileSync(path.join(projectRoot, 'public/.git/config'), 'ignored');

      assert.deepEqual(
        discoverPublicAssets(projectRoot).map(asset => asset.relativePath),
        ['.well-known/security.txt', 'favicon.svg', 'images/logo.txt'],
      );
    } finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('02: maps index.html Public Assets to document request paths', () => {
    assert.deepEqual(
      publicAssetRequestPaths({
        file: '/project/public/index.html',
        relativePath: 'index.html',
        publicPath: '/index.html',
      }),
      ['/index.html', '/'],
    );
    assert.deepEqual(
      publicAssetRequestPaths({
        file: '/project/public/about/index.html',
        relativePath: 'about/index.html',
        publicPath: '/about/index.html',
      }),
      ['/about/index.html', '/about/', '/about'],
    );
  });

  it('03: rejects symlinks in public', () => {
    const projectRoot = makeTempProject('rocket-public-assets-symlink-');
    try {
      mkdirSync(path.join(projectRoot, 'public'), { recursive: true });
      writeFileSync(path.join(projectRoot, 'target.svg'), '<svg></svg>');
      symlinkSync(path.join(projectRoot, 'target.svg'), path.join(projectRoot, 'public/icon.svg'));

      assert.throws(
        () => discoverPublicAssets(projectRoot),
        /Public Asset public\/icon\.svg is a symbolic link.*regular files/s,
      );
    } finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('04: rejects Public Asset URL collisions with Pages and generated outputs', () => {
    const assets = [
      {
        file: '/project/public/about/index.html',
        relativePath: 'about/index.html',
        publicPath: '/about/index.html',
      },
      {
        file: '/project/public/sitemap.xml',
        relativePath: 'sitemap.xml',
        publicPath: '/sitemap.xml',
      },
    ];
    const pages = new Map([
      [
        '/about',
        {
          file: 'docs/about.rocket.md',
          module: { config: { path: '/about', metadata: { title: 'About' } } },
          metadata: { title: 'About' },
        },
      ],
    ]);

    assert.throws(
      () =>
        validatePublicAssetCollisions({
          publicAssets: assets,
          pages,
          generatedPages: pages,
          config: /** @type {any} */ ({ siteDiscoverability: { sitemap: true } }),
        }),
      /Public Asset public\/about\/index\.html collides with configured Page docs\/about\.rocket\.md at \/about/,
    );

    assert.throws(
      () =>
        validatePublicAssetCollisions({
          publicAssets: [assets[1]],
          pages: new Map(),
          generatedPages: new Map(),
          config: /** @type {any} */ ({ siteDiscoverability: { sitemap: true } }),
        }),
      /Public Asset public\/sitemap\.xml collides with generated Sitemap at \/sitemap\.xml/,
    );
  });

  it('05: rejects Public Asset URL collisions with generated Social Preview Images', () => {
    const page = {
      file: 'docs/about.rocket.md',
      module: { config: { path: '/about', metadata: { title: 'About' } } },
      metadata: { title: 'About' },
    };

    assert.throws(
      () =>
        validatePublicAssetCollisions({
          publicAssets: [
            {
              file: '/project/public/_rocket/social-preview/card.png',
              relativePath: '_rocket/social-preview/card.png',
              publicPath: '/_rocket/social-preview/card.png',
            },
          ],
          pages: new Map([['/about', page]]),
          generatedPages: new Map([['/about', page]]),
          config: /** @type {any} */ ({
            siteHeadMetadata: { socialPreview: { delivery: 'static' } },
          }),
        }),
      /Public Asset public\/_rocket\/social-preview\/card\.png collides with Default Social Preview Image for Page \/about at \/_rocket\/social-preview\/card\.png/,
    );
  });

  it('06: rejects build output directories inside public', () => {
    assert.throws(
      () =>
        assertPublicAssetsOutputDir({
          projectRoot: '/project',
          outDir: '/project/public',
        }),
      /Invalid build output directory .*public.*reserved for Public Assets/,
    );

    assert.throws(
      () =>
        assertPublicAssetsOutputDir({
          projectRoot: '/project',
          outDir: '/project/public/dist',
        }),
      /Invalid build output directory .*public\/dist.*reserved for Public Assets/,
    );
  });
});

/**
 * @param {string} prefix
 */
function makeTempProject(prefix) {
  return mkdtempSync(path.join(tmpdir(), prefix));
}
