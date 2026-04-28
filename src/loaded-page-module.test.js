import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeJavaScriptPageModule,
  normalizeLoadedPageModule,
  normalizeMarkdownPageModule,
} from './loaded-page-module.js';

/** @typedef {{ _hydrationScript?: string; _hasBrowserLoadedComponents?: boolean }} TestPageData */
/** @typedef {{ params?: Record<string, string>; pageData: TestPageData; adapterContext?: unknown }} TestPageContext */

describe('Test loadedPageModule', () => {
  it('01: normalizes Markdown raw modules to Loaded Page Modules', () => {
    function contentFn() {}

    assert.deepEqual(normalizeMarkdownPageModule({ contentFn }), {
      kind: 'markdown',
      contentFn,
    });
    assert.deepEqual(normalizeLoadedPageModule({ kind: 'markdown', module: { contentFn } }), {
      kind: 'markdown',
      contentFn,
    });
  });

  it('02: normalizes JavaScript raw modules from default or content exports', () => {
    function defaultBody() {}
    function contentBody() {}

    assert.deepEqual(
      normalizeJavaScriptPageModule({ default: defaultBody, content: contentBody }),
      {
        kind: 'javascript',
        body: defaultBody,
      },
    );
    assert.deepEqual(
      normalizeLoadedPageModule({ kind: 'javascript', module: { content: contentBody } }),
      {
        kind: 'javascript',
        body: contentBody,
      },
    );
  });

  it('03: leaves invalid raw modules for Page Runtime validation', () => {
    assert.deepEqual(normalizeJavaScriptPageModule({ content: 'not executable' }), {
      kind: 'javascript',
      body: 'not executable',
    });
    assert.deepEqual(normalizeMarkdownPageModule({ contentFn: 'not executable' }), {
      kind: 'markdown',
      contentFn: 'not executable',
    });
  });

  it('04: wraps JavaScript Page bodies through Loaded Page Module hydration', async () => {
    const components = {
      'my-element': { file: './MyElement.js', className: 'MyElement', loading: 'client' },
    };
    /** @type {TestPageData} */
    const pageData = {};
    let receivedContext;
    const loadedPageModule = normalizeLoadedPageModule({
      kind: 'javascript',
      module: {
        components,
        /**
         * @param {Request} _request
         * @param {TestPageContext} context
         */
        default(_request, context) {
          receivedContext = context;
          return new Response('hydrated');
        },
      },
      async parseComponents(receivedComponents) {
        assert.equal(receivedComponents, components);
        return '/* hydration */';
      },
    });

    if (loadedPageModule.kind !== 'javascript') {
      assert.fail('expected JavaScript Loaded Page Module');
    }
    if (typeof loadedPageModule.body !== 'function') {
      assert.fail('expected executable JavaScript Page body');
    }
    const response = await loadedPageModule.body(new Request('https://rocket.test/app'), {
      params: { id: '123' },
      pageData,
      adapterContext: { platform: 'netlify' },
    });

    assert.equal(await response.text(), 'hydrated');
    assert.equal(pageData._hydrationScript, '/* hydration */');
    assert.deepEqual(receivedContext, {
      params: { id: '123' },
      pageData,
      adapterContext: { platform: 'netlify' },
    });
  });

  it('05: wraps Markdown Page content with hydration when component parsing is provided', async () => {
    const components = {
      'my-element': { file: './MyElement.js', className: 'MyElement', loading: 'client' },
    };
    /** @type {TestPageData} */
    const pageData = {};
    const layout = () => 'layout result';
    let receivedPageData;
    let receivedLayout;
    const loadedPageModule = normalizeLoadedPageModule({
      kind: 'markdown',
      module: {
        components,
        /**
         * @param {TestPageData} data
         * @param {() => string} defaultLayout
         */
        contentFn(data, defaultLayout) {
          receivedPageData = data;
          receivedLayout = defaultLayout;
          return 'rendered markdown';
        },
      },
      async parseComponents(receivedComponents) {
        assert.equal(receivedComponents, components);
        return '/* hydration */';
      },
    });

    if (loadedPageModule.kind !== 'markdown') {
      assert.fail('expected Markdown Loaded Page Module');
    }
    if (typeof loadedPageModule.contentFn !== 'function') {
      assert.fail('expected executable Markdown content function');
    }
    assert.equal(await loadedPageModule.contentFn(pageData, layout), 'rendered markdown');
    assert.equal(pageData._hydrationScript, '/* hydration */');
    assert.equal(receivedPageData, pageData);
    assert.equal(receivedLayout, layout);
  });

  it('06: wraps Markdown Page content with hydration from re-exported components', async () => {
    const componentMapUrl = makeModuleUrl(`
    export const componentMap = {
      'my-element': { file: './MyElement.js', className: 'MyElement', loading: 'client' },
    };
  `);
    const module = await import(
      makeModuleUrl(`
      export { componentMap as components } from ${JSON.stringify(componentMapUrl)};
      export function contentFn() {
        return 'rendered markdown';
      }
    `)
    );
    /** @type {TestPageData} */
    const pageData = {};
    const loadedPageModule = normalizeLoadedPageModule({
      kind: 'markdown',
      module,
      async parseComponents(receivedComponents) {
        assert.equal(receivedComponents, module.components);
        return '/* hydration */';
      },
    });

    if (loadedPageModule.kind !== 'markdown') {
      assert.fail('expected Markdown Loaded Page Module');
    }
    if (typeof loadedPageModule.contentFn !== 'function') {
      assert.fail('expected executable Markdown content function');
    }
    assert.equal(
      await loadedPageModule.contentFn(pageData, () => 'layout result'),
      'rendered markdown',
    );
    assert.equal(pageData._hydrationScript, '/* hydration */');
  });

  it('07: does not wrap JavaScript Page bodies without component parsing or components', () => {
    function body() {}

    assert.equal(normalizeJavaScriptPageModule({ components: {}, default: body }).body, body);
    assert.equal(
      normalizeJavaScriptPageModule({ default: body }, { parseComponents: () => '' }).body,
      body,
    );
  });

  it('08: records client and hydrated Registered Components as browser-loaded Page data', async () => {
    const components = {
      'server-element': {
        file: './ServerElement.js',
        className: 'ServerElement',
        loading: 'server',
      },
      'client-element': {
        file: './ClientElement.js',
        className: 'ClientElement',
        loading: 'client',
      },
      'hydrated-element': {
        file: './HydratedElement.js',
        className: 'HydratedElement',
        loading: 'hydrate:onVisible',
      },
    };
    /** @type {TestPageData} */
    const pageData = {};
    const loadedPageModule = normalizeLoadedPageModule({
      kind: 'javascript',
      module: {
        components,
        default() {
          return new Response('browser-loaded');
        },
      },
      async parseComponents() {
        return '';
      },
    });

    if (loadedPageModule.kind !== 'javascript' || typeof loadedPageModule.body !== 'function') {
      assert.fail('expected executable JavaScript Page body');
    }
    await loadedPageModule.body(new Request('https://rocket.test/components'), {
      pageData,
    });

    assert.equal(pageData._hasBrowserLoadedComponents, true);
    assert.equal(pageData._hydrationScript, '');
  });

  it('09: leaves pure server Registered Components out of browser-loaded Page data', async () => {
    const components = {
      'server-element': {
        file: './ServerElement.js',
        className: 'ServerElement',
        loading: 'server',
      },
    };
    /** @type {TestPageData} */
    const pageData = {};
    const loadedPageModule = normalizeLoadedPageModule({
      kind: 'markdown',
      module: {
        components,
        contentFn() {
          return 'server-only';
        },
      },
      async parseComponents() {
        return '';
      },
    });

    if (loadedPageModule.kind !== 'markdown' || typeof loadedPageModule.contentFn !== 'function') {
      assert.fail('expected executable Markdown Page content function');
    }
    await loadedPageModule.contentFn(pageData, () => 'layout');

    assert.equal(pageData._hasBrowserLoadedComponents, false);
    assert.equal(pageData._hydrationScript, '');
  });
});

/**
 * @param {string} source
 */
function makeModuleUrl(source) {
  return `data:text/javascript,${encodeURIComponent(source)}`;
}
