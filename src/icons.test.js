import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  createIconAssetStore,
  finalizeRocketIcons,
  iconsFromPackage,
  iconsFromPath,
} from './icons.js';

describe('Test rocket icons', () => {
  it('01: indexes package-backed Icon Library Sources lazily and returns raw SVG', async () => {
    const html = await finalizeRocketIcons(
      '<rocket-icon library="bootstrap" name="alarm"></rocket-icon>',
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
      },
    );

    assert.match(html, /<rocket-icon library="bootstrap" name="alarm">/);
    assert.match(html, /<template shadowrootmode="open">/);
    assert.match(html, /<span part="icon">/);
    assert.match(html, /<svg[^>]*fill="currentColor"[^>]*>/);
    assert.doesNotMatch(html, /data-rocket-icon-manifest|RocketIcon|icon-loading="auto"|size=/);
  });

  it('02: indexes trusted local SVG folder libraries without rewriting SVG content', async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), 'rocket-icons-'));
    const iconDir = path.join(tempRoot, 'icons');
    const rawSvg =
      '<svg viewBox="0 0 8 8" data-order="kept"><path data-z="2" d="M0 0h8v8H0z"/></svg>';

    mkdirSync(iconDir, { recursive: true });
    writeFileSync(path.join(iconDir, 'box.svg'), rawSvg);

    try {
      const html = await finalizeRocketIcons(
        '<rocket-icon library="local" name="box"></rocket-icon>',
        {
          iconLibraries: {
            local: iconsFromPath(path.join(iconDir, '*.svg')),
          },
        },
      );

      assert.equal(
        html,
        `<rocket-icon library="local" name="box"><template shadowrootmode="open"><style>:host{display:inline-block;width:1em;height:1em;vertical-align:-0.125em;line-height:1}:host([hidden]){display:none}span[part="icon"]{display:inline-flex;width:100%;height:100%;line-height:1}span[part="icon"]>svg{display:block;width:100%;height:100%}</style><span part="icon">${rawSvg}</span></template></rocket-icon>`,
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('03: fails with clear errors for invalid Icon References and sources', async () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), 'rocket-icon-errors-'));
    const duplicateDir = path.join(tempRoot, 'duplicates');
    const emptyDir = path.join(tempRoot, 'empty');
    mkdirSync(path.join(duplicateDir, 'one'), { recursive: true });
    mkdirSync(path.join(duplicateDir, 'two'), { recursive: true });
    mkdirSync(emptyDir, { recursive: true });
    writeFileSync(path.join(duplicateDir, 'one', 'same.svg'), '<svg></svg>');
    writeFileSync(path.join(duplicateDir, 'two', 'same.svg'), '<svg></svg>');

    try {
      const libraries = {
        bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        duplicate: iconsFromPath(path.join(duplicateDir, '**/*.svg')),
        empty: iconsFromPath(path.join(emptyDir, '*.svg')),
      };

      await assert.rejects(
        () =>
          finalizeRocketIcons('<rocket-icon library="bootstrap"></rocket-icon>', {
            iconLibraries: libraries,
          }),
        /rocket-icon requires a non-empty name attribute/,
      );
      await assert.rejects(
        () =>
          finalizeRocketIcons('<rocket-icon library="unknown" name="alarm"></rocket-icon>', {
            iconLibraries: libraries,
          }),
        /Unknown Icon Library "unknown"/,
      );
      await assert.rejects(
        () =>
          finalizeRocketIcons('<rocket-icon library="bootstrap" name="missing"></rocket-icon>', {
            iconLibraries: libraries,
          }),
        /Icon "missing" was not found in Icon Library "bootstrap"/,
      );
      await assert.rejects(
        () =>
          finalizeRocketIcons('<rocket-icon library="empty" name="box"></rocket-icon>', {
            iconLibraries: libraries,
          }),
        /Icon Library "empty" source .* matched no SVG files/,
      );
      await assert.rejects(
        () =>
          finalizeRocketIcons('<rocket-icon library="duplicate" name="same"></rocket-icon>', {
            iconLibraries: libraries,
          }),
        /Duplicate Icon Name "same" in Icon Library "duplicate"/,
      );
      await assert.rejects(
        () =>
          finalizeRocketIcons('<rocket-icon name="alarm"></rocket-icon>', {
            iconLibraries: libraries,
          }),
        /Ambiguous unqualified rocket-icon "alarm"/,
      );
      await assert.rejects(
        () =>
          finalizeRocketIcons(
            '<rocket-icon library="bootstrap" name="alarm" icon-loading="lazy"></rocket-icon>',
            {
              iconLibraries: libraries,
            },
          ),
        /Invalid rocket-icon icon-loading "lazy". Expected "auto", "server", or "client"/,
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it('04: emits a passive Icon Manifest and generated raw SVG asset URLs for client-loaded icons', async () => {
    const iconAssetStore = createIconAssetStore();

    const html = await finalizeRocketIcons(
      [
        '<!doctype html><html><head><title>Icons</title></head><body>',
        '<rocket-icon name="alarm" icon-loading="client"></rocket-icon>',
        '<rocket-icon library="bootstrap" name="bell" icon-loading="server"></rocket-icon>',
        '</body></html>',
      ].join(''),
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
        defaultIconLibrary: 'bootstrap',
        iconAssetStore,
      },
    );

    const manifest = readIconManifest(html);

    assert.deepEqual(Object.keys(manifest.icons).sort(), ['bootstrap:alarm', 'bootstrap:bell']);
    assert.equal(manifest.defaultLibrary, 'bootstrap');
    assert.match(
      manifest.icons['bootstrap:alarm'],
      /^\/_rocket\/icons\/bootstrap\/alarm\.[a-f0-9]{12}\.svg$/,
    );
    assert.match(
      manifest.icons['bootstrap:bell'],
      /^\/_rocket\/icons\/bootstrap\/bell\.[a-f0-9]{12}\.svg$/,
    );
    assert.doesNotMatch(
      html.match(
        /<script type="application\/json" data-rocket-icon-manifest>(.*?)<\/script>/,
      )?.[1] || '',
      /<svg/,
    );
    assert.match(
      html,
      /<rocket-icon name="alarm" icon-loading="client"><template shadowrootmode="open">[\s\S]*<span part="icon"><\/span>/,
    );
    assert.match(html, /<rocket-icon library="bootstrap" name="bell" icon-loading="server">/);
    assert.match(
      html,
      /<script type="module" data-rocket-icon-runtime>import '\/_rocket\/rocket-icon\.js';<\/script>/,
    );
    assert.equal(iconAssetStore.needsRuntime, true);

    const outputsByUrl = new Map(iconAssetStore.outputs().map(output => [output.url, output]));
    assert.match(outputsByUrl.get(manifest.icons['bootstrap:alarm'])?.svg || '', /<svg/);
    assert.match(outputsByUrl.get(manifest.icons['bootstrap:bell'])?.svg || '', /<svg/);
  });

  it('05: applies Icon Loading Region budgets only to automatic icons', async () => {
    const iconAssetStore = createIconAssetStore();

    const html = await finalizeRocketIcons(
      [
        '<!doctype html><html><head><title>Icons</title></head><body>',
        '<nav icon-loading-region="primary" icon-server-budget="2">',
        '<rocket-icon name="alarm"></rocket-icon>',
        '<rocket-icon name="bell" icon-loading="server"></rocket-icon>',
        '<rocket-icon name="activity" icon-loading="client"></rocket-icon>',
        '<rocket-icon name="archive"></rocket-icon>',
        '<rocket-icon name="app"></rocket-icon>',
        '</nav>',
        '</body></html>',
      ].join(''),
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
        defaultIconLibrary: 'bootstrap',
        iconAssetStore,
      },
    );

    assertServerIcon(html, 'alarm');
    assertServerIcon(html, 'bell');
    assertClientIcon(html, 'activity');
    assertServerIcon(html, 'archive');
    assertClientIcon(html, 'app');
    assert.doesNotMatch(iconHostHtml(html, 'app'), /icon-loading="client"/);

    const manifest = readIconManifest(html);
    assert.deepEqual(Object.keys(manifest.icons).sort(), [
      'bootstrap:activity',
      'bootstrap:alarm',
      'bootstrap:app',
      'bootstrap:archive',
      'bootstrap:bell',
    ]);
    assert.equal(iconAssetStore.outputs().length, 5);
  });

  it('06: treats zero Icon Server Budgets as deferring every automatic icon', async () => {
    const html = await finalizeRocketIcons(
      [
        '<section icon-loading-region icon-server-budget="0">',
        '<rocket-icon name="alarm"></rocket-icon>',
        '<rocket-icon name="bell" icon-loading="server"></rocket-icon>',
        '</section>',
      ].join(''),
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
        defaultIconLibrary: 'bootstrap',
      },
    );

    assertClientIcon(html, 'alarm');
    assertServerIcon(html, 'bell');
    assert.deepEqual(Object.keys(readIconManifest(html).icons).sort(), [
      'bootstrap:alarm',
      'bootstrap:bell',
    ]);
  });

  it('07: keeps nested Icon Loading Regions independent from parent budgets', async () => {
    const html = await finalizeRocketIcons(
      [
        '<main icon-loading-region icon-server-budget="2">',
        '<rocket-icon name="alarm"></rocket-icon>',
        '<section icon-loading-region icon-server-budget="1">',
        '<rocket-icon name="bell"></rocket-icon>',
        '<rocket-icon name="activity"></rocket-icon>',
        '</section>',
        '<aside icon-loading-region>',
        '<rocket-icon name="archive"></rocket-icon>',
        '<rocket-icon name="app"></rocket-icon>',
        '</aside>',
        '<rocket-icon name="calendar"></rocket-icon>',
        '<rocket-icon name="check"></rocket-icon>',
        '</main>',
      ].join(''),
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
        defaultIconLibrary: 'bootstrap',
      },
    );

    assertServerIcon(html, 'alarm');
    assertServerIcon(html, 'bell');
    assertClientIcon(html, 'activity');
    assertServerIcon(html, 'archive');
    assertServerIcon(html, 'app');
    assertServerIcon(html, 'calendar');
    assertClientIcon(html, 'check');
  });

  it('08: fails clearly for invalid Icon Server Budgets', async () => {
    const options = {
      iconLibraries: {
        bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
      },
      defaultIconLibrary: 'bootstrap',
    };

    for (const budget of [
      'icon-server-budget',
      'icon-server-budget="-1"',
      'icon-server-budget="1.5"',
      'icon-server-budget="many"',
    ]) {
      await assert.rejects(
        () =>
          finalizeRocketIcons(
            `<main icon-loading-region ${budget}><rocket-icon name="alarm"></rocket-icon></main>`,
            options,
          ),
        /Invalid icon-server-budget .* Expected a non-negative integer/,
      );
    }
  });

  it('09: emits manifest runtime for browser-loaded components and includes server icons', async () => {
    const iconAssetStore = createIconAssetStore();

    const html = await finalizeRocketIcons(
      [
        '<!doctype html><html><head><title>Icons</title></head><body>',
        '<rocket-icon name="alarm"></rocket-icon>',
        '<rocket-icon library="bootstrap" name="bell" icon-loading="server"></rocket-icon>',
        '</body></html>',
      ].join(''),
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
        defaultIconLibrary: 'bootstrap',
        iconAssetStore,
        pageData: { _hasBrowserLoadedComponents: true },
      },
    );

    assertServerIcon(html, 'alarm');
    assertServerIcon(html, 'bell');
    assert.match(
      html,
      /<script type="module" data-rocket-icon-runtime>import '\/_rocket\/rocket-icon\.js';<\/script>/,
    );

    const manifest = readIconManifest(html);
    assert.equal(manifest.defaultLibrary, 'bootstrap');
    assert.deepEqual(Object.keys(manifest.icons).sort(), ['bootstrap:alarm', 'bootstrap:bell']);
    assert.equal(iconAssetStore.outputs().length, 2);
    assert.equal(iconAssetStore.needsRuntime, true);
  });

  it('10: omits manifest runtime for server icons when components are server-only', async () => {
    const iconAssetStore = createIconAssetStore();

    const html = await finalizeRocketIcons('<rocket-icon name="alarm"></rocket-icon>', {
      iconLibraries: {
        bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
      },
      defaultIconLibrary: 'bootstrap',
      iconAssetStore,
      pageData: { _hasBrowserLoadedComponents: false },
    });

    assertServerIcon(html, 'alarm');
    assert.doesNotMatch(html, /data-rocket-icon-manifest|data-rocket-icon-runtime/);
    assert.equal(iconAssetStore.outputs().length, 0);
    assert.equal(iconAssetStore.needsRuntime, false);
  });

  it('11: emits manifest entries for explicit PageData Icon References', async () => {
    const iconAssetStore = createIconAssetStore();

    const html = await finalizeRocketIcons(
      '<!doctype html><html><head><title>Icons</title></head><body></body></html>',
      {
        iconLibraries: {
          bootstrap: iconsFromPackage('bootstrap-icons', 'icons/*.svg'),
        },
        defaultIconLibrary: 'bootstrap',
        iconAssetStore,
        pageData: {
          _iconReferences: [{ name: 'plus-square' }, { library: 'bootstrap', name: 'dash-square' }],
        },
      },
    );

    const manifest = readIconManifest(html);

    assert.equal(manifest.defaultLibrary, 'bootstrap');
    assert.deepEqual(Object.keys(manifest.icons).sort(), [
      'bootstrap:dash-square',
      'bootstrap:plus-square',
    ]);
    assert.match(
      html,
      /<script type="module" data-rocket-icon-runtime>import '\/_rocket\/rocket-icon\.js';<\/script>/,
    );
    assert.equal(iconAssetStore.outputs().length, 2);
    assert.equal(iconAssetStore.needsRuntime, true);
  });
});

/**
 * @param {string} html
 * @returns {{ defaultLibrary?: string; icons: Record<string, string> }}
 */
function readIconManifest(html) {
  const match = /<script type="application\/json" data-rocket-icon-manifest>(.*?)<\/script>/.exec(
    html,
  );
  assert.ok(match, 'Expected Icon Manifest script');
  return JSON.parse(match[1]);
}

/**
 * @param {string} html
 * @param {string} name
 */
function assertServerIcon(html, name) {
  assert.match(iconHostHtml(html, name), /<span part="icon"><svg[\s>]/);
}

/**
 * @param {string} html
 * @param {string} name
 */
function assertClientIcon(html, name) {
  assert.match(iconHostHtml(html, name), /<span part="icon"><\/span>/);
}

/**
 * @param {string} html
 * @param {string} name
 */
function iconHostHtml(html, name) {
  const match = new RegExp(
    `<rocket-icon\\b(?=[^>]*\\bname="${name}")[\\s\\S]*?<\\/rocket-icon>`,
  ).exec(html);
  assert.ok(match, `Expected rocket-icon ${name}`);
  return match[0];
}
