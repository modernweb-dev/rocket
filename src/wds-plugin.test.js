import assert from 'node:assert/strict';
import fs, { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { register } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MessageChannel } from 'node:worker_threads';
import { describe, it } from 'node:test';
import createRocketPlugin from './wds-plugin.js';

describe('Test wdsPlugin', () => {
  it('01: returns Page Runtime 404 responses for missing document requests', async () => {
    const resolverPort = /** @type {import('node:worker_threads').MessagePort} */ (
      /** @type {unknown} */ ({
        on() {
          return this;
        },
        postMessage() {},
      })
    );
    const plugin = createRocketPlugin([], [], resolverPort);
    const serverStart = plugin.serverStart;

    if (typeof serverStart !== 'function') {
      assert.fail('expected serverStart hook');
    }
    await serverStart(/** @type {any} */ ({ webSockets: { sendImport() {} } }));

    const context = {
      header: { accept: 'text/html' },
      path: '/missing',
      url: '/missing',
      origin: 'https://rocket.test',
      method: 'GET',
      status: 200,
    };

    const serve = plugin.serve;
    if (typeof serve !== 'function') {
      assert.fail('expected serve hook');
    }
    const result = await serve(/** @type {any} */ (context));

    assert.equal(context.status, 404);
    assert.deepEqual(result, {
      body: 'Page not found',
      type: 'text/plain;charset=UTF-8',
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
  });

  it('02: returns URL Lifecycle Redirect responses from project config', async () => {
    const resolverPort = /** @type {import('node:worker_threads').MessagePort} */ (
      /** @type {unknown} */ ({
        on() {
          return this;
        },
        postMessage() {},
      })
    );
    const plugin = createRocketPlugin([], [], resolverPort, {
      redirects: [{ source: '/old', target: '/new', status: 302 }],
    });
    const serverStart = plugin.serverStart;

    if (typeof serverStart !== 'function') {
      assert.fail('expected serverStart hook');
    }
    await serverStart(/** @type {any} */ ({ webSockets: { sendImport() {} } }));

    const context = {
      header: { accept: 'text/html' },
      path: '/old',
      url: '/old',
      origin: 'https://rocket.test',
      method: 'GET',
      status: 200,
    };

    const serve = plugin.serve;
    if (typeof serve !== 'function') {
      assert.fail('expected serve hook');
    }
    const result = await serve(/** @type {any} */ (context));

    assert.equal(context.status, 302);
    assert.deepEqual(result, {
      body: '',
      type: 'text/html',
      headers: {
        location: '/new',
      },
    });
  });

  it('03: serves Public Assets and watches the public directory', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-public-assets-dev-'));
    const originalCwd = process.cwd();
    /** @type {string[]} */
    const watchedPaths = [];
    mkdirSync(path.join(projectRoot, 'public'), { recursive: true });
    writeFileSync(path.join(projectRoot, 'public/favicon.svg'), '<svg>favicon</svg>');

    process.chdir(projectRoot);
    try {
      const resolverPort = /** @type {import('node:worker_threads').MessagePort} */ (
        /** @type {unknown} */ ({
          on() {
            return this;
          },
          postMessage() {},
        })
      );
      const plugin = createRocketPlugin([], [], resolverPort);
      const serverStart = plugin.serverStart;

      if (typeof serverStart !== 'function') {
        assert.fail('expected serverStart hook');
      }
      await serverStart(
        /** @type {any} */ ({
          fileWatcher: {
            /** @param {string} filePath */
            add(filePath) {
              watchedPaths.push(filePath);
            },
          },
          webSockets: { sendImport() {} },
        }),
      );

      const context = {
        header: { accept: '*/*' },
        path: '/favicon.svg',
        url: '/favicon.svg',
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };

      const serve = plugin.serve;
      if (typeof serve !== 'function') {
        assert.fail('expected serve hook');
      }
      const result = /** @type {any} */ (await serve(/** @type {any} */ (context)));

      assert.deepEqual(watchedPaths, [path.join(process.cwd(), 'public')]);
      assert.ok(Buffer.isBuffer(result?.body));
      assert.equal(result.body.toString('utf8'), '<svg>favicon</svg>');
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('04: rejects Public Asset collisions with generated discoverability outputs', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-public-assets-dev-collision-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'public'), { recursive: true });
    writeFileSync(path.join(projectRoot, 'public/sitemap.xml'), '<xml></xml>');

    process.chdir(projectRoot);
    try {
      const resolverPort = /** @type {import('node:worker_threads').MessagePort} */ (
        /** @type {unknown} */ ({
          on() {
            return this;
          },
          postMessage() {},
        })
      );
      const plugin = createRocketPlugin([], [], resolverPort, {
        siteDiscoverability: { sitemap: true },
      });
      const serverStart = plugin.serverStart;

      if (typeof serverStart !== 'function') {
        assert.fail('expected serverStart hook');
      }
      await assert.rejects(async () => {
        await serverStart(/** @type {any} */ ({ webSockets: { sendImport() {} } }));
      }, /Public Asset public\/sitemap\.xml collides with generated Sitemap at \/sitemap\.xml/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('05: serves Social Preview Template Preview HTML for a selected Page in development', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-social-preview-dev-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/runtime.rocket.js'),
      `
export const config = {
  path: '/guides/runtime',
  metadata: {
    title: 'Runtime Guide',
    description: 'Learn runtime rendering.',
  },
  menu: false,
};

export default function runtimeGuide() {
  return '<main>Runtime Guide</main>';
}
      `,
    );

    process.chdir(projectRoot);
    /** @type {(() => void) | undefined} */
    let serverStop;
    /** @type {import('node:worker_threads').MessagePort | undefined} */
    let resolverPort;
    try {
      const { port1, port2 } = new MessageChannel();
      resolverPort = port2;
      register('./markdownHook.js', {
        parentURL: import.meta.url,
        data: { port: port1 },
        transferList: [port1],
      });
      const plugin = createRocketPlugin(['docs/**/*.rocket.js'], [], port2, {
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {
            template({ page }) {
              return `<main data-page="${page.pathname}"><h1>${page.title}</h1><p>${page.description}</p><a>${page.canonicalUrl}</a></main>`;
            },
          },
        },
      });
      const serverStart = plugin.serverStart;

      if (typeof serverStart !== 'function') {
        assert.fail('expected serverStart hook');
      }
      serverStop = typeof plugin.serverStop === 'function' ? plugin.serverStop : undefined;
      await serverStart(/** @type {any} */ ({ webSockets: { sendImport() {} } }));

      const context = {
        header: { accept: 'text/html' },
        path: '/_rocket/social-preview-template-preview/template',
        url: '/_rocket/social-preview-template-preview/template?page=%2Fguides%2Fruntime',
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };

      const serve = plugin.serve;
      if (typeof serve !== 'function') {
        assert.fail('expected serve hook');
      }
      const result = /** @type {any} */ (await serve(/** @type {any} */ (context)));

      assert.equal(context.status, 200);
      assert.equal(result.type, 'text/html; charset=utf-8');
      assert.equal(
        result.body,
        '<main data-page="/guides/runtime"><h1>Runtime Guide</h1><p>Learn runtime rendering.</p><a>https://docs.rocket.test/guides/runtime</a></main>',
      );
    } finally {
      serverStop?.();
      resolverPort?.close();
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('06: serves generated client icon SVG assets through development URLs', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-client-icons-dev-'));
    const originalCwd = process.cwd();
    const iconDir = path.join(projectRoot, 'src/icons');
    const rawSvg = '<svg viewBox="0 0 8 8"><path d="M0 0h8v8H0z"/></svg>';
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    mkdirSync(iconDir, { recursive: true });
    writeFileSync(path.join(iconDir, 'box.svg'), rawSvg);
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = {
  path: '/',
  metadata: { title: 'Home' },
  menu: false,
};

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/icons.rocket.js'),
      `
export const config = {
  path: '/icons',
  metadata: { title: 'Icons' },
  menu: false,
};

export default function iconsPage() {
  return '<main><rocket-icon name="box" icon-loading="client"></rocket-icon></main>';
}
      `,
    );

    process.chdir(projectRoot);
    /** @type {(() => void) | undefined} */
    let serverStop;
    /** @type {import('node:worker_threads').MessagePort | undefined} */
    let resolverPort;
    const originalWatch = fs.watch;
    try {
      // @ts-expect-error Test stub only needs the close method used by serverStop.
      fs.watch = () => ({
        close() {},
      });
      const { port1, port2 } = new MessageChannel();
      resolverPort = port2;
      register('./markdownHook.js', {
        parentURL: import.meta.url,
        data: { port: port1 },
        transferList: [port1],
      });
      const plugin = createRocketPlugin(['docs/**/*.rocket.js'], [], port2, {
        iconLibraries: {
          local: { type: 'path', files: path.join(iconDir, '*.svg') },
        },
        defaultIconLibrary: 'local',
      });
      const serverStart = plugin.serverStart;
      if (typeof serverStart !== 'function') {
        assert.fail('expected serverStart hook');
      }
      serverStop = typeof plugin.serverStop === 'function' ? plugin.serverStop : undefined;
      await serverStart(/** @type {any} */ ({ webSockets: { sendImport() {} } }));

      const serve = plugin.serve;
      if (typeof serve !== 'function') {
        assert.fail('expected serve hook');
      }
      const pageContext = {
        header: { accept: 'text/html' },
        path: '/icons',
        url: '/icons',
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };

      const pageResult = /** @type {any} */ (await serve(/** @type {any} */ (pageContext)));
      const manifest = readIconManifest(pageResult.body);
      const assetUrl = manifest.icons['local:box'];
      const assetContext = {
        header: { accept: 'image/svg+xml' },
        path: new URL(assetUrl, 'https://rocket.test').pathname,
        url: assetUrl,
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };

      const assetResult = /** @type {any} */ (await serve(/** @type {any} */ (assetContext)));

      assert.match(assetUrl, /^\/_rocket\/icons\/local\/box\.[a-f0-9]{12}\.svg$/);
      assert.equal(assetResult.type, 'image/svg+xml');
      assert.equal(assetResult.body, rawSvg);
    } finally {
      serverStop?.();
      resolverPort?.close();
      fs.watch = originalWatch;
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('07: reloads Page template modules under src without restarting', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-template-dev-'));
    const originalCwd = process.cwd();
    const docsDir = path.join(projectRoot, 'docs');
    const srcDir = path.join(projectRoot, 'src');
    const layoutFile = path.join(srcDir, 'siteLayout.js');
    mkdirSync(docsDir, { recursive: true });
    mkdirSync(srcDir, { recursive: true });
    writeFileSync(
      path.join(docsDir, 'index.rocket.js'),
      `
import { renderTemplate } from '../src/siteLayout.js';

export const config = {
  path: '/',
  metadata: { title: 'Home' },
  menu: false,
};

export default function homePage() {
  return renderTemplate();
}
      `,
    );
    writeFileSync(
      layoutFile,
      `
export function renderTemplate() {
  return '<main data-template="one">Home</main>';
}
      `,
    );

    process.chdir(projectRoot);
    /** @type {(() => void) | undefined} */
    let serverStop;
    /** @type {import('node:worker_threads').MessagePort | undefined} */
    let resolverPort;
    const originalWatch = fs.watch;
    /** @type {Map<string, import('node:fs').WatchListener<string>>} */
    const watchedDirectories = new Map();
    /** @type {string[]} */
    const reloads = [];
    try {
      // @ts-expect-error Test stub only needs the close method used by serverStop.
      fs.watch = (directory, optionsOrListener, maybeListener) => {
        const listener =
          typeof optionsOrListener === 'function' ? optionsOrListener : maybeListener;
        if (typeof listener !== 'function') {
          assert.fail('expected fs.watch listener');
        }
        watchedDirectories.set(
          directory.toString(),
          /** @type {import('node:fs').WatchListener<string>} */ (listener),
        );
        return {
          close() {},
        };
      };
      const { port1, port2 } = new MessageChannel();
      resolverPort = port2;
      register('./markdownHook.js', {
        parentURL: import.meta.url,
        data: { port: port1 },
        transferList: [port1],
      });
      const plugin = createRocketPlugin(['docs/**/*.rocket.js'], [], port2);
      const serverStart = plugin.serverStart;
      if (typeof serverStart !== 'function') {
        assert.fail('expected serverStart hook');
      }
      serverStop = typeof plugin.serverStop === 'function' ? plugin.serverStop : undefined;
      await serverStart(
        /** @type {any} */ ({
          webSockets: {
            /** @param {string} importPath */
            sendImport(importPath) {
              reloads.push(importPath);
            },
          },
        }),
      );

      assert.ok(watchedDirectories.has('docs/'));
      assert.ok(watchedDirectories.has('src/'));

      const serve = plugin.serve;
      if (typeof serve !== 'function') {
        assert.fail('expected serve hook');
      }
      const context = {
        header: { accept: 'text/html' },
        path: '/',
        url: '/',
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };
      const initialResult = /** @type {any} */ (await serve(/** @type {any} */ (context)));
      assert.match(initialResult.body, /data-template="one"/);

      writeFileSync(
        layoutFile,
        `
export function renderTemplate() {
  return '<main data-template="two">Home</main>';
}
        `,
      );
      watchedDirectories.get('src/')?.('change', 'siteLayout.js');
      await waitFor(() => reloads.length === 1);

      const updatedContext = {
        header: { accept: 'text/html' },
        path: '/',
        url: '/',
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };
      const updatedResult = /** @type {any} */ (await serve(/** @type {any} */ (updatedContext)));
      assert.match(updatedResult.body, /data-template="two"/);
    } finally {
      serverStop?.();
      resolverPort?.close();
      fs.watch = originalWatch;
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('08: renders Page Runtime responses for iframe navigation requests', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-iframe-page-dev-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = {
  path: '/',
  metadata: { title: 'Home' },
  menu: false,
};

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/frame.rocket.js'),
      `
export const config = {
  path: '/frame',
  metadata: { title: 'Frame' },
  menu: false,
};

export default function framePage() {
  return '<main data-frame="true">Frame route</main>';
}
      `,
    );

    process.chdir(projectRoot);
    /** @type {(() => void) | undefined} */
    let serverStop;
    const originalWatch = fs.watch;
    try {
      // @ts-expect-error Test stub only needs the close method used by serverStop.
      fs.watch = () => ({
        close() {},
      });
      const resolverPort = /** @type {import('node:worker_threads').MessagePort} */ (
        /** @type {unknown} */ ({
          on() {
            return this;
          },
          postMessage() {},
        })
      );
      const plugin = createRocketPlugin(['docs/**/*.rocket.js'], [], resolverPort);
      const serverStart = plugin.serverStart;
      if (typeof serverStart !== 'function') {
        assert.fail('expected serverStart hook');
      }
      serverStop = typeof plugin.serverStop === 'function' ? plugin.serverStop : undefined;
      await serverStart(/** @type {any} */ ({ webSockets: { sendImport() {} } }));

      const serve = plugin.serve;
      if (typeof serve !== 'function') {
        assert.fail('expected serve hook');
      }
      const context = {
        header: {
          accept: 'text/html',
          'sec-fetch-dest': 'iframe',
        },
        path: '/frame',
        url: '/frame',
        origin: 'https://rocket.test',
        method: 'GET',
        status: 200,
      };

      const result = /** @type {any} */ (await serve(/** @type {any} */ (context)));

      assert.equal(context.status, 200);
      assert.equal(result.type, 'text/html; charset=utf-8');
      assert.match(result.body, /data-frame="true"/);
    } finally {
      serverStop?.();
      fs.watch = originalWatch;
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
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
 * @param {() => boolean} predicate
 */
async function waitFor(predicate) {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > 1000) {
      assert.fail('Timed out waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
