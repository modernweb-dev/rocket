import assert from 'node:assert/strict';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { describe, it } from 'node:test';
import { html } from 'lit';
import { PageData } from './PageData.js';
import { document } from './layouts/layout-helper.js';
import { layout, singleDemoLayout } from './layouts/layout.js';
import { PageRuntime, PageRuntimeError } from './page-runtime.js';

/** @typedef {{ params: Record<string, string | undefined>; pageData: PageData; adapterContext?: unknown }} TestPageContext */
/** @typedef {(data: PageData) => unknown} TestLayout */

describe('Test PageRuntime', () => {
  it('01: passes params, PageData, Page Metadata, and Adapter Context to JavaScript Pages', async () => {
    const metadata = {
      title: 'Travel Guide',
      linkText: 'Travel',
      description: 'Plan trips by city.',
      date: '2026-05-24',
      updated: '2026-05-25',
      tags: ['travel', 'guide'],
      authors: ['Rocket Team'],
      custom: { section: 'guides' },
    };
    const page = makePage({
      path: '/travel-guide/:country/:city',
      file: 'docs/pages/travel.rocket.js',
      metadata,
    });
    const pages = makePageRegistry(page);
    const adapterContext = { platform: 'development', requestId: 'request-1' };
    /** @type {unknown} */
    let loadCall;
    /** @type {Request | undefined} */
    let receivedRequest;
    /** @type {any} */
    let receivedContext;

    const runtime = new PageRuntime({
      pages,
      pageModuleLoader: {
        async load(options) {
          loadCall = options;
          return {
            kind: 'javascript',
            /**
             * @param {Request} request
             * @param {TestPageContext} context
             */
            async body(request, context) {
              receivedRequest = request;
              receivedContext = context;
              return new Response('Rendered JavaScript Page', {
                status: 201,
                headers: { 'x-page': 'javascript' },
              });
            },
          };
        },
      },
    });

    const request = new Request('https://rocket.test/travel-guide/france/paris?preview=true');
    const response = await runtime.render(request, { adapterContext });

    assert.equal(response.status, 201);
    assert.equal(response.headers.get('x-page'), 'javascript');
    assert.equal(await response.text(), 'Rendered JavaScript Page');
    assert.deepEqual(loadCall, {
      page,
      routePath: '/travel-guide/:country/:city',
      request,
      variant: 'default',
    });
    assert.equal(receivedRequest, request);
    assert.deepEqual(receivedContext.params, { country: 'france', city: 'paris' });
    assert.equal(receivedContext.adapterContext, adapterContext);
    assert.ok(receivedContext.pageData instanceof PageData);
    assert.deepEqual(receivedContext.pageData.metadata, metadata);
    assert.deepEqual(
      receivedContext.pageData.pageRegistry.get('/travel-guide/:country/:city')?.metadata,
      metadata,
    );
    assert.equal(receivedContext.pageData.title, 'Travel Guide');
    assert.equal(receivedContext.pageData.title, receivedContext.pageData.metadata.title);
    assert.equal(receivedContext.pageData.url, '/travel-guide/france/paris');
  });

  it('02: normalizes JavaScript Page Result values to Responses', async () => {
    await assertNormalizes(new Response('Accepted', { status: 202 }), {
      body: 'Accepted',
      status: 202,
      contentType: 'text/plain;charset=UTF-8',
    });
    await assertNormalizes('<h1>Hello</h1>', {
      body: '<h1>Hello</h1>',
      status: 200,
      contentType: 'text/html; charset=utf-8',
    });
    await assertNormalizes(
      { ok: true },
      {
        body: '{"ok":true}',
        status: 200,
        contentType: 'application/json',
      },
    );
    await assertNormalizes(null, {
      body: '',
      status: 200,
      contentType: null,
    });
    await assertNormalizes(undefined, {
      body: '',
      status: 200,
      contentType: null,
    });
  });

  it('03: renders Markdown Pages with PageData and the default layout', async () => {
    const metadata = {
      title: 'Guide',
      description: 'Markdown layout metadata.',
      date: '2026-05-24',
      updated: '2026-05-25',
      tags: ['markdown', 'layout'],
      authors: ['Rocket Team'],
      custom: { status: 'stable' },
    };
    const page = makePage({
      path: '/guides/:slug',
      file: 'docs/pages/guide.rocket.md',
      metadata,
    });
    const pages = makePageRegistry(page);
    /** @type {any} */
    let loadCall;
    /** @type {PageData | undefined} */
    let receivedPageData;
    /** @type {unknown} */
    let receivedLayout;

    const runtime = new PageRuntime({
      pages,
      pageModuleLoader: {
        async load(options) {
          loadCall = options;
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} defaultLayout
             */
            contentFn(data, defaultLayout) {
              receivedPageData = data;
              receivedLayout = defaultLayout;
              data.content = html`<main>
                Markdown body for ${data.metadata.title} ${data.metadata.description}
                ${data.metadata.date} ${data.metadata.updated} ${data.metadata.tags?.join(',')}
                ${data.metadata.authors?.join(',')} ${data.metadata.custom?.status}
              </main>`;
              return render(defaultLayout(data));
            },
          };
        },
      },
    });

    const request = new Request('https://rocket.test/guides/runtime?preview=true');
    const response = await runtime.render(request);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.match(body, /<title>[\s\S]*Guide[\s\S]*<\/title>/);
    assert.match(body, /Markdown body for/);
    assert.deepEqual(loadCall, {
      page,
      routePath: '/guides/:slug',
      request,
      variant: 'default',
    });
    assert.ok(receivedPageData instanceof PageData);
    assert.deepEqual(receivedPageData.metadata, metadata);
    assert.equal(receivedPageData.title, 'Guide');
    assert.equal(receivedPageData.title, receivedPageData.metadata.title);
    assert.equal(receivedPageData.url, '/guides/runtime');
    assert.equal(receivedLayout, layout);
    assert.match(body, /Markdown layout metadata\./);
    assert.match(body, /2026-05-24/);
    assert.match(body, /2026-05-25/);
    assert.match(body, /markdown,layout/);
    assert.match(body, /Rocket Team/);
    assert.match(body, /stable/);
  });

  it('04: loads the matching Page Variant and Standalone Demo layout', async () => {
    const page = makePage({
      path: '/button',
      file: 'docs/pages/components/button.rocket.md',
      title: 'Button',
      demoNames: ['buttonDemo'],
    });
    const pages = makePageRegistry(page);
    /** @type {any} */
    let loadCall;
    /** @type {unknown} */
    let receivedLayout;

    const runtime = new PageRuntime({
      pages,
      pageModuleLoader: {
        async load(options) {
          loadCall = options;
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} selectedLayout
             */
            contentFn(data, selectedLayout) {
              receivedLayout = selectedLayout;
              data.content = html`<rocket-js-demo
                demo-name="buttonDemo"
                single-demo
              ></rocket-js-demo>`;
              return render(selectedLayout(data));
            },
          };
        },
      },
    });

    const request = new Request('https://rocket.test/button/_demo/buttonDemo/');
    const response = await runtime.render(request);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /rocket-js-demo/);
    assert.doesNotMatch(body, /rocket-preview/);
    assert.deepEqual(loadCall, {
      page,
      routePath: '/button',
      request,
      variant: { kind: 'standalone-demo', demoName: 'buttonDemo' },
    });
    assert.equal(receivedLayout, singleDemoLayout);
  });

  it('05: returns a Page Runtime 404 Response for unknown Standalone Demo names', async () => {
    const page = makePage({
      path: '/button',
      file: 'docs/pages/components/button.rocket.md',
      title: 'Button',
      demoNames: ['buttonDemo'],
    });
    let loaded = false;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          loaded = true;
          return {
            kind: 'markdown',
            contentFn: () => ['should not render'],
          };
        },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/button/_demo/unknown/'));

    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Page not found');
    assert.equal(loaded, false);
  });

  it('06: requires canonical trailing slashes for Standalone Demo URLs', async () => {
    const page = makePage({
      path: '/button',
      file: 'docs/pages/components/button.rocket.md',
      title: 'Button',
      demoNames: ['buttonDemo'],
    });
    let loaded = false;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          loaded = true;
          return {
            kind: 'markdown',
            contentFn: () => ['should not render'],
          };
        },
      },
    });

    const response = await runtime.render(
      new Request('https://rocket.test/button/_demo/buttonDemo'),
    );

    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Page not found');
    assert.equal(loaded, false);
  });

  it('07: does not match JavaScript Pages to Standalone Demo URLs', async () => {
    const page = makePage({
      path: '/button',
      file: 'docs/pages/components/button.rocket.js',
      title: 'Button',
      demoNames: ['buttonDemo'],
    });
    let loaded = false;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          loaded = true;
          return {
            kind: 'javascript',
            body: () => new Response('should not render'),
          };
        },
      },
    });

    const response = await runtime.render(
      new Request('https://rocket.test/button/_demo/buttonDemo/'),
    );

    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Page not found');
    assert.equal(loaded, false);
  });

  it('08: renders query-string Standalone Demo requests as the default Page Variant', async () => {
    const page = makePage({
      path: '/button',
      file: 'docs/pages/components/button.rocket.md',
      title: 'Button',
      demoNames: ['buttonDemo'],
    });
    /** @type {unknown} */
    let loadCall;
    /** @type {unknown} */
    let receivedLayout;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load(options) {
          loadCall = options;
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} selectedLayout
             */
            contentFn(data, selectedLayout) {
              receivedLayout = selectedLayout;
              data.content = html`<main>Default Button page</main>`;
              return render(selectedLayout(data));
            },
          };
        },
      },
    });

    const request = new Request('https://rocket.test/button?standaloneDemo=buttonDemo');
    const response = await runtime.render(request);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /Default Button page/);
    assert.deepEqual(loadCall, {
      page,
      routePath: '/button',
      request,
      variant: 'default',
    });
    assert.equal(receivedLayout, layout);
  });

  it('09: returns a 404 Response for missing Pages', async () => {
    const page = makePage();
    let loaded = false;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          loaded = true;
          return {
            kind: 'javascript',
            body: () => new Response('should not render'),
          };
        },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/missing'));

    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Page not found');
    assert.equal(loaded, false);
  });

  it('10: renders extensionless Page requests with a canonical document trailing slash', async () => {
    const page = makePage({
      path: '/setup/build-with-ai',
      file: 'docs/pages/start/10-build-with-ai.rocket.md',
      metadata: { title: 'Start With AI' },
    });
    /** @type {unknown} */
    let loadCall;
    /** @type {PageData | undefined} */
    let receivedPageData;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load(options) {
          loadCall = options;
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} defaultLayout
             */
            contentFn(data, defaultLayout) {
              receivedPageData = data;
              data.content = html`<main>Start With AI</main>`;
              return render(defaultLayout(data));
            },
          };
        },
      },
    });

    const request = new Request('https://rocket.test/setup/build-with-ai/');
    const response = await runtime.render(request);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /Start With AI/);
    assert.deepEqual(loadCall, {
      page,
      routePath: '/setup/build-with-ai',
      request,
      variant: 'default',
    });
    assert.equal(receivedPageData?.url, '/setup/build-with-ai/');
  });

  it('11: does not route file-style Page requests with trailing slashes', async () => {
    const page = makePage({
      path: '/api/docs-index.json',
      file: 'docs/pages/api/docs-index.rocket.js',
      metadata: { title: 'Docs Index' },
    });
    let loaded = false;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          loaded = true;
          return {
            kind: 'javascript',
            body: () => new Response('should not render'),
          };
        },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/api/docs-index.json/'));

    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Page not found');
    assert.equal(loaded, false);
  });

  it('12: throws typed Page Runtime errors for invalid JavaScript Page modules', async () => {
    const page = makePage({ file: 'docs/pages/invalid.rocket.js' });
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'javascript',
            body: 'not executable',
          };
        },
      },
    });

    await assert.rejects(
      () => runtime.render(new Request('https://rocket.test/example')),
      error => {
        assert.ok(error instanceof PageRuntimeError);
        assert.equal(error.code, 'INVALID_PAGE_MODULE');
        assert.equal(error.page, page);
        assert.equal(error.routePath, '/example');
        assert.match(error.message, /Invalid JavaScript Page module/);
        return true;
      },
    );
  });

  it('13: throws typed Page Runtime errors for JavaScript Page render failures', async () => {
    const page = makePage({ file: 'docs/pages/throwing.rocket.js' });
    const renderError = new Error('render exploded');
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'javascript',
            body() {
              throw renderError;
            },
          };
        },
      },
    });

    await assert.rejects(
      () => runtime.render(new Request('https://rocket.test/example')),
      error => {
        assert.ok(error instanceof PageRuntimeError);
        assert.equal(error.code, 'PAGE_RENDER_FAILED');
        assert.equal(error.page, page);
        assert.equal(error.routePath, '/example');
        assert.equal(error.cause, renderError);
        assert.match(error.message, /Failed to render JavaScript Page/);
        return true;
      },
    );
  });

  it('14: throws typed Page Runtime errors for invalid Markdown Page modules', async () => {
    const page = makePage({ file: 'docs/pages/invalid.rocket.md' });
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            contentFn: '<p>not executable</p>',
          };
        },
      },
    });

    await assert.rejects(
      () => runtime.render(new Request('https://rocket.test/example')),
      error => {
        assert.ok(error instanceof PageRuntimeError);
        assert.equal(error.code, 'INVALID_PAGE_MODULE');
        assert.equal(error.page, page);
        assert.equal(error.routePath, '/example');
        assert.match(error.message, /Invalid Markdown Page module/);
        return true;
      },
    );
  });

  it('15: throws typed Page Runtime errors for Markdown Page render failures', async () => {
    const page = makePage({ file: 'docs/pages/throwing.rocket.md' });
    const renderError = new Error('markdown exploded');
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
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
    });

    await assert.rejects(
      () => runtime.render(new Request('https://rocket.test/example')),
      error => {
        assert.ok(error instanceof PageRuntimeError);
        assert.equal(error.code, 'PAGE_RENDER_FAILED');
        assert.equal(error.page, page);
        assert.equal(error.routePath, '/example');
        assert.equal(error.cause, renderError);
        assert.match(error.message, /Failed to render Markdown Page/);
        return true;
      },
    );
  });

  it('16: creates PageData titles from normalized Page Metadata', async () => {
    const page = {
      file: 'docs/pages/metadata.rocket.js',
      module: { config: { path: '/metadata', metadata: { title: 'Metadata Title' } } },
      metadata: { title: 'Metadata Title' },
      demoNames: [],
    };
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'javascript',
            /**
             * @param {Request} _request
             * @param {TestPageContext} context
             */
            body(_request, context) {
              context.pageData.title = 'Runtime Title';
              assert.equal(context.pageData.metadata.title, 'Runtime Title');
              context.pageData.metadata.title = 'Metadata Runtime Title';
              return new Response(context.pageData.title);
            },
          };
        },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/metadata'));

    assert.equal(await response.text(), 'Metadata Runtime Title');
  });

  it('17: renders a blog index from discovered Pages queried by Page Metadata and date', async () => {
    const blogIndex = makePage({
      path: '/blog',
      file: 'docs/pages/blog.rocket.js',
      metadata: { title: 'Blog' },
    });
    const newerPost = makePage({
      path: '/blog/newer',
      file: 'docs/pages/blog/newer.rocket.md',
      metadata: {
        title: 'Newer Post',
        date: '2026-05-20',
        tags: ['blog', 'rocket'],
        authors: ['Ada Lovelace'],
      },
    });
    const olderPost = makePage({
      path: '/blog/older',
      file: 'docs/pages/blog/older.rocket.md',
      metadata: {
        title: 'Older Post',
        date: '2026-05-10',
        tags: ['blog', 'rocket', 'archive'],
        authors: ['Ada Lovelace'],
      },
    });
    const undatedPost = makePage({
      path: '/blog/undated',
      file: 'docs/pages/blog/undated.rocket.md',
      metadata: {
        title: 'Undated Post',
        tags: ['blog', 'rocket'],
        authors: ['Ada Lovelace'],
      },
    });
    const missingRequestedTag = makePage({
      path: '/blog/no-rocket-tag',
      file: 'docs/pages/blog/no-rocket-tag.rocket.md',
      metadata: {
        title: 'Missing Rocket Tag',
        date: '2026-05-25',
        tags: ['blog'],
        authors: ['Ada Lovelace'],
      },
    });
    const differentAuthor = makePage({
      path: '/blog/different-author',
      file: 'docs/pages/blog/different-author.rocket.md',
      metadata: {
        title: 'Different Author',
        date: '2026-05-24',
        tags: ['blog', 'rocket'],
        authors: ['Grace Hopper'],
      },
    });
    const differentPath = makePage({
      path: '/guides/blog-style',
      file: 'docs/pages/guides/blog-style.rocket.md',
      metadata: {
        title: 'Guide With Blog Tags',
        date: '2026-05-23',
        tags: ['blog', 'rocket'],
        authors: ['Ada Lovelace'],
      },
    });
    const pages = makePageRegistry(
      blogIndex,
      olderPost,
      missingRequestedTag,
      newerPost,
      undatedPost,
      differentAuthor,
      differentPath,
    );
    const runtime = new PageRuntime({
      pages,
      pageModuleLoader: {
        async load() {
          return {
            kind: 'javascript',
            /**
             * @param {Request} _request
             * @param {TestPageContext} context
             */
            body(_request, context) {
              assert.equal(context.pageData.pageRegistry, pages);
              assert.ok(context.pageData.pageRegistry instanceof Map);

              const posts = context.pageData.pages.query({
                tags: ['blog', 'rocket'],
                author: 'Ada Lovelace',
                pathPrefix: '/blog/',
                sortBy: 'date',
                sortDirection: 'desc',
              });
              const ascendingPosts = context.pageData.pages.query({
                tags: ['blog', 'rocket'],
                author: 'Ada Lovelace',
                pathPrefix: '/blog/',
                sortBy: 'date',
                sortDirection: 'asc',
              });

              assert.deepEqual(
                posts.map(post => ({
                  path: post.path,
                  url: post.url,
                  title: post.metadata.title,
                  date: post.metadata.date,
                  file: post.file,
                  page: post.page,
                })),
                [
                  {
                    path: '/blog/newer',
                    url: '/blog/newer',
                    title: 'Newer Post',
                    date: '2026-05-20',
                    file: 'docs/pages/blog/newer.rocket.md',
                    page: newerPost,
                  },
                  {
                    path: '/blog/older',
                    url: '/blog/older',
                    title: 'Older Post',
                    date: '2026-05-10',
                    file: 'docs/pages/blog/older.rocket.md',
                    page: olderPost,
                  },
                  {
                    path: '/blog/undated',
                    url: '/blog/undated',
                    title: 'Undated Post',
                    date: undefined,
                    file: 'docs/pages/blog/undated.rocket.md',
                    page: undatedPost,
                  },
                ],
              );
              assert.deepEqual(
                ascendingPosts.map(post => post.metadata.title),
                ['Older Post', 'Newer Post', 'Undated Post'],
              );

              return new Response(
                `<main>${posts
                  .map(post => `<a href="${post.url}">${post.metadata.title}</a>`)
                  .join('')}</main>`,
              );
            },
          };
        },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/blog'));
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /<a href="\/blog\/newer">Newer Post<\/a>/);
    assert.match(body, /<a href="\/blog\/older">Older Post<\/a>/);
    assert.match(body, /<a href="\/blog\/undated">Undated Post<\/a>/);
    assert.ok(body.indexOf('Newer Post') < body.indexOf('Older Post'));
    assert.ok(body.indexOf('Older Post') < body.indexOf('Undated Post'));
    assert.doesNotMatch(body, /Missing Rocket Tag|Different Author|Guide With Blog Tags/);
  });

  it('18: routes generated archive requests without routing a page-1 child path', async () => {
    const blogIndex = makePage({
      path: '/blog',
      file: 'docs/pages/blog.rocket.js',
      title: 'Blog',
    });
    blogIndex.module.pagination = pageData => ({
      pageSize: 2,
      collection: pageData.pages.query({
        tags: 'post',
        pathPrefix: '/posts/',
        sortBy: 'date',
        sortDirection: 'desc',
      }),
    });
    const olderPost = makePage({
      path: '/posts/older',
      file: 'docs/pages/posts/older.rocket.md',
      metadata: {
        title: 'Older Post',
        date: '2026-05-10',
        tags: ['post'],
      },
    });
    const middlePost = makePage({
      path: '/posts/middle',
      file: 'docs/pages/posts/middle.rocket.md',
      metadata: {
        title: 'Middle Post',
        date: '2026-05-15',
        tags: ['post'],
      },
    });
    const newerPost = makePage({
      path: '/posts/newer',
      file: 'docs/pages/posts/newer.rocket.md',
      metadata: {
        title: 'Newer Post',
        date: '2026-05-20',
        tags: ['post'],
      },
    });
    const pages = makePageRegistry(blogIndex, olderPost, middlePost, newerPost);
    /** @type {any} */
    let loadCall;
    const runtime = new PageRuntime({
      pages,
      pageModuleLoader: {
        async load(options) {
          loadCall = options;
          return {
            kind: 'javascript',
            /**
             * @param {Request} _request
             * @param {TestPageContext} context
             */
            body(_request, context) {
              const pagination = context.pageData.pagination;
              assert.ok(pagination);
              assert.equal(context.pageData.pageRegistry, pages);
              assert.equal(context.pageData.pageRegistry.has('/blog/2/'), false);
              return new Response(
                `<main data-url="${context.pageData.url}" data-current="${pagination.currentPage}" data-total="${pagination.totalPages}" data-base="${pagination.basePath}" data-next="${pagination.nextPath || ''}" data-previous="${pagination.previousPath || ''}">${pagination.items
                  .map(post => post.metadata.title)
                  .join(',')}</main>`,
              );
            },
          };
        },
      },
    });

    const secondPageResponse = await runtime.render(new Request('https://rocket.test/blog/2/'));
    const missingFirstChildResponse = await runtime.render(
      new Request('https://rocket.test/blog/1/'),
    );
    const body = await secondPageResponse.text();

    assert.equal(secondPageResponse.status, 200);
    assert.equal(loadCall.page, blogIndex);
    assert.equal(loadCall.routePath, '/blog');
    assert.equal(loadCall.request.url, 'https://rocket.test/blog/2/');
    assert.deepEqual(loadCall.variant, { kind: 'paginated-archive', pageNumber: 2 });
    assert.match(body, /data-url="\/blog\/2\/"/);
    assert.match(body, /data-current="2"/);
    assert.match(body, /data-total="2"/);
    assert.match(body, /data-base="\/blog\/"/);
    assert.match(body, /data-next=""/);
    assert.match(body, /data-previous="\/blog\/"/);
    assert.match(body, />Older Post<\/main>/);
    assert.doesNotMatch(body, /Newer Post|Middle Post/);
    assert.equal(missingFirstChildResponse.status, 404);
    assert.equal(await missingFirstChildResponse.text(), 'Page not found');
  });

  it('19: redirects URL Lifecycle exact source matches before Page matching', async () => {
    const exactPage = makePage({
      path: '/old',
      file: 'docs/pages/old.rocket.js',
      title: 'Old Page',
    });
    const parameterizedPage = makePage({
      path: '/docs/:slug',
      file: 'docs/pages/docs.rocket.js',
      title: 'Docs Page',
    });
    let loaded = false;
    const runtime = new PageRuntime({
      pages: makePageRegistry(exactPage, parameterizedPage),
      pageModuleLoader: {
        async load() {
          loaded = true;
          return {
            kind: 'javascript',
            body: () => new Response('should not render'),
          };
        },
      },
      urlLifecycle: {
        redirects: [
          { source: '/old', target: '/new' },
          { source: '/docs/latest', target: 'https://docs.example.com/latest', status: 301 },
        ],
      },
    });

    const exactResponse = await runtime.render(new Request('https://rocket.test/old'));
    const parameterizedResponse = await runtime.render(
      new Request('https://rocket.test/docs/latest'),
    );

    assert.equal(exactResponse.status, 308);
    assert.equal(exactResponse.headers.get('location'), '/new');
    assert.equal(await exactResponse.text(), '');
    assert.equal(parameterizedResponse.status, 301);
    assert.equal(parameterizedResponse.headers.get('location'), 'https://docs.example.com/latest');
    assert.equal(await parameterizedResponse.text(), '');
    assert.equal(loaded, false);
  });

  it('20: honors configured Redirect statuses and does not normalize trailing slashes', async () => {
    const runtime = new PageRuntime({
      pages: makePageRegistry(),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'javascript',
            body: () => new Response('should not render'),
          };
        },
      },
      urlLifecycle: {
        redirects: [
          { source: '/moved', target: '/destination', status: 301 },
          { source: '/found', target: '/destination', status: 302 },
          { source: '/temporary', target: '/destination', status: 307 },
          { source: '/permanent', target: '/destination', status: 308 },
          { source: '/slash', target: '/without-slash' },
          { source: '/slash/', target: '/with-slash' },
        ],
      },
    });

    for (const [source, status] of [
      ['/moved', 301],
      ['/found', 302],
      ['/temporary', 307],
      ['/permanent', 308],
    ]) {
      const response = await runtime.render(new Request(`https://rocket.test${source}`));

      assert.equal(response.status, status);
      assert.equal(response.headers.get('location'), '/destination');
    }

    const withoutSlashResponse = await runtime.render(new Request('https://rocket.test/slash'));
    const withSlashResponse = await runtime.render(new Request('https://rocket.test/slash/'));

    assert.equal(withoutSlashResponse.status, 308);
    assert.equal(withoutSlashResponse.headers.get('location'), '/without-slash');
    assert.equal(withSlashResponse.status, 308);
    assert.equal(withSlashResponse.headers.get('location'), '/with-slash');
  });

  it('21: renders Markdown Pages with Site Head Metadata from Page Metadata', async () => {
    const page = makePage({
      path: '/guides/runtime',
      file: 'docs/pages/guides/runtime.rocket.md',
      metadata: {
        title: 'Runtime Guide',
        description: 'Learn Rocket runtime.',
      },
    });
    /** @type {PageData | undefined} */
    let receivedPageData;
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} defaultLayout
             */
            contentFn(data, defaultLayout) {
              receivedPageData = data;
              data.content = html`<main>Runtime guide body</main>`;
              return render(defaultLayout(data));
            },
          };
        },
      },
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/guides/runtime'));
    const body = await response.text();

    assert.deepEqual(receivedPageData?.siteHeadMetadata, {
      siteName: 'Rocket Docs',
      defaultDescription: 'Rocket project documentation.',
      language: 'en',
      title: 'Runtime Guide | Rocket Docs',
      description: 'Learn Rocket runtime.',
      canonicalUrl: 'https://docs.rocket.test/guides/runtime',
    });
    assert.match(body, /<html lang="en">/);
    assert.match(body, /<title>[\s\S]*Runtime Guide[\s\S]*\|[\s\S]*Rocket Docs[\s\S]*<\/title>/);
    assertHeadTag(body, 'meta', 'name', 'description', 'content', 'Learn Rocket runtime.');
    assertHeadTag(
      body,
      'link',
      'rel',
      'canonical',
      'href',
      'https://docs.rocket.test/guides/runtime',
    );
    assertHeadTag(body, 'meta', 'property', 'og:site_name', 'content', 'Rocket Docs');
    assertHeadTag(body, 'meta', 'property', 'og:title', 'content', 'Runtime Guide | Rocket Docs');
    assertHeadTag(body, 'meta', 'property', 'og:description', 'content', 'Learn Rocket runtime.');
    assertHeadTag(
      body,
      'meta',
      'property',
      'og:url',
      'content',
      'https://docs.rocket.test/guides/runtime',
    );
    assertHeadTag(body, 'meta', 'property', 'og:type', 'content', 'website');
    assert.doesNotMatch(body, /<meta[^>]*property="og:image"[^>]*>/);
    assertHeadTag(body, 'meta', 'name', 'twitter:card', 'content', 'summary');
    assertHeadTag(body, 'meta', 'name', 'twitter:title', 'content', 'Runtime Guide | Rocket Docs');
    assertHeadTag(body, 'meta', 'name', 'twitter:description', 'content', 'Learn Rocket runtime.');
    assertHeadTag(
      body,
      'meta',
      'name',
      'twitter:url',
      'content',
      'https://docs.rocket.test/guides/runtime',
    );
    assert.doesNotMatch(body, /<meta[^>]*name="twitter:image"[^>]*>/);
  });

  it('22: exposes Site Head Metadata to JavaScript Pages that render document helpers', async () => {
    const page = makePage({
      path: '/',
      file: 'docs/pages/home.rocket.js',
      metadata: { title: 'Home' },
    });
    /** @type {PageData | undefined} */
    let receivedPageData;
    const runtime = new PageRuntime({
      pages: new Map([[page.module.config.path, page]]),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'javascript',
            /**
             * @param {Request} _request
             * @param {TestPageContext} context
             */
            async body(_request, context) {
              receivedPageData = context.pageData;
              context.pageData.content = html`<main>Home body</main>`;
              const documentResult = document(context.pageData, context.pageData.content, {
                menu: false,
              });
              return new Response(await collectResult(render(documentResult)), {
                headers: { 'content-type': 'text/html; charset=utf-8' },
              });
            },
          };
        },
      },
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en-US',
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/'));
    const body = await response.text();

    assert.deepEqual(receivedPageData?.siteHeadMetadata, {
      siteName: 'Rocket Docs',
      defaultDescription: 'Rocket project documentation.',
      language: 'en-US',
      title: 'Rocket Docs',
      description: 'Rocket project documentation.',
      canonicalUrl: 'https://docs.rocket.test/',
    });
    assert.match(body, /<html lang="en-US">/);
    assert.match(body, /<title>[\s\S]*Rocket Docs[\s\S]*<\/title>/);
    assert.doesNotMatch(body, /Home[\s\S]*\|[\s\S]*Rocket Docs/);
    assertHeadTag(body, 'meta', 'name', 'description', 'content', 'Rocket project documentation.');
    assertHeadTag(body, 'link', 'rel', 'canonical', 'href', 'https://docs.rocket.test/');
    assertHeadTag(body, 'meta', 'property', 'og:title', 'content', 'Rocket Docs');
    assertHeadTag(
      body,
      'meta',
      'property',
      'og:description',
      'content',
      'Rocket project documentation.',
    );
    assertHeadTag(body, 'meta', 'property', 'og:url', 'content', 'https://docs.rocket.test/');
    assertHeadTag(body, 'meta', 'name', 'twitter:title', 'content', 'Rocket Docs');
    assertHeadTag(
      body,
      'meta',
      'name',
      'twitter:description',
      'content',
      'Rocket project documentation.',
    );
    assertHeadTag(body, 'meta', 'name', 'twitter:url', 'content', 'https://docs.rocket.test/');
  });

  it('23: renders Site Head Metadata indexing, favicon assets, and theme color', async () => {
    const draftPage = makePage({
      path: '/draft',
      file: 'docs/pages/draft.rocket.md',
      metadata: {
        title: 'Draft',
        description: 'Draft page.',
      },
      config: {
        siteHeadMetadata: { indexing: 'noindex' },
        discoverability: { robots: 'allow' },
      },
    });
    const publicPage = makePage({
      path: '/public',
      file: 'docs/pages/public.rocket.md',
      metadata: {
        title: 'Public',
        description: 'Public page.',
      },
      config: {
        siteHeadMetadata: { indexing: 'index' },
        discoverability: { robots: 'disallow' },
      },
    });
    const runtime = new PageRuntime({
      pages: makePageRegistry(draftPage, publicPage),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} defaultLayout
             */
            contentFn(data, defaultLayout) {
              data.content = html`<main>${data.metadata.title}</main>`;
              return render(defaultLayout(data));
            },
          };
        },
      },
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
        icons: {
          ico: '/assets/favicon.ico',
          svg: '/assets/favicon.svg',
          appleTouchIcon: '/assets/apple-touch-icon.png',
        },
        themeColor: '#123456',
      },
    });

    const draftResponse = await runtime.render(new Request('https://rocket.test/draft'));
    const draftBody = await draftResponse.text();
    const publicResponse = await runtime.render(new Request('https://rocket.test/public'));
    const publicBody = await publicResponse.text();

    assertHeadTag(draftBody, 'meta', 'name', 'robots', 'content', 'noindex');
    assertHeadTag(draftBody, 'link', 'rel', 'icon', 'href', '/assets/favicon.ico');
    assert.match(
      draftBody,
      /<link[^>]*rel="icon"[^>]*href="\/assets\/favicon\.svg"[^>]*type="image\/svg\+xml"[^>]*>/,
    );
    assertHeadTag(
      draftBody,
      'link',
      'rel',
      'apple-touch-icon',
      'href',
      '/assets/apple-touch-icon.png',
    );
    assertHeadTag(draftBody, 'meta', 'name', 'theme-color', 'content', '#123456');
    assert.doesNotMatch(publicBody, /<meta[^>]*name="robots"[^>]*>/);
  });

  it('24: renders explicit Social Preview Image metadata', async () => {
    const pageRelativePage = makePage({
      path: '/guides/runtime',
      file: 'docs/pages/guides/runtime.rocket.md',
      metadata: {
        title: 'Runtime',
        description: 'Runtime guide.',
      },
      config: {
        siteHeadMetadata: { socialPreview: { image: 'social/card.png' } },
      },
    });
    const siteRootPage = makePage({
      path: '/guides/assets',
      file: 'docs/pages/guides/assets.rocket.md',
      metadata: {
        title: 'Assets',
        description: 'Asset guide.',
      },
      config: {
        siteHeadMetadata: { socialPreview: { image: '/social/assets-card.png' } },
      },
    });
    const absolutePage = makePage({
      path: '/guides/cdn',
      file: 'docs/pages/guides/cdn.rocket.md',
      metadata: {
        title: 'CDN',
        description: 'CDN guide.',
      },
      config: {
        siteHeadMetadata: { socialPreview: { image: 'https://cdn.rocket.test/card.png' } },
      },
    });
    /** @type {Record<string, PageData | undefined>} */
    const receivedPageData = {};
    const runtime = new PageRuntime({
      pages: makePageRegistry(pageRelativePage, siteRootPage, absolutePage),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             * @param {TestLayout} defaultLayout
             */
            contentFn(data, defaultLayout) {
              receivedPageData[data.url] = data;
              data.content = html`<main>${data.metadata.title}</main>`;
              return render(defaultLayout(data));
            },
          };
        },
      },
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
      },
    });

    const pageRelativeResponse = await runtime.render(
      new Request('https://rocket.test/guides/runtime'),
    );
    const pageRelativeBody = await pageRelativeResponse.text();
    await runtime.render(new Request('https://rocket.test/guides/assets'));
    await runtime.render(new Request('https://rocket.test/guides/cdn'));

    assert.deepEqual(receivedPageData['/guides/runtime']?.siteHeadMetadata?.socialPreview, {
      image: 'https://docs.rocket.test/guides/runtime/social/card.png',
    });
    assert.deepEqual(receivedPageData['/guides/assets']?.siteHeadMetadata?.socialPreview, {
      image: 'https://docs.rocket.test/social/assets-card.png',
    });
    assert.deepEqual(receivedPageData['/guides/cdn']?.siteHeadMetadata?.socialPreview, {
      image: 'https://cdn.rocket.test/card.png',
    });
    assertHeadTag(
      pageRelativeBody,
      'meta',
      'property',
      'og:image',
      'content',
      'https://docs.rocket.test/guides/runtime/social/card.png',
    );
    assertHeadTag(
      pageRelativeBody,
      'meta',
      'name',
      'twitter:card',
      'content',
      'summary_large_image',
    );
    assertHeadTag(
      pageRelativeBody,
      'meta',
      'name',
      'twitter:image',
      'content',
      'https://docs.rocket.test/guides/runtime/social/card.png',
    );
  });

  it('25: server-renders rocket-icon hosts from project Icon Library Configuration', async () => {
    const page = makePage({
      path: '/icons',
      file: 'docs/pages/icons.rocket.md',
      metadata: { title: 'Icons' },
    });
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             */
            contentFn(data) {
              data.content = html`<main>
                <rocket-icon
                  class="toolbar-icon"
                  library="bootstrap"
                  name="alarm"
                  icon-loading="server"
                  aria-hidden="true"
                ></rocket-icon>
              </main>`;
              return render(document(data, data.content, { menu: false }));
            },
          };
        },
      },
      iconLibraries: {
        bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/icons'));
    const body = await response.text();

    assert.match(
      body,
      /<rocket-icon\s+class="toolbar-icon"\s+library="bootstrap"\s+name="alarm"\s+icon-loading="server"\s+aria-hidden="true"\s*>/,
    );
    assert.match(body, /<template shadowrootmode="open">/);
    assert.match(body, /<span part="icon"><svg[^>]*fill="currentColor"[^>]*>/);
    assert.doesNotMatch(body, /data-rocket-icon-manifest|RocketIcon|size=/);
  });

  it('26: resolves omitted rocket-icon libraries through the active Default Icon Library', async () => {
    const page = makePage({
      path: '/default-icon-library',
      file: 'docs/pages/default-icon-library.rocket.md',
      metadata: { title: 'Default Icons' },
    });
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             */
            contentFn(data) {
              data.content = html`<main><rocket-icon name="alarm"></rocket-icon></main>`;
              return render(document(data, data.content, { menu: false }));
            },
          };
        },
      },
      iconLibraries: {
        bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
      },
      defaultIconLibrary: 'bootstrap',
    });

    const response = await runtime.render(new Request('https://rocket.test/default-icon-library'));
    const body = await response.text();

    assert.match(body, /<rocket-icon name="alarm">/);
    assert.doesNotMatch(body, /<rocket-icon[^>]*library="bootstrap"/);
    assert.doesNotMatch(body, /icon-loading="auto"/);
    assert.match(body, /<span part="icon"><svg/);
  });

  it('27: layers layout Icon Libraries with project configuration and rejects collisions', async () => {
    const page = makePage({
      path: '/layout-icons',
      file: 'docs/pages/layout-icons.rocket.md',
      metadata: { title: 'Layout Icons' },
    });
    const pages = makePageRegistry(page);
    /** @type {import('./page-runtime.js').PageModuleLoader} */
    const pageModuleLoader = {
      async load() {
        return {
          kind: 'markdown',
          /**
           * @param {PageData} data
           */
          contentFn(data) {
            data.addIconLibraries(
              {
                layout: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
              },
              { defaultIconLibrary: 'layout' },
            );
            data.content = html`<main><rocket-icon name="alarm"></rocket-icon></main>`;
            return render(document(data, data.content, { menu: false }));
          },
        };
      },
    };
    const runtime = new PageRuntime({
      pages,
      pageModuleLoader,
      iconLibraries: {
        project: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
      },
    });
    const collidingRuntime = new PageRuntime({
      pages,
      pageModuleLoader,
      iconLibraries: {
        layout: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
      },
    });

    const response = await runtime.render(new Request('https://rocket.test/layout-icons'));
    const body = await response.text();

    assert.match(body, /<rocket-icon name="alarm">/);
    assert.match(body, /<span part="icon"><svg/);
    await assert.rejects(
      () => collidingRuntime.render(new Request('https://rocket.test/layout-icons')),
      /Icon Library "layout" is supplied by both project configuration and the active layout/,
    );
  });

  it('28: includes Page config and PageData Icon References in the Icon Manifest', async () => {
    const page = makePage({
      path: '/dynamic-icons',
      file: 'docs/pages/dynamic-icons.rocket.md',
      metadata: { title: 'Dynamic Icons' },
      config: {
        iconReferences: [{ name: 'plus-square' }, { library: 'bootstrap', name: 'dash-square' }],
      },
    });
    const runtime = new PageRuntime({
      pages: makePageRegistry(page),
      pageModuleLoader: {
        async load() {
          return {
            kind: 'markdown',
            /**
             * @param {PageData} data
             */
            contentFn(data) {
              data.addIconReferences([{ library: 'bootstrap', name: 'arrow-up-right' }]);
              data.content = html`<main>Dynamic browser icons</main>`;
              return render(document(data, data.content, { menu: false }));
            },
          };
        },
      },
      iconLibraries: {
        bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
      },
      defaultIconLibrary: 'bootstrap',
    });

    const response = await runtime.render(new Request('https://rocket.test/dynamic-icons'));
    const body = await response.text();
    const manifest = readIconManifest(body);

    assert.equal(manifest.defaultLibrary, 'bootstrap');
    assert.deepEqual(Object.keys(manifest.icons).sort(), [
      'bootstrap:arrow-up-right',
      'bootstrap:dash-square',
      'bootstrap:plus-square',
    ]);
    assert.match(body, /data-rocket-icon-runtime/);
  });
});

/**
 * @param {unknown} value
 * @param {{ body: string; status: number; contentType: string | null }} expected
 */
async function assertNormalizes(value, expected) {
  const page = makePage();
  const runtime = new PageRuntime({
    pages: makePageRegistry(page),
    pageModuleLoader: {
      async load() {
        return {
          kind: 'javascript',
          body: () => value,
        };
      },
    },
  });

  const response = await runtime.render(new Request('https://rocket.test/example'));

  assert.equal(response.status, expected.status);
  assert.equal(response.headers.get('content-type'), expected.contentType);
  assert.equal(await response.text(), expected.body);
}

/**
 * @param {{ path?: string; file?: string; title?: string; metadata?: import('@rocket/js/types.js').PageMetadata; config?: Omit<import('@rocket/js/types.js').PageConfig, 'path' | 'metadata'>; demoNames?: string[] }} [options]
 * @returns {import('@rocket/js/types.js').Page}
 */
function makePage({
  path = '/example',
  file = 'docs/pages/example.rocket.js',
  title = 'Example',
  metadata,
  config = {},
  demoNames = [],
} = {}) {
  const pageMetadata = metadata || { title, linkText: title };
  return {
    file,
    module: { config: { path, metadata: { title: pageMetadata.title }, ...config } },
    metadata: pageMetadata,
    demoNames,
  };
}

/**
 * @param {import('@rocket/js/types.js').Page[]} pageEntries
 */
function makePageRegistry(...pageEntries) {
  const root = makePage({
    path: '/',
    file: 'docs/pages/root.rocket.md',
    title: 'Home',
  });
  /** @type {import('@rocket/js/types.js').PageRegistry} */
  const pages = new Map();
  pages.set(root.module.config.path, root);
  for (const page of pageEntries) {
    pages.set(page.module.config.path, page);
  }
  return pages;
}

/**
 * @param {string} body
 * @returns {{ defaultLibrary?: string; icons: Record<string, string> }}
 */
function readIconManifest(body) {
  const match = /<script type="application\/json" data-rocket-icon-manifest>(.*?)<\/script>/.exec(
    body,
  );
  assert.ok(match, 'Expected Icon Manifest');
  return JSON.parse(match[1]);
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
