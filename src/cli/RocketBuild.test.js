import assert from 'node:assert/strict';
import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { html } from 'lit';
import { RocketBuild, renderStaticPages, splitPages } from './RocketBuild.js';
import { PageRuntimeError } from '../page-runtime.js';
import { netlify } from '../adapters/netlify.js';
import { document } from '../layouts/layout-helper.js';
import { iconsFromPath } from '../icons.js';

describe('Test RocketBuild', () => {
  it('01: splits static and server-rendered Pages', () => {
    const pages = new Map([
      ['/static', makePage({ path: '/static', file: 'docs/static.rocket.md' })],
      ['/live', makePage({ path: '/live', file: 'docs/live.rocket.md', renderMode: 'server' })],
    ]);

    const { staticPages, serverPages } = splitPages(pages);

    assert.deepEqual(Array.from(staticPages.keys()), ['/static']);
    assert.deepEqual(Array.from(serverPages.keys()), ['/live']);
  });

  it('02: rejects unknown render modes', () => {
    const pages = new Map([
      [
        '/bad',
        makePage({
          path: '/bad',
          file: 'docs/bad.rocket.md',
          renderMode: /** @type {any} */ ('edge'),
        }),
      ],
    ]);

    assert.throws(() => splitPages(pages), /Invalid render mode/);
  });

  it('03: renders static Markdown Pages through Page Runtime requests', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-build-'));
    const originalCwd = process.cwd();
    const page = makePage({ path: '/guides/runtime', file: 'docs/runtime.rocket.md' });
    const pages = makePageRegistry(page);
    /** @type {any} */
    let loadCall;

    process.chdir(projectRoot);
    try {
      await renderStaticPages({
        pages,
        staticPages: new Map([[page.module.config.path, page]]),
        pageModuleLoader: {
          async load(options) {
            loadCall = options;
            return {
              kind: 'markdown',
              /** @param {any} data */
              contentFn(data) {
                return [`<main>Built ${data.url}</main>`];
              },
            };
          },
        },
      });

      assert.equal(loadCall.page, page);
      assert.equal(loadCall.routePath, '/guides/runtime');
      assert.equal(loadCall.request.url, 'http://localhost/guides/runtime');
      assert.equal(loadCall.variant, 'default');
      assert.equal(
        readFileSync('tmp-dist-rocket/guides/runtime/index.html', 'utf8'),
        '<main>Built /guides/runtime</main>',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('04: renders static JavaScript Pages through Page Runtime requests', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-js-build-'));
    const originalCwd = process.cwd();
    const page = makePage({
      path: '/status',
      file: 'docs/status.rocket.js',
      title: 'Status',
      renderMode: undefined,
    });
    const pages = makePageRegistry(page);
    const { staticPages, serverPages } = splitPages(new Map([[page.module.config.path, page]]));
    /** @type {any} */
    let loadCall;
    /** @type {Request | undefined} */
    let receivedRequest;
    /** @type {any} */
    let receivedContext;

    assert.deepEqual(Array.from(staticPages.keys()), ['/status']);
    assert.equal(serverPages.size, 0);

    process.chdir(projectRoot);
    try {
      await renderStaticPages({
        pages,
        staticPages,
        origin: 'https://build.rocket.test',
        pageModuleLoader: {
          async load(options) {
            loadCall = options;
            return {
              kind: 'javascript',
              /**
               * @param {Request} request
               * @param {any} context
               */
              body(request, context) {
                receivedRequest = request;
                receivedContext = context;
                return `<main>${context.pageData.title} ${context.pageData.url}</main>`;
              },
            };
          },
        },
      });

      assert.equal(loadCall.page, page);
      assert.equal(loadCall.routePath, '/status');
      assert.equal(loadCall.request.url, 'https://build.rocket.test/status');
      assert.equal(loadCall.variant, 'default');
      assert.equal(receivedRequest?.url, 'https://build.rocket.test/status');
      assert.deepEqual(receivedContext.params, {});
      assert.equal(receivedContext.adapterContext, undefined);
      assert.equal(receivedContext.pageData.title, 'Status');
      assert.equal(receivedContext.pageData.url, '/status');
      assert.equal(
        readFileSync('tmp-dist-rocket/status/index.html', 'utf8'),
        '<main>Status /status</main>',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('05: builds concrete JavaScript Pages with the production static loader', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-build-js-page-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/status.rocket.js'),
      `
        export const config = { path: '/status', metadata: { title: 'Status' } };

        export default function statusPage(request, { pageData }) {
          const origin = new URL(request.url).origin;
          return '<main>' + pageData.title + ' ' + pageData.url + ' ' + origin + '</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(
        readFileSync('dist/status/index.html', 'utf8'),
        '<main>Status /status http://localhost</main>',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('06: normalizes static JavaScript Page results during build', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-js-results-'));
    const originalCwd = process.cwd();
    const cases = [
      {
        path: '/values/response',
        value: new Response('Accepted', { status: 202, headers: { 'content-type': 'text/plain' } }),
        output: 'Accepted',
      },
      { path: '/values/string', value: '<h1>Hello</h1>', output: '<h1>Hello</h1>' },
      { path: '/values/object', value: { ok: true }, output: '{"ok":true}' },
      { path: '/values/null', value: null, output: '' },
      { path: '/values/undefined', value: undefined, output: '' },
    ];
    const casePages = cases.map(({ path }) =>
      makePage({ path, file: `docs${path}.rocket.js`, renderMode: undefined }),
    );
    const pages = makePageRegistry(...casePages);
    const staticPages = new Map(casePages.map(page => [page.module.config.path, page]));
    const valuesByPath = new Map(cases.map(({ path, value }) => [path, value]));

    process.chdir(projectRoot);
    try {
      await renderStaticPages({
        pages,
        staticPages,
        pageModuleLoader: {
          async load({ routePath }) {
            return {
              kind: 'javascript',
              body() {
                return valuesByPath.get(routePath);
              },
            };
          },
        },
      });

      for (const { path: casePath, output } of cases) {
        assert.equal(
          readFileSync(`tmp-dist-rocket${casePath}/index.html`, 'utf8'),
          output,
          casePath,
        );
      }
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('07: builds paginated archive output from a static JavaScript Page', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-paginated-archive-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs/posts'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/blog.rocket.js'),
      `
export const config = { path: '/blog', metadata: { title: 'Blog' }, menu: false };

export const pagination = pageData => ({
  pageSize: 2,
  collection: pageData.pages.query({
    tags: 'post',
    pathPrefix: '/posts/',
    sortBy: 'date',
    sortDirection: 'desc',
  }),
});

export default function blogArchive(_request, { pageData }) {
  const pagination = pageData.pagination;
  const registryPaths = Array.from(pageData.pageRegistry.keys()).join('|');
  const links = pagination.items
    .map(post => '<a href="' + post.url + '">' + post.metadata.title + '</a>')
    .join('');
  return '<main data-url="' + pageData.url + '" data-current="' + pagination.currentPage + '" data-total="' + pagination.totalPages + '" data-base="' + pagination.basePath + '" data-next="' + (pagination.nextPath || '') + '" data-previous="' + (pagination.previousPath || '') + '">' + links + '</main><aside data-registry="' + registryPaths + '"></aside>';
}
      `,
    );
    for (const post of [
      { slug: 'oldest', title: 'Oldest Post', date: '2026-05-05' },
      { slug: 'older', title: 'Older Post', date: '2026-05-10' },
      { slug: 'middle', title: 'Middle Post', date: '2026-05-15' },
      { slug: 'newer', title: 'Newer Post', date: '2026-05-20' },
      { slug: 'newest', title: 'Newest Post', date: '2026-05-25' },
    ]) {
      writeFileSync(
        path.join(projectRoot, `docs/posts/${post.slug}.rocket.js`),
        `
export const config = {
  path: '/posts/${post.slug}',
  metadata: { title: '${post.title}', date: '${post.date}', tags: ['post'] },
  menu: false,
};

export default function postPage() {
  return '<main>${post.title}</main>';
}
        `,
      );
    }
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      const firstPageHtml = readFileSync('dist/blog/index.html', 'utf8');
      const secondPageHtml = readFileSync('dist/blog/2/index.html', 'utf8');
      const thirdPageHtml = readFileSync('dist/blog/3/index.html', 'utf8');

      assert.match(firstPageHtml, /data-url="\/blog"/);
      assert.match(firstPageHtml, /data-current="1"/);
      assert.match(firstPageHtml, /data-total="3"/);
      assert.match(firstPageHtml, /data-base="\/blog\/"/);
      assert.match(firstPageHtml, /data-next="\/blog\/2\/"/);
      assert.match(firstPageHtml, /data-previous=""/);
      assert.match(firstPageHtml, /<a href="\/posts\/newest">Newest Post<\/a>/);
      assert.match(firstPageHtml, /<a href="\/posts\/newer">Newer Post<\/a>/);
      assert.doesNotMatch(firstPageHtml, /Middle Post|Older Post|Oldest Post/);
      assert.doesNotMatch(readDataAttribute(firstPageHtml, 'registry'), /\/blog\/2\//);

      assert.match(secondPageHtml, /data-url="\/blog\/2\/"/);
      assert.match(secondPageHtml, /data-current="2"/);
      assert.match(secondPageHtml, /data-total="3"/);
      assert.match(secondPageHtml, /data-base="\/blog\/"/);
      assert.match(secondPageHtml, /data-next="\/blog\/3\/"/);
      assert.match(secondPageHtml, /data-previous="\/blog\/"/);
      assert.match(secondPageHtml, /<a href="\/posts\/middle">Middle Post<\/a>/);
      assert.match(secondPageHtml, /<a href="\/posts\/older">Older Post<\/a>/);
      assert.doesNotMatch(secondPageHtml, /Newest Post|Newer Post|Oldest Post/);
      assert.doesNotMatch(readDataAttribute(secondPageHtml, 'registry'), /\/blog\/2\//);

      assert.match(thirdPageHtml, /data-url="\/blog\/3\/"/);
      assert.match(thirdPageHtml, /data-current="3"/);
      assert.match(thirdPageHtml, /data-total="3"/);
      assert.match(thirdPageHtml, /data-base="\/blog\/"/);
      assert.match(thirdPageHtml, /data-next=""/);
      assert.match(thirdPageHtml, /data-previous="\/blog\/2\/"/);
      assert.match(thirdPageHtml, /<a href="\/posts\/oldest">Oldest Post<\/a>/);
      assert.doesNotMatch(thirdPageHtml, /Newest Post|Newer Post|Middle Post|Older Post/);

      assert.equal(existsSync('dist/blog/1/index.html'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('08: wraps render failures while preserving Page Runtime errors', async () => {
    const page = makePage({ path: '/broken', file: 'docs/broken.rocket.md' });
    const pages = makePageRegistry(page);
    const renderError = new Error('build render exploded');

    await assert.rejects(
      () =>
        renderStaticPages({
          pages,
          staticPages: new Map([[page.module.config.path, page]]),
          pageModuleLoader: {
            async load() {
              return {
                kind: 'markdown',
                contentFn() {
                  throw renderError;
                },
              };
            },
          },
        }),
      error => {
        if (!(error instanceof Error)) {
          return false;
        }
        const cause = error.cause;
        assert.match(error.message, /Failed to render page: \/broken/);
        assert.ok(cause instanceof PageRuntimeError);
        assert.equal(cause.code, 'PAGE_RENDER_FAILED');
        assert.equal(cause.page, page);
        assert.equal(cause.routePath, '/broken');
        assert.equal(cause.cause, renderError);
        return true;
      },
    );
  });

  it('09: renders Standalone Demo documents for static Markdown Pages', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-demos-'));
    const originalCwd = process.cwd();
    const staticPage = makePage({
      path: '/runtime',
      file: 'docs/runtime.rocket.md',
      demoNames: ['inlineButton', 'advancedButton'],
    });
    const serverPage = makePage({
      path: '/live',
      file: 'docs/live.rocket.md',
      renderMode: 'server',
      demoNames: ['serverButton'],
    });
    const pages = makePageRegistry(staticPage, serverPage);
    /** @type {{ variant: unknown }[]} */
    const loadCalls = [];

    process.chdir(projectRoot);
    try {
      await renderStaticPages({
        pages,
        staticPages: new Map([[staticPage.module.config.path, staticPage]]),
        pageModuleLoader: {
          async load(options) {
            loadCalls.push(options);
            return {
              kind: 'markdown',
              /**
               * @param {any} data
               * @param {any} selectedLayout
               */
              contentFn(data, selectedLayout) {
                if (
                  typeof options.variant === 'object' &&
                  options.variant.kind === 'standalone-demo'
                ) {
                  data.content = html`<main>
                    <rocket-js-demo
                      demo-name=${options.variant.demoName}
                      single-demo
                    ></rocket-js-demo>
                    Standalone ${options.variant.demoName}
                  </main>`;
                } else {
                  data.content = html`<main>
                    <rocket-js-demo demo-name="inlineButton">
                      <pre class="source-panel">source</pre>
                    </rocket-js-demo>
                    Parent Page
                  </main>`;
                }
                return render(selectedLayout(data));
              },
            };
          },
        },
      });

      assert.deepEqual(
        loadCalls.map(call => call.variant),
        [
          'default',
          { kind: 'standalone-demo', demoName: 'inlineButton' },
          { kind: 'standalone-demo', demoName: 'advancedButton' },
        ],
      );

      const parentHtml = readFileSync('tmp-dist-rocket/runtime/index.html', 'utf8');
      const inlineDemoHtml = readFileSync(
        'tmp-dist-rocket/runtime/_demo/inlineButton/index.html',
        'utf8',
      );
      const advancedDemoHtml = readFileSync(
        'tmp-dist-rocket/runtime/_demo/advancedButton/index.html',
        'utf8',
      );

      assert.match(parentHtml, /Parent Page/);
      assert.match(parentHtml, /source-panel/);
      assert.match(inlineDemoHtml, /Standalone[\s\S]*inlineButton/);
      assert.match(inlineDemoHtml, /single-demo/);
      assert.doesNotMatch(
        inlineDemoHtml,
        /source-panel|Parent Page|id="menu"|Back|open-standalone-demo|copy-standalone-demo|summary="Source"/,
      );
      assert.match(advancedDemoHtml, /Standalone[\s\S]*advancedButton/);
      assert.equal(existsSync('tmp-dist-rocket/live/_demo/serverButton/index.html'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('10: fails when a configured Page collides with a Standalone Demo URL', async () => {
    const staticPage = makePage({
      path: '/runtime',
      file: 'docs/runtime.rocket.md',
      demoNames: ['inlineButton'],
    });
    const collisionPage = makePage({
      path: '/runtime/_demo/inlineButton',
      file: 'docs/collision.rocket.md',
    });
    const pages = makePageRegistry(staticPage, collisionPage);
    let loaded = false;

    await assert.rejects(
      () =>
        renderStaticPages({
          pages,
          staticPages: new Map([
            [staticPage.module.config.path, staticPage],
            [collisionPage.module.config.path, collisionPage],
          ]),
          pageModuleLoader: {
            async load() {
              loaded = true;
              return {
                kind: 'markdown',
                contentFn: () => ['should not render'],
              };
            },
          },
        }),
      error => {
        if (!(error instanceof Error)) {
          return false;
        }
        assert.match(error.message, /Standalone Demo URL \/runtime\/_demo\/inlineButton\//);
        assert.match(error.message, /docs\/runtime\.rocket\.md/);
        assert.match(error.message, /configured Page docs\/collision\.rocket\.md/);
        assert.match(error.message, /\/runtime\/_demo\/inlineButton/);
        assert.equal(loaded, false);
        return true;
      },
    );
  });

  it('11: fails when a generated Standalone Demo renders a non-2xx response', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-demo-404-'));
    const originalCwd = process.cwd();
    const registryPage = makePage({
      path: '/runtime',
      file: 'docs/runtime.rocket.md',
      demoNames: [],
    });
    const staticPage = makePage({
      path: '/runtime',
      file: 'docs/runtime.rocket.md',
      demoNames: ['inlineButton'],
    });

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () =>
          renderStaticPages({
            pages: makePageRegistry(registryPage),
            staticPages: new Map([[staticPage.module.config.path, staticPage]]),
            pageModuleLoader: {
              async load() {
                return {
                  kind: 'markdown',
                  contentFn: () => ['<main>Parent</main>'],
                };
              },
            },
          }),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Failed to render page: \/runtime/);
          assert.match(
            error.message,
            /Standalone Demo URL \/runtime\/_demo\/inlineButton\/ for page docs\/runtime\.rocket\.md returned HTTP 404/,
          );
          assert.ok(error.cause instanceof Error);
          assert.match(
            error.cause.message,
            /Standalone Demo URL \/runtime\/_demo\/inlineButton\/ for page docs\/runtime\.rocket\.md returned HTTP 404/,
          );
          assert.match(error.cause.message, /Page not found/);
          assert.equal(existsSync('tmp-dist-rocket/runtime/_demo/inlineButton/index.html'), false);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('12: fails static JavaScript Pages with parameterized paths before output', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-js-params-'));
    const originalCwd = process.cwd();
    const page = makePage({
      path: '/components/:componentName',
      file: 'docs/components.rocket.js',
      renderMode: undefined,
    });
    const pages = makePageRegistry(page);
    const { staticPages } = splitPages(new Map([[page.module.config.path, page]]));
    let loaded = false;

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () =>
          renderStaticPages({
            pages,
            staticPages,
            pageModuleLoader: {
              async load() {
                loaded = true;
                return {
                  kind: 'javascript',
                  body: () => '<main>should not render</main>',
                };
              },
            },
          }),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Static JavaScript Page/);
          assert.match(error.message, /\/components\/:componentName/);
          assert.match(error.message, /render: 'server'/);
          assert.equal(loaded, false);
          assert.equal(existsSync('tmp-dist-rocket'), false);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('13: builds static JavaScript Page file outputs from extension paths', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-json-page-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/docs-index.rocket.js'),
      `
        export const config = {
          path: '/api/docs-index.json',
          metadata: { title: 'Docs Index' },
          menu: false,
        };

        export default function docsIndexPage() {
          return {
            title: 'Docs Index',
            pages: [
              { title: 'Start With AI', url: '/setup/build-with-ai' },
              { title: 'Pages', url: '/basics/pages' },
            ],
          };
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(
        readFileSync('dist/api/docs-index.json', 'utf8'),
        '{"title":"Docs Index","pages":[{"title":"Start With AI","url":"/setup/build-with-ai"},{"title":"Pages","url":"/basics/pages"}]}',
      );
      assert.equal(existsSync('dist/api/docs-index.json/index.html'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('14: emits Sitemap URLs for public concrete Pages when explicitly enabled', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-sitemap-build-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/status.rocket.js'),
      `
        export const config = { path: '/status', metadata: { title: 'Status' } };

        export default function statusPage() {
          return '<main>Status</main>';
        }
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/hidden.rocket.js'),
      `
        export const config = { path: '/hidden', metadata: { title: 'Hidden' }, menu: false };

        export default function hiddenPage() {
          return '<main>Hidden</main>';
        }
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/live.rocket.js'),
      `
        export const config = { path: '/live', metadata: { title: 'Live' }, render: 'server' };

        export default function livePage() {
          return '<main>Live</main>';
        }
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/component.rocket.js'),
      `
        export const config = {
          path: '/components/:componentName',
          metadata: { title: 'Component' },
          render: 'server',
          menu: false,
        };

        export default function componentPage() {
          return '<main>Component</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
        adapter: {
          name: 'test-adapter',
          build() {},
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
      assert.deepEqual(readSitemapLocations(sitemap), [
        'https://docs.rocket.test/',
        'https://docs.rocket.test/hidden',
        'https://docs.rocket.test/live',
        'https://docs.rocket.test/status',
      ]);
      assert.doesNotMatch(sitemap, /components|:componentName|_demo/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('15: does not emit Site Discoverability outputs when only the Site Origin is configured', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-sitemap-disabled-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' } };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(existsSync('dist/sitemap.xml'), false);
      assert.equal(existsSync('dist/robots.txt'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('16: fails with an author-facing error when the Sitemap has no Site Origin', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-sitemap-missing-origin-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' } };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteDiscoverability: { sitemap: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => build.build(),
        /Site Discoverability Sitemap requires a Site Origin.*siteOrigin/s,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('17: honors Page-level Sitemap opt-out without changing rendering or navigation', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-sitemap-page-options-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage(request, { pageData }) {
  const links = pageData.pageTree.children
    .map(page => '<a href="' + page.url + '">' + page.linkText + '</a>')
    .join('');
  return '<nav>' + links + '</nav><main>Home body</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/private.rocket.js'),
      `
export const config = {
  path: '/private',
  metadata: { title: 'Private' },
  discoverability: { sitemap: false },
  menu: { order: 10 },
};

export default function privatePage() {
  return '<main>Private body</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/status.rocket.js'),
      `
export const config = {
  path: '/status',
  metadata: { title: 'Status' },
  menu: { order: 20 },
};

export default function statusPage() {
  return '<main>Status body</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/hidden.rocket.js'),
      `
export const config = { path: '/hidden', metadata: { title: 'Hidden' }, menu: false };

export default function hiddenPage() {
  return '<main>Hidden body</main>';
}
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
      assert.deepEqual(readSitemapLocations(sitemap), [
        'https://docs.rocket.test/',
        'https://docs.rocket.test/hidden',
        'https://docs.rocket.test/status',
      ]);

      const homeHtml = readFileSync('dist/index.html', 'utf8');
      const privateHtml = readFileSync('dist/private/index.html', 'utf8');
      const hiddenHtml = readFileSync('dist/hidden/index.html', 'utf8');

      assert.match(privateHtml, /Private body/);
      assert.match(hiddenHtml, /Hidden body/);
      assert.match(homeHtml, /href="\/private"/);
      assert.match(homeHtml, /Private/);
      assert.doesNotMatch(homeHtml, /href="\/hidden"/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('18: emits a Robots File with canonical Sitemap URL when explicitly enabled', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-robots-build-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' } };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test/',
        siteDiscoverability: { robots: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(
        readFileSync('dist/robots.txt', 'utf8'),
        'Sitemap: https://docs.rocket.test/sitemap.xml\n',
      );
      assert.equal(existsSync('dist/sitemap.xml'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('19: emits the Robots File in the same build as the Sitemap', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-robots-with-sitemap-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' } };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true, robots: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(existsSync('dist/sitemap.xml'), true);
      assert.equal(
        readFileSync('dist/robots.txt', 'utf8'),
        'Sitemap: https://docs.rocket.test/sitemap.xml\n',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('20: fails with an author-facing error when the Robots File has no Site Origin', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-robots-missing-origin-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
        export const config = { path: '/', metadata: { title: 'Home' } };

        export default function homePage() {
          return '<main>Home</main>';
        }
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteDiscoverability: { robots: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => build.build(),
        /Site Discoverability Robots File requires a Site Origin.*siteOrigin/s,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('21: honors Page-level Robots File options without changing Sitemap rendering or navigation', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-robots-page-options-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage(request, { pageData }) {
  const links = pageData.pageTree.children
    .map(page => '<a href="' + page.url + '">' + page.linkText + '</a>')
    .join('');
  return '<nav>' + links + '</nav><main>Home body</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/private.rocket.js'),
      `
export const config = {
  path: '/private',
  metadata: { title: 'Private' },
  discoverability: { robots: 'disallow' },
  menu: { order: 10 },
};

export default function privatePage() {
  return '<main>Private body</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/public.rocket.js'),
      `
export const config = {
  path: '/public',
  metadata: { title: 'Public' },
  discoverability: { robots: 'allow' },
  menu: { order: 20 },
};

export default function publicPage() {
  return '<main>Public body</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/default.rocket.js'),
      `
export const config = { path: '/default', metadata: { title: 'Default' }, menu: false };

export default function defaultPage() {
  return '<main>Default body</main>';
}
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true, robots: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(
        readFileSync('dist/robots.txt', 'utf8'),
        [
          'User-agent: *',
          'Disallow: /private',
          '',
          'Sitemap: https://docs.rocket.test/sitemap.xml',
          '',
        ].join('\n'),
      );

      const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
      assert.deepEqual(readSitemapLocations(sitemap), [
        'https://docs.rocket.test/',
        'https://docs.rocket.test/default',
        'https://docs.rocket.test/private',
        'https://docs.rocket.test/public',
      ]);

      const homeHtml = readFileSync('dist/index.html', 'utf8');
      const privateHtml = readFileSync('dist/private/index.html', 'utf8');
      const publicHtml = readFileSync('dist/public/index.html', 'utf8');
      const defaultHtml = readFileSync('dist/default/index.html', 'utf8');

      assert.match(privateHtml, /Private body/);
      assert.match(publicHtml, /Public body/);
      assert.match(defaultHtml, /Default body/);
      assert.match(homeHtml, /href="\/private"/);
      assert.match(homeHtml, /href="\/public"/);
      assert.doesNotMatch(homeHtml, /href="\/default"/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('22: fails when a generated archive Page collides with a configured Page path', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-archive-config-collision-'));
    const originalCwd = process.cwd();
    const archivePage = makeArchivePage({
      path: '/blog',
      file: 'docs/blog.rocket.js',
      title: 'Blog',
    });
    const collisionPage = makePage({
      path: '/blog/2',
      file: 'docs/blog-two.rocket.md',
      title: 'Blog Two',
    });
    const pages = makePageRegistry(archivePage, collisionPage);
    let loaded = false;

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () =>
          renderStaticPages({
            pages,
            staticPages: new Map([
              [archivePage.module.config.path, archivePage],
              [collisionPage.module.config.path, collisionPage],
            ]),
            pageModuleLoader: {
              async load() {
                loaded = true;
                return {
                  kind: 'javascript',
                  body: () => '<main>should not render</main>',
                };
              },
            },
          }),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Generated archive Page \/blog\/2\//);
          assert.match(error.message, /docs\/blog\.rocket\.js/);
          assert.match(error.message, /configured Page docs\/blog-two\.rocket\.md/);
          assert.match(error.message, /\/blog\/2/);
          assert.equal(loaded, false);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('23: fails when two generated archive Pages use the same output path', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-archive-archive-collision-'));
    const originalCwd = process.cwd();
    const archivePage = makeArchivePage({
      path: '/blog',
      file: 'docs/blog.rocket.js',
      title: 'Blog',
    });
    const duplicateArchivePage = makeArchivePage({
      path: '/blog/',
      file: 'docs/blog-copy.rocket.js',
      title: 'Blog Copy',
    });
    const pages = makePageRegistry(archivePage, duplicateArchivePage);
    let loaded = false;

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () =>
          renderStaticPages({
            pages,
            staticPages: new Map([
              [archivePage.module.config.path, archivePage],
              [duplicateArchivePage.module.config.path, duplicateArchivePage],
            ]),
            pageModuleLoader: {
              async load() {
                loaded = true;
                return {
                  kind: 'javascript',
                  body: () => '<main>should not render</main>',
                };
              },
            },
          }),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Generated archive Page \/blog\/2\//);
          assert.match(error.message, /docs\/blog-copy\.rocket\.js/);
          assert.match(error.message, /generated archive Page \/blog\/2\//);
          assert.match(error.message, /docs\/blog\.rocket\.js/);
          assert.equal(loaded, false);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('24: fails when a generated archive Page collides with a Standalone Demo URL', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-archive-demo-collision-'));
    const originalCwd = process.cwd();
    const demoPage = makePage({
      path: '/runtime',
      file: 'docs/runtime.rocket.md',
      title: 'Runtime',
      demoNames: ['2'],
    });
    const archivePage = makeArchivePage({
      path: '/runtime/_demo',
      file: 'docs/archive.rocket.js',
      title: 'Archive',
    });
    const pages = makePageRegistry(demoPage, archivePage);
    let loaded = false;

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () =>
          renderStaticPages({
            pages,
            staticPages: new Map([
              [demoPage.module.config.path, demoPage],
              [archivePage.module.config.path, archivePage],
            ]),
            pageModuleLoader: {
              async load() {
                loaded = true;
                return {
                  kind: 'javascript',
                  body: () => '<main>should not render</main>',
                };
              },
            },
          }),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Generated archive Page \/runtime\/_demo\/2\//);
          assert.match(error.message, /docs\/archive\.rocket\.js/);
          assert.match(error.message, /Standalone Demo URL \/runtime\/_demo\/2\//);
          assert.match(error.message, /docs\/runtime\.rocket\.md/);
          assert.equal(loaded, false);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('25: includes generated archive Pages in Site Discoverability outputs', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-archive-discoverability-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs/posts'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/blog.rocket.js'),
      `
export const config = { path: '/blog', metadata: { title: 'Blog' }, menu: false };

export const pagination = pageData => ({
  pageSize: 2,
  collection: pageData.pages.query({
    tags: 'post',
    pathPrefix: '/posts/',
    sortBy: 'date',
    sortDirection: 'desc',
  }),
});

export default function blogArchive(_request, { pageData }) {
  return '<main data-registry="' + Array.from(pageData.pageRegistry.keys()).join('|') + '">Blog page ' + pageData.pagination.currentPage + '</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/private.rocket.js'),
      `
export const config = {
  path: '/private',
  metadata: { title: 'Private' },
  discoverability: { sitemap: false, robots: 'disallow' },
  menu: false,
};

export const pagination = pageData => ({
  pageSize: 2,
  collection: pageData.pages.query({
    tags: 'post',
    pathPrefix: '/posts/',
    sortBy: 'date',
    sortDirection: 'desc',
  }),
});

export default function privateArchive(_request, { pageData }) {
  return '<main data-registry="' + Array.from(pageData.pageRegistry.keys()).join('|') + '">Private page ' + pageData.pagination.currentPage + '</main>';
}
      `,
    );
    for (const post of [
      { slug: 'oldest', title: 'Oldest Post', date: '2026-05-05' },
      { slug: 'middle', title: 'Middle Post', date: '2026-05-15' },
      { slug: 'newest', title: 'Newest Post', date: '2026-05-25' },
    ]) {
      writeFileSync(
        path.join(projectRoot, `docs/posts/${post.slug}.rocket.js`),
        `
export const config = {
  path: '/posts/${post.slug}',
  metadata: { title: '${post.title}', date: '${post.date}', tags: ['post'] },
  discoverability: { sitemap: false },
  menu: false,
};

export default function postPage() {
  return '<main>${post.title}</main>';
}
        `,
      );
    }
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true, robots: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
      assert.deepEqual(readSitemapLocations(sitemap), [
        'https://docs.rocket.test/',
        'https://docs.rocket.test/blog/',
        'https://docs.rocket.test/blog/2/',
      ]);

      assert.equal(
        readFileSync('dist/robots.txt', 'utf8'),
        [
          'User-agent: *',
          'Disallow: /private/',
          'Disallow: /private/2/',
          '',
          'Sitemap: https://docs.rocket.test/sitemap.xml',
          '',
        ].join('\n'),
      );

      assert.equal(existsSync('dist/private/index.html'), true);
      assert.equal(existsSync('dist/private/2/index.html'), true);
      assert.doesNotMatch(
        readDataAttribute(readFileSync('dist/blog/index.html', 'utf8'), 'registry'),
        /\/blog\/2\//,
      );
      assert.doesNotMatch(
        readDataAttribute(readFileSync('dist/private/2/index.html', 'utf8'), 'registry'),
        /\/private\/2\//,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('26: fails when a Redirect source collides with a configured Page path', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-redirect-page-collision-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/status.rocket.js'),
      `
export const config = { path: '/status', metadata: { title: 'Status' } };

export default function statusPage() {
  return '<main>Status</main>';
}
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        urlLifecycle: {
          redirects: [{ source: '/status', target: '/current-status' }],
        },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => build.build(),
        /Redirect source \/status collides with configured Page docs\/status\.rocket\.js/s,
      );
      assert.equal(existsSync('tmp-dist-rocket'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('27: fails when a Redirect source collides with a Standalone Demo URL', async () => {
    const staticPage = makePage({
      path: '/runtime',
      file: 'docs/runtime.rocket.md',
      demoNames: ['inlineButton'],
    });
    const pages = makePageRegistry(staticPage);
    let loaded = false;

    await assert.rejects(
      () =>
        renderStaticPages({
          pages,
          staticPages: new Map([[staticPage.module.config.path, staticPage]]),
          urlLifecycle: {
            redirects: [{ source: '/runtime/_demo/inlineButton/', target: '/runtime' }],
          },
          pageModuleLoader: {
            async load() {
              loaded = true;
              return {
                kind: 'markdown',
                contentFn: () => ['should not render'],
              };
            },
          },
        }),
      error => {
        if (!(error instanceof Error)) {
          return false;
        }
        assert.match(error.message, /Redirect source \/runtime\/_demo\/inlineButton\//);
        assert.match(error.message, /Standalone Demo URL \/runtime\/_demo\/inlineButton\//);
        assert.match(error.message, /docs\/runtime\.rocket\.md/);
        assert.equal(loaded, false);
        return true;
      },
    );
  });

  it('28: emits adapterless static Redirect fallback files outside PageData and the Sitemap', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-redirect-fallbacks-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs/guides'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage(_request, { pageData }) {
  const registryPaths = Array.from(pageData.pageRegistry.keys()).join('|');
  const treePaths = pageData.pageTree.children.map(page => page.url).join('|');
  return '<main data-registry="' + registryPaths + '" data-tree="' + treePaths + '">Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/guides/current.rocket.js'),
      `
export const config = { path: '/guides/current', metadata: { title: 'Current Guide' } };

export default function currentGuidePage() {
  return '<main>Current Guide</main>';
}
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true },
        urlLifecycle: {
          redirects: [
            { source: '/old-guide', target: '/guides/current', status: 301 },
            {
              source: '/external-docs',
              target: 'https://docs.example.com/?from=rocket&kind=guide',
              status: 302,
            },
          ],
        },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      const oldGuideFallback = readFileSync('dist/old-guide/index.html', 'utf8');
      const externalFallback = readFileSync('dist/external-docs/index.html', 'utf8');
      const homeHtml = readFileSync('dist/index.html', 'utf8');
      const sitemap = readFileSync('dist/sitemap.xml', 'utf8');

      assert.match(
        oldGuideFallback,
        /<meta http-equiv="refresh" content="0; url=\/guides\/current">/,
      );
      assert.match(oldGuideFallback, /<link rel="canonical" href="\/guides\/current"\s*>/);
      assert.match(oldGuideFallback, /window\.location\.replace\("\/guides\/current"\)/);

      assert.match(
        externalFallback,
        /<meta http-equiv="refresh" content="0; url=https:\/\/docs\.example\.com\/\?from=rocket&amp;kind=guide">/,
      );
      assert.match(
        externalFallback,
        /<link rel="canonical" href="https:\/\/docs\.example\.com\/\?from=rocket&amp;kind=guide"\s*>/,
      );

      assert.doesNotMatch(readDataAttribute(homeHtml, 'registry'), /old-guide|external-docs/);
      assert.doesNotMatch(readDataAttribute(homeHtml, 'tree'), /old-guide|external-docs/);
      assert.deepEqual(readSitemapLocations(sitemap), [
        'https://docs.rocket.test/',
        'https://docs.rocket.test/guides/current',
      ]);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('29: emits Netlify native Redirect output alongside generated adapter routes', async () => {
    const originalCwd = process.cwd();
    const tempRoot = path.join(originalCwd, 'temp');
    mkdirSync(tempRoot, { recursive: true });
    const projectRoot = mkdtempSync(path.join(tempRoot, 'rocket-netlify-redirects-'));
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    mkdirSync(path.join(projectRoot, 'src/hydration'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'src/hydration/hydrationLoader.js'),
      'export class HydrationLoader {}\n',
    );
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(
      path.join(projectRoot, 'docs/runtime.rocket.js'),
      `
export const config = {
  path: '/runtime/:slug',
  render: 'server',
  metadata: { title: 'Runtime' },
  menu: false,
};

export default function runtimePage(_request, { params }) {
  return '<main>Runtime ' + params.slug + '</main>';
}
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        urlLifecycle: {
          redirects: [
            { source: '/old-runtime', target: '/runtime/current', status: 301 },
            {
              source: '/external-docs',
              target: 'https://docs.example.com/?from=rocket&kind=guide',
              status: 302,
            },
            { source: '/latest-runtime', target: '/runtime/latest' },
          ],
        },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
        adapter: netlify(),
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(
        readFileSync('dist/_redirects', 'utf8'),
        [
          '/old-runtime /runtime/current 301',
          '/external-docs https://docs.example.com/?from=rocket&kind=guide 302',
          '/latest-runtime /runtime/latest 308',
          '',
        ].join('\n'),
      );
      assert.equal(existsSync('dist/old-runtime/index.html'), false);
      assert.equal(existsSync('dist/external-docs/index.html'), false);
      assert.equal(existsSync('dist/index.html'), true);
      assert.equal(existsSync('.netlify/v1/functions/rocket-ssr.mjs'), true);
      assert.match(
        readFileSync('.netlify/v1/functions/rocket-ssr.mjs', 'utf8'),
        /\/runtime\/:slug/,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('30: copies Public Assets during build without adding them to the Sitemap', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-public-assets-build-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    mkdirSync(path.join(projectRoot, 'public/images'), { recursive: true });
    mkdirSync(path.join(projectRoot, 'public/.well-known'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(path.join(projectRoot, 'public/favicon.svg'), '<svg>favicon</svg>');
    writeFileSync(path.join(projectRoot, 'public/images/logo.txt'), 'logo');
    writeFileSync(path.join(projectRoot, 'public/.well-known/security.txt'), 'security');
    writeFileSync(path.join(projectRoot, 'public/.DS_Store'), 'ignored');
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteDiscoverability: { sitemap: true },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(readFileSync('dist/favicon.svg', 'utf8'), '<svg>favicon</svg>');
      assert.equal(readFileSync('dist/images/logo.txt', 'utf8'), 'logo');
      assert.equal(readFileSync('dist/.well-known/security.txt', 'utf8'), 'security');
      assert.equal(existsSync('dist/.DS_Store'), false);
      assert.deepEqual(readSitemapLocations(readFileSync('dist/sitemap.xml', 'utf8')), [
        'https://docs.rocket.test/',
      ]);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('31: fails when a Public Asset collides with a configured Page path', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-public-assets-page-collision-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    mkdirSync(path.join(projectRoot, 'public/status'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/status.rocket.js'),
      `
export const config = { path: '/status', metadata: { title: 'Status' } };

export default function statusPage() {
  return '<main>Status</main>';
}
      `,
    );
    writeFileSync(path.join(projectRoot, 'public/status/index.html'), '<main>Asset</main>');
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => build.build(),
        /Public Asset public\/status\/index\.html collides with configured Page docs\/status\.rocket\.js at \/status/,
      );
      assert.equal(existsSync('dist'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('32: fails when a Public Asset collides with Netlify Redirect output', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-public-assets-netlify-collision-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    mkdirSync(path.join(projectRoot, 'public'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    writeFileSync(path.join(projectRoot, 'public/_redirects'), '/legacy /current 308\n');
    /** @type {any} */
    const build = new RocketBuild();
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        urlLifecycle: {
          redirects: [{ source: '/legacy', target: '/current' }],
        },
        adapter: {
          name: 'netlify',
          build() {},
        },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => build.build(),
        /Public Asset public\/_redirects collides with Netlify Redirect output at \/_redirects/,
      );
      assert.equal(existsSync('dist'), false);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('33: rejects clearing the project root when no static entries exist', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-public-assets-output-root-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(path.join(projectRoot, 'docs/keep.txt'), 'keep');
    /** @type {any} */
    const build = new RocketBuild();
    build.outputDir = '.';
    build.cli = {
      config: {
        includeGlobs: [],
        excludeRegex: [],
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => build.build(),
        /Invalid build output directory .*Rocket can only clear an existing output directory inside the project root/,
      );
      assert.equal(readFileSync('docs/keep.txt', 'utf8'), 'keep');
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('34: generates static Default Social Preview Images and emits metadata', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-social-preview-build-'));
    const originalCwd = process.cwd();
    const homePage = makePage({
      path: '/',
      file: 'docs/home.rocket.md',
      metadata: { title: 'Home', description: 'Welcome to Rocket Docs.' },
    });
    const runtimePage = makePage({
      path: '/guides/runtime',
      file: 'docs/runtime.rocket.md',
      metadata: { title: 'Runtime Guide', description: 'Learn the runtime.' },
    });
    const explicitPage = makePage({
      path: '/guides/explicit',
      file: 'docs/explicit.rocket.md',
      metadata: { title: 'Explicit Guide', description: 'Uses an explicit image.' },
      config: { siteHeadMetadata: { socialPreview: { image: '/social/custom.png' } } },
    });
    const serverPage = makePage({
      path: '/live',
      file: 'docs/live.rocket.js',
      metadata: { title: 'Live Guide', description: 'Rendered by an adapter.' },
      renderMode: 'server',
    });
    const pages = new Map([
      [homePage.module.config.path, homePage],
      [runtimePage.module.config.path, runtimePage],
      [explicitPage.module.config.path, explicitPage],
      [serverPage.module.config.path, serverPage],
    ]);
    const staticPages = new Map([
      [homePage.module.config.path, homePage],
      [runtimePage.module.config.path, runtimePage],
      [explicitPage.module.config.path, explicitPage],
    ]);
    /** @type {{ pathname: string; html: string; width: number; height: number }[]} */
    const captures = [];

    process.chdir(projectRoot);
    try {
      const { defaultSocialPreviewImages } = await renderStaticPages({
        pages,
        staticPages,
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: { delivery: 'static' },
        },
        async captureSocialPreviewImage(options) {
          captures.push(options);
          return Buffer.from(`png:${options.pathname}`);
        },
        pageModuleLoader: {
          async load() {
            return {
              kind: 'markdown',
              /**
               * @param {any} data
               * @param {any} defaultLayout
               */
              contentFn(data, defaultLayout) {
                data.content = html`<main>${data.metadata.title}</main>`;
                return render(defaultLayout(data));
              },
            };
          },
        },
      });

      assert.deepEqual(
        captures.map(capture => capture.pathname),
        ['/', '/guides/runtime', '/live'],
      );
      const liveSocialPreviewImage = defaultSocialPreviewImages.get('/live');
      assert.ok(liveSocialPreviewImage);
      assert.match(
        liveSocialPreviewImage,
        /^https:\/\/docs\.rocket\.test\/_rocket\/social-preview\/[a-f0-9]{64}\.png$/,
      );
      assert.deepEqual(
        captures.map(capture => [capture.width, capture.height]),
        [
          [1200, 630],
          [1200, 630],
          [1200, 630],
        ],
      );
      assert.match(captures[1].html, /Rocket Docs/);
      assert.match(captures[1].html, /<h1>Runtime Guide<\/h1>/);
      assert.doesNotMatch(captures[1].html, /<h1>Runtime Guide \| Rocket Docs<\/h1>/);
      assert.match(captures[1].html, /Learn the runtime\./);
      assert.match(captures[1].html, /https:\/\/docs\.rocket\.test\/guides\/runtime/);
      assert.match(captures[2].html, /<h1>Live Guide<\/h1>/);

      const generatedImages = globSync('_rocket/social-preview/*.png', { cwd: 'tmp-dist-rocket' });
      assert.equal(generatedImages.length, 3);
      assert.deepEqual(
        generatedImages
          .map(file => readFileSync(path.join('tmp-dist-rocket', file), 'utf8'))
          .sort(),
        ['png:/', 'png:/guides/runtime', 'png:/live'],
      );
      assert.equal(
        existsSync('tmp-dist-rocket/_rocket/social-preview/guides/explicit/image.png'),
        false,
      );
      assert.equal(existsSync('tmp-dist-rocket/live/index.html'), false);

      const homeHtml = readFileSync('tmp-dist-rocket/index.html', 'utf8');
      const runtimeHtml = readFileSync('tmp-dist-rocket/guides/runtime/index.html', 'utf8');
      const explicitHtml = readFileSync('tmp-dist-rocket/guides/explicit/index.html', 'utf8');
      const homeSocialPreviewImage = defaultSocialPreviewImages.get('/');
      const runtimeSocialPreviewImage = defaultSocialPreviewImages.get('/guides/runtime');
      assert.ok(homeSocialPreviewImage);
      assert.ok(runtimeSocialPreviewImage);

      assertHeadTag(homeHtml, 'meta', 'property', 'og:image', 'content', homeSocialPreviewImage);
      assertHeadTag(
        runtimeHtml,
        'meta',
        'name',
        'twitter:image',
        'content',
        runtimeSocialPreviewImage,
      );
      assertHeadTag(
        explicitHtml,
        'meta',
        'property',
        'og:image',
        'content',
        'https://docs.rocket.test/social/custom.png',
      );
      assert.doesNotMatch(explicitHtml, /_rocket\/social-preview\/[a-f0-9]{64}\.png/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('35: copies generated Default Social Preview Images to final build output', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-social-preview-dist-'));
    const originalCwd = process.cwd();
    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/index.rocket.js'),
      `
export const config = { path: '/', metadata: { title: 'Home' }, menu: false };

export default function homePage() {
  return '<main>Home</main>';
}
      `,
    );
    /** @type {any} */
    const build = new RocketBuild();
    build.socialPreviewCapture = async () => Buffer.from('default-social-preview');
    build.cli = {
      config: {
        includeGlobs: ['docs/**/*.rocket.js'],
        excludeRegex: [],
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: { delivery: 'static' },
        },
        /**
         * @param {any} config
         */
        adjustDevServerConfig(config) {
          return config;
        },
      },
    };

    process.chdir(projectRoot);
    try {
      await build.build();

      assert.equal(
        readFileSync(globSync('dist/_rocket/social-preview/*.png')[0], 'utf8'),
        'default-social-preview',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('36: fails static delivery when Social Preview Capture fails', async () => {
    const brokenPage = makePage({ path: '/broken', file: 'docs/broken.rocket.md' });
    const pages = new Map([[brokenPage.module.config.path, brokenPage]]);
    const captureError = new Error('browser capture crashed');

    await assert.rejects(
      () =>
        renderStaticPages({
          pages,
          staticPages: pages,
          siteOrigin: 'https://docs.rocket.test',
          siteHeadMetadata: {
            siteName: 'Rocket Docs',
            defaultDescription: 'Rocket project documentation.',
            language: 'en',
            socialPreview: { delivery: 'static' },
          },
          async captureSocialPreviewImage() {
            throw captureError;
          },
          pageModuleLoader: {
            async load() {
              return {
                kind: 'markdown',
                contentFn: () => ['should not render'],
              };
            },
          },
        }),
      error => {
        if (!(error instanceof Error)) {
          return false;
        }
        assert.match(error.message, /Failed to capture Default Social Preview Image for \/broken/);
        assert.match(error.message, /browser capture crashed/);
        assert.equal(error.cause, captureError);
        return true;
      },
    );
  });

  it('37: generates Default Social Preview Images for archive variants and excludes Standalone Demo URLs', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-archive-social-preview-'));
    const originalCwd = process.cwd();
    const cacheDirectory = path.join(projectRoot, '.rocket/social-preview-images');
    const rootPage = makePage({
      path: '/',
      file: 'docs/index.rocket.md',
      metadata: { title: 'Home', description: 'Welcome home.' },
      config: { siteHeadMetadata: { socialPreview: { image: '/social/home.png' } } },
    });
    const archivePage = makePage({
      path: '/blog',
      file: 'docs/blog.rocket.js',
      metadata: { title: 'Blog', description: 'Posts and updates.' },
    });
    archivePage.module.pagination = pageData => ({
      pageSize: 1,
      collection: pageData.pages.query({
        tags: 'post',
        sortBy: 'date',
        sortDirection: 'desc',
      }),
    });
    const newestPost = makePage({
      path: '/posts/newest',
      file: 'docs/posts/newest.rocket.md',
      metadata: {
        title: 'Newest Post',
        description: 'Fresh news.',
        date: '2026-05-25',
        tags: ['post'],
      },
    });
    const oldestPost = makePage({
      path: '/posts/oldest',
      file: 'docs/posts/oldest.rocket.md',
      metadata: {
        title: 'Oldest Post',
        description: 'Older news.',
        date: '2026-05-20',
        tags: ['post'],
      },
    });
    const demoPage = makePage({
      path: '/component',
      file: 'docs/component.rocket.md',
      metadata: { title: 'Component', description: 'Interactive component demos.' },
      demoNames: ['interactiveButton'],
    });
    const pages = new Map([
      [rootPage.module.config.path, rootPage],
      [archivePage.module.config.path, archivePage],
      [newestPost.module.config.path, newestPost],
      [oldestPost.module.config.path, oldestPost],
      [demoPage.module.config.path, demoPage],
    ]);
    /** @type {import('@rocket/js/types.js').SiteHeadMetadataConfig} */
    const siteHeadMetadata = {
      siteName: 'Rocket Docs',
      defaultDescription: 'Rocket project documentation.',
      language: 'en',
      socialPreview: { delivery: 'static' },
    };
    /** @type {{ pathname: string; html: string; width: number; height: number }[]} */
    const captures = [];
    /** @type {import('../page-runtime.js').PageModuleLoader} */
    const pageModuleLoader = {
      async load({ page, variant }) {
        if (page.file.endsWith('.rocket.js')) {
          return {
            kind: 'javascript',
            /**
             * @param {Request} _request
             * @param {{ pageData: import('../PageData.js').PageData }} context
             */
            async body(_request, { pageData }) {
              pageData.content = html`<main data-current=${pageData.pagination?.currentPage}>
                Blog page ${pageData.pagination?.currentPage}
              </main>`;
              const result = document(pageData, pageData.content, { menu: false });
              return new Response(await collectResult(render(result)), {
                headers: { 'content-type': 'text/html; charset=utf-8' },
              });
            },
          };
        }
        return {
          kind: 'markdown',
          /**
           * @param {import('../PageData.js').PageData} data
           * @param {(data: import('../PageData.js').PageData) => unknown} selectedLayout
           */
          contentFn(data, selectedLayout) {
            if (typeof variant === 'object' && variant.kind === 'standalone-demo') {
              data.content = html`<main>Standalone ${variant.demoName}</main>`;
            } else {
              data.content = html`<main>${data.metadata.title}</main>`;
            }
            return render(selectedLayout(data));
          },
        };
      },
    };

    process.chdir(projectRoot);
    try {
      const firstRun = await renderStaticPages({
        pages,
        staticPages: pages,
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata,
        socialPreviewCacheDirectory: cacheDirectory,
        async captureSocialPreviewImage(options) {
          captures.push(options);
          return Buffer.from(`png:${options.pathname}`);
        },
        pageModuleLoader,
      });

      assert.ok(firstRun.defaultSocialPreviewImages.get('/blog/2/'));
      assert.equal(
        firstRun.defaultSocialPreviewImages.has('/component/_demo/interactiveButton/'),
        false,
      );
      assert.ok(captures.find(capture => capture.pathname === '/blog/2/'));
      assert.equal(
        captures.some(capture => capture.pathname === '/component/_demo/interactiveButton/'),
        false,
      );
      assert.match(
        captures.find(capture => capture.pathname === '/blog/2/')?.html || '',
        /https:\/\/docs\.rocket\.test\/blog\/2\//,
      );
      assert.deepEqual(
        globSync('_rocket/social-preview/*.png', { cwd: 'tmp-dist-rocket' })
          .map(file => readFileSync(path.join('tmp-dist-rocket', file), 'utf8'))
          .filter(content => content.startsWith('png:/blog'))
          .sort(),
        ['png:/blog', 'png:/blog/2/'],
      );

      const archiveVariantImage = firstRun.defaultSocialPreviewImages.get('/blog/2/');
      assert.ok(archiveVariantImage);
      const archiveVariantHtml = readFileSync('tmp-dist-rocket/blog/2/index.html', 'utf8');
      assertHeadTag(
        archiveVariantHtml,
        'link',
        'rel',
        'canonical',
        'href',
        'https://docs.rocket.test/blog/2/',
      );
      assertHeadTag(
        archiveVariantHtml,
        'meta',
        'property',
        'og:url',
        'content',
        'https://docs.rocket.test/blog/2/',
      );
      assertHeadTag(
        archiveVariantHtml,
        'meta',
        'property',
        'og:image',
        'content',
        archiveVariantImage,
      );
      assertHeadTag(
        archiveVariantHtml,
        'meta',
        'name',
        'twitter:image',
        'content',
        archiveVariantImage,
      );

      const standaloneDemoHtml = readFileSync(
        'tmp-dist-rocket/component/_demo/interactiveButton/index.html',
        'utf8',
      );
      assertHeadTag(standaloneDemoHtml, 'meta', 'name', 'twitter:card', 'content', 'summary');
      assert.doesNotMatch(
        standaloneDemoHtml,
        /<meta[^>]*(property="og:image"|name="twitter:image")/,
      );

      rmSync('tmp-dist-rocket', { recursive: true, force: true });
      const secondRun = await renderStaticPages({
        pages,
        staticPages: pages,
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata,
        socialPreviewCacheDirectory: cacheDirectory,
        captureSocialPreviewImage() {
          throw new Error('Should reuse cached Social Preview Image');
        },
        pageModuleLoader,
      });

      assert.equal(secondRun.defaultSocialPreviewImages.get('/blog/2/'), archiveVariantImage);
      assert.equal(
        readFileSync(`tmp-dist-rocket${new URL(archiveVariantImage).pathname}`, 'utf8'),
        'png:/blog/2/',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('38: does not emit Social Preview Template Preview routes in static output', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-social-preview-dev-route-'));
    const originalCwd = process.cwd();
    const page = makePage({
      path: '/guides/runtime',
      file: 'docs/runtime.rocket.md',
      metadata: { title: 'Runtime Guide', description: 'Learn the runtime.' },
    });
    const pages = makePageRegistry(page);

    process.chdir(projectRoot);
    try {
      await renderStaticPages({
        pages,
        staticPages: pages,
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: { delivery: 'static' },
        },
        async captureSocialPreviewImage() {
          return Buffer.from('default-social-preview');
        },
        pageModuleLoader: {
          async load() {
            return {
              kind: 'markdown',
              /**
               * @param {import('../PageData.js').PageData} data
               * @param {(data: import('../PageData.js').PageData) => unknown} selectedLayout
               */
              contentFn(data, selectedLayout) {
                data.content = html`<main>${data.metadata.title}</main>`;
                return render(selectedLayout(data));
              },
            };
          },
        },
      });

      assert.equal(existsSync('tmp-dist-rocket/_rocket/social-preview-template-preview'), false);
      assert.deepEqual(
        globSync('_rocket/social-preview-template-preview/**', { cwd: 'tmp-dist-rocket' }),
        [],
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('39: publishes only manifest-referenced client icon SVG assets during static rendering', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-static-icons-'));
    const originalCwd = process.cwd();
    const iconDir = path.join(projectRoot, 'src/icons');
    const renderedSvg = '<svg viewBox="0 0 8 8"><path fill="currentColor" d="M0 0h8v8H0z"/></svg>';
    mkdirSync(iconDir, { recursive: true });
    writeFileSync(path.join(iconDir, 'box.svg'), renderedSvg);
    writeFileSync(path.join(iconDir, 'unused.svg'), '<svg><circle cx="4" cy="4" r="4"/></svg>');

    const page = makePage({ path: '/icons', file: 'docs/icons.rocket.js', title: 'Icons' });
    const pages = makePageRegistry(page);
    const staticPages = new Map([[page.module.config.path, page]]);

    process.chdir(projectRoot);
    try {
      await renderStaticPages({
        pages,
        staticPages,
        pageModuleLoader: {
          async load() {
            return {
              kind: 'javascript',
              body() {
                return '<main><rocket-icon name="box" icon-loading="client"></rocket-icon></main>';
              },
            };
          },
        },
        iconLibraries: {
          local: iconsFromPath(path.join(iconDir, '*.svg')),
        },
        defaultIconLibrary: 'local',
      });

      const html = readFileSync('tmp-dist-rocket/icons/index.html', 'utf8');
      const manifest = readIconManifest(html);
      const assetPath =
        'tmp-dist-rocket' + new URL(manifest.icons['local:box'], 'https://x.test').pathname;

      assert.match(
        manifest.icons['local:box'],
        /^\/_rocket\/icons\/local\/box\.[a-f0-9]{12}\.svg$/,
      );
      assert.equal(readFileSync(assetPath, 'utf8'), renderedSvg);
      assert.deepEqual(globSync('_rocket/icons/**/*.svg', { cwd: 'tmp-dist-rocket' }), [
        path.relative('tmp-dist-rocket', assetPath),
      ]);
      assert.match(
        readFileSync('tmp-dist-rocket/_rocket/rocket-icon.js', 'utf8'),
        /customElements\.define\('rocket-icon'/,
      );
      assert.match(
        readFileSync('tmp-dist-rocket/_rocket/RocketIcon.js', 'utf8'),
        /class RocketIcon/,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});

/**
 * @param {{ path?: string; file?: string; title?: string; metadata?: import('@rocket/js/types.js').PageMetadata; config?: Omit<import('@rocket/js/types.js').PageConfig, 'path' | 'metadata' | 'render'>; renderMode?: 'static' | 'server'; demoNames?: string[] }} [options]
 * @returns {import('@rocket/js/types.js').Page}
 */
function makePage({
  path = '/example',
  file = 'docs/example.rocket.md',
  title = 'Example',
  metadata,
  config = {},
  renderMode = 'static',
  demoNames = [],
} = {}) {
  const pageMetadata = metadata || { title, linkText: title };
  return {
    file,
    module: {
      config: {
        path,
        metadata: { title: pageMetadata.title },
        ...(renderMode ? { render: renderMode } : {}),
        ...config,
      },
    },
    metadata: pageMetadata,
    demoNames,
  };
}

/**
 * @param {{ path?: string; file?: string; title?: string }} [options]
 * @returns {import('@rocket/js/types.js').Page}
 */
function makeArchivePage(options = {}) {
  const page = makePage({
    path: '/archive',
    file: 'docs/archive.rocket.js',
    title: 'Archive',
    ...options,
  });
  page.module.pagination = pageData => ({
    pageSize: 1,
    collection: pageData.pages.query(),
  });
  return page;
}

/**
 * @param {...ReturnType<typeof makePage>} pages
 */
function makePageRegistry(...pages) {
  const root = makePage({
    path: '/',
    file: 'docs/root.rocket.md',
    title: 'Home',
  });
  const registry = new Map([[root.module.config.path, root]]);
  for (const page of pages) {
    registry.set(page.module.config.path, page);
  }
  return registry;
}

/**
 * @param {string} html
 * @param {string} name
 */
function readDataAttribute(html, name) {
  const match = new RegExp(`data-${name}="([^"]*)"`).exec(html);
  assert.ok(match, `Expected data-${name} attribute`);
  return match[1];
}

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
 * @param {string} sitemap
 */
function readSitemapLocations(sitemap) {
  return Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => match[1]);
}

/**
 * @param {string} body
 * @param {'meta' | 'link'} tag
 * @param {string} firstAttribute
 * @param {string} firstValue
 * @param {string} secondAttribute
 * @param {string} secondValue
 */
function assertHeadTag(body, tag, firstAttribute, firstValue, secondAttribute, secondValue) {
  assert.match(
    body,
    new RegExp(
      `<${tag}[^>]*${firstAttribute}="${escapeRegExp(firstValue)}"[^>]*${secondAttribute}="${escapeRegExp(
        secondValue,
      )}"[^>]*>`,
    ),
  );
}

/**
 * @param {string} value
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
