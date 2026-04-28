import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, it } from 'node:test';
import { customElements } from '@lit-labs/ssr-dom-shim';
import { splitPages } from '../cli/RocketBuild.js';
import { makeLiveComponentsSource, makeNetlifyFunctionSource, netlify } from './netlify.js';
import { rocketMarkdownPlugin } from '../markdownCompiler.js';
import { iconsFromPath } from '../icons.js';

/** @typedef {import('@rocket/js/types.js').PageRegistry} PageRegistry */

describe('Test netlify', () => {
  it('01: generates static function config paths', () => {
    const pages = new Map([
      ['/static', page({ path: '/static' }, 'docs/static.rocket.md')],
      ['/blog/:slug', page({ path: '/blog/:slug', render: 'server' }, 'docs/blog.rocket.js')],
    ]);
    const source = makeNetlifyFunctionSource(makeAdapterBuildContext(pages));

    assert.match(source, /export const config = \{/);
    assert.ok(
      source.includes(
        'path: ["/blog/:slug","/_rocket/icons/:library/:iconFile","/_rocket/rocket-icon.js","/_rocket/RocketIcon.js"]',
      ),
    );
    assert.match(source, /preferStatic: true/);
    assert.match(source, /generator: '@rocket\/js'/);
    assert.match(source, /import \{ parseComponents \} from '@rocket\/js\/components\.js'/);
    assert.match(
      source,
      /normalizeLoadedPageModule\(\{ kind: 'javascript', module, parseComponents \}\)/,
    );
  });

  it('02: routes server-rendered Markdown Standalone Demo URLs to the function', () => {
    const pages = new Map([
      [
        '/static',
        page({ path: '/static' }, 'docs/static.rocket.md', { demoNames: ['staticButton'] }),
      ],
      [
        '/guide/:slug',
        page({ path: '/guide/:slug', render: 'server' }, 'docs/guide.rocket.md', {
          demoNames: ['serverButton'],
        }),
      ],
      [
        '/app',
        page({ path: '/app', render: 'server' }, 'docs/app.rocket.js', {
          demoNames: ['ignoredJavaScriptDemo'],
        }),
      ],
    ]);
    const source = makeNetlifyFunctionSource(makeAdapterBuildContext(pages));

    assert.ok(
      source.includes(
        'path: ["/guide/:slug","/guide/:slug/_demo/:demoName/","/app","/_rocket/icons/:library/:iconFile","/_rocket/rocket-icon.js","/_rocket/RocketIcon.js"]',
      ),
    );
    assert.doesNotMatch(source, /\/static\/_demo\/:demoName\//);
    assert.doesNotMatch(source, /\/app\/_demo\/:demoName\//);
  });

  it('03: generates Page Module Loader entries for Standalone Demo Markdown modules', () => {
    const pages = new Map([
      [
        '/guide',
        page({ path: '/guide', render: 'server' }, 'docs/guide.rocket.md', {
          demoNames: ['serverButton', 'advancedButton'],
        }),
      ],
    ]);
    const source = makeNetlifyFunctionSource(makeAdapterBuildContext(pages));

    assert.match(source, /\?rocketSingleDemo=serverButton/);
    assert.match(source, /\?rocketSingleDemo=advancedButton/);
    assert.match(
      source,
      /const standaloneDemoModules = new Map\(\[\["\/guide", new Map\(\[\["serverButton", pageModule0StandaloneDemo0\],\["advancedButton", pageModule0StandaloneDemo1\]\]\)\]\]\);/,
    );
    assert.match(source, /const module = getMarkdownPageModule\(routePath, variant\);/);
  });

  it('04: compiles Standalone Demo Markdown imports for the requested demo variant', async () => {
    const plugin = rocketMarkdownPlugin();
    const markdown = `# Guide

Parent page copy.

\`\`\`js demo
export const serverButton = () => 'server';
\`\`\`

\`\`\`js demo
export const advancedButton = () => 'advanced';
\`\`\`
`;

    const result = await transformMarkdown(
      plugin,
      markdown,
      '/docs/guide.rocket.md?rocketSingleDemo=serverButton',
    );

    assertTransformedCode(result);
    assert.match(result.code, /demo-name="serverButton" single-demo/);
    assert.doesNotMatch(result.code, /Parent page copy/);
    assert.doesNotMatch(result.code, /advancedButton/);
  });

  it('05: generates Page execution that delegates to the Page Runtime', () => {
    const pages = new Map([
      ['/static', page({ path: '/static' }, 'docs/static.rocket.md')],
      ['/blog/:slug', page({ path: '/blog/:slug', render: 'server' }, 'docs/blog.rocket.js')],
      ['/guide', page({ path: '/guide', render: 'server' }, 'docs/guide.rocket.md')],
    ]);
    const source = makeNetlifyFunctionSource(makeAdapterBuildContext(pages));

    assert.match(
      source,
      /import \{ PageRuntime, PageRuntimeError \} from '@rocket\/js\/page-runtime\.js'/,
    );
    assert.match(
      source,
      /import \{ normalizeLoadedPageModule \} from '@rocket\/js\/loaded-page-module\.js'/,
    );
    assert.match(source, /const pageRegistry = new Map/);
    assert.match(source, /const pageModules = \[pageModule0, pageModule1\]/);
    assert.match(source, /const pageModuleLoader = \{/);
    assert.match(
      source,
      /normalizeLoadedPageModule\(\{ kind: 'javascript', module, parseComponents \}\)/,
    );
    assert.match(
      source,
      /normalizeLoadedPageModule\(\{ kind: 'markdown', module, parseComponents \}\)/,
    );
    assert.match(source, /const pageRuntime = new PageRuntime\(\{\s+pages: pageRegistry,/);
    assert.match(
      source,
      /return await pageRuntime\.render\(request, \{ adapterContext: context \}\);/,
    );
    assert.doesNotMatch(source, /function wrapJavaScriptPageBody\(module\)/);
    assert.doesNotMatch(
      source,
      /pageData\._hydrationScript = await parseComponents\(module\.components\);/,
    );
    assert.match(source, /if \(!\(error instanceof PageRuntimeError\)\) \{\s+throw error;\s+\}/);
    assert.doesNotMatch(source, /function findServerPage\(pathname, origin\)/);
    assert.doesNotMatch(source, /function normalizeResponse\(value\)/);
    assert.match(source, /return new Response\('Internal Server Error', \{ status: 500 \}\);/);
  });

  it('06: classifies live Component Hydration with live asset URLs', async () => {
    const tempRoot = path.join(process.cwd(), 'temp');
    mkdirSync(tempRoot, { recursive: true });
    const projectRoot = mkdtempSync(path.join(tempRoot, 'rocket-netlify-components-'));
    const componentsDir = path.join(projectRoot, 'src', 'components');
    const componentFile = path.join(componentsDir, 'live-elements.js');
    const generatedFile = path.join(projectRoot, 'generated-live-components.js');
    const components = {
      'server-element': {
        file: componentFile,
        className: 'ServerElement',
        loading: 'server',
      },
      'client-element': {
        file: componentFile,
        className: 'ClientElement',
        loading: 'client',
      },
      'hydrated-element': {
        file: componentFile,
        className: 'HydratedElement',
        loading: 'hydrate:onVisible',
      },
    };

    mkdirSync(componentsDir, { recursive: true });
    writeFileSync(
      componentFile,
      [
        'export class ServerElement {}',
        'export class ClientElement {}',
        'export class HydratedElement {}',
      ].join('\n'),
    );

    try {
      writeFileSync(
        generatedFile,
        makeLiveComponentsSource(
          makeAdapterBuildContext(new Map([['/live', pageWithComponents(components)]])),
          makeLiveAssetsStub(),
        ),
      );

      const { parseComponents } = await import(pathToFileURL(generatedFile).href);
      const clientCode = await parseComponents(components);

      assert.equal(customElements.__definitions.has('server-element'), true);
      assert.equal(customElements.__definitions.has('hydrated-element'), true);
      assert.equal(customElements.__definitions.has('client-element'), false);
      assert.match(
        clientCode,
        /import\('\/assets\/live\/live-elements\.js'\)\.then\(module => customElements\.get\('client-element'\) \|\| customElements\.define\('client-element', module\.ClientElement\)\);/,
      );
      assert.match(
        clientCode,
        /import \{HydrationLoader\} from '\/assets\/live\/hydrationLoader\.js';/,
      );
      assert.match(
        clientCode,
        /'hydrated-element': \{getter: \(\) => import\('\/assets\/live\/live-elements\.js'\)\.then\(m => m\.HydratedElement\),\n {8}strategy: "onVisible"\},/,
      );
    } finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('07: delegates live Component Hydration source to Rocket-owned behavior', () => {
    const source = makeLiveComponentsSource(
      makeAdapterBuildContext(new Map([['/live', pageWithComponents({})]])),
      makeLiveAssetsStub(),
    );

    assert.match(source, /createComponentHydration/);
    assert.doesNotMatch(source, /serverOnlyComponents/);
    assert.doesNotMatch(source, /clientComponents/);
    assert.doesNotMatch(source, /hydratedComponents/);
    assert.doesNotMatch(source, /loading\.startsWith\('hydrate:'\)/);
  });

  it('08: passes URL Lifecycle config into generated Page Runtime', () => {
    const pages = new Map([
      ['/blog/:slug', page({ path: '/blog/:slug', render: 'server' }, 'docs/blog.rocket.js')],
    ]);
    const source = makeNetlifyFunctionSource(
      makeAdapterBuildContext(pages, {
        urlLifecycle: {
          redirects: [{ source: '/blog/latest', target: '/blog/current', status: 302 }],
        },
      }),
    );

    assert.match(
      source,
      /const urlLifecycle = \{"redirects":\[\{"source":"\/blog\/latest","target":"\/blog\/current","status":302\}\]\};/,
    );
    assert.match(
      source,
      /const pageRuntime = new PageRuntime\(\{\s+pages: pageRegistry,\s+pageModuleLoader,\s+urlLifecycle,\s+siteHeadMetadata,\s+siteOrigin,\s+iconLibraries,\s+defaultIconLibrary,\s+iconAssetStore,\s+defaultSocialPreviewImages,\s+\}\);/,
    );
  });

  it('09: passes Site Head Metadata config into generated Page Runtime', () => {
    const pages = new Map([
      ['/blog/:slug', page({ path: '/blog/:slug', render: 'server' }, 'docs/blog.rocket.js')],
    ]);
    const source = makeNetlifyFunctionSource(
      makeAdapterBuildContext(pages, {
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
        },
      }),
    );

    assert.match(source, /const siteOrigin = "https:\/\/docs\.rocket\.test";/);
    assert.match(
      source,
      /const siteHeadMetadata = \{"siteName":"Rocket Docs","defaultDescription":"Rocket project documentation\.","language":"en"\};/,
    );
    assert.match(
      source,
      /const pageRuntime = new PageRuntime\(\{\s+pages: pageRegistry,\s+pageModuleLoader,\s+urlLifecycle,\s+siteHeadMetadata,\s+siteOrigin,\s+iconLibraries,\s+defaultIconLibrary,\s+iconAssetStore,\s+defaultSocialPreviewImages,\s+\}\);/,
    );
  });

  it('10: passes static Default Social Preview Image URLs into generated Page Runtime', () => {
    const pages = new Map([
      ['/guide', page({ path: '/guide', render: 'server' }, 'docs/guide.rocket.js')],
    ]);
    const context = makeAdapterBuildContext(pages, {
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
        socialPreview: { delivery: 'static' },
      },
    });
    context.defaultSocialPreviewImages = new Map([
      [
        '/guide',
        'https://docs.rocket.test/_rocket/social-preview/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png',
      ],
    ]);

    const source = makeNetlifyFunctionSource(context);

    assert.match(
      source,
      /const defaultSocialPreviewImages = new Map\(\[\["\/guide","https:\/\/docs\.rocket\.test\/_rocket\/social-preview\/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\.png"\]\]\);/,
    );
  });

  it('11: passes Icon Library Configuration into generated Page Runtime', () => {
    const pages = new Map([
      ['/blog/:slug', page({ path: '/blog/:slug', render: 'server' }, 'docs/blog.rocket.js')],
    ]);
    const source = makeNetlifyFunctionSource(
      makeAdapterBuildContext(pages, {
        iconLibraries: {
          bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
        },
        defaultIconLibrary: 'bootstrap',
      }),
    );

    assert.match(
      source,
      /const iconLibraries = \{"bootstrap":\{"type":"package","packageName":"bootstrap-icons","files":"icons\/\*\.svg"\}\};/,
    );
    assert.match(source, /const defaultIconLibrary = "bootstrap";/);
    assert.match(
      source,
      /const pageRuntime = new PageRuntime\(\{\s+pages: pageRegistry,\s+pageModuleLoader,\s+urlLifecycle,\s+siteHeadMetadata,\s+siteOrigin,\s+iconLibraries,\s+defaultIconLibrary,\s+iconAssetStore,\s+defaultSocialPreviewImages,\s+\}\);/,
    );
  });

  it('12: renders server icons, deferred manifests, and generated assets through the adapter handler', async () => {
    const tempRoot = path.join(process.cwd(), 'temp');
    mkdirSync(tempRoot, { recursive: true });
    const projectRoot = mkdtempSync(path.join(tempRoot, 'rocket-netlify-icons-'));
    const originalCwd = process.cwd();
    const docsDir = path.join(projectRoot, 'docs');
    const iconDir = path.join(projectRoot, 'src', 'icons');
    const functionFile = path.join(projectRoot, 'generated-netlify-function.mjs');
    const boxSvg = '<svg viewBox="0 0 8 8"><path fill="currentColor" d="M0 0h8v8H0z"/></svg>';
    const bellSvg =
      '<svg viewBox="0 0 8 8"><circle fill="currentColor" cx="4" cy="4" r="4"/></svg>';

    mkdirSync(docsDir, { recursive: true });
    mkdirSync(iconDir, { recursive: true });
    writeFileSync(path.join(iconDir, 'box.svg'), boxSvg);
    writeFileSync(path.join(iconDir, 'bell.svg'), bellSvg);
    writeFileSync(
      path.join(docsDir, 'icons.rocket.js'),
      `export const config = { path: '/icons', render: 'server', metadata: { title: 'Icons' } };

export default function iconsPage() {
  return [
    '<!doctype html><html><head><title>Icons</title></head><body>',
    '<main icon-loading-region icon-server-budget="1">',
    '<rocket-icon name="box"></rocket-icon>',
    '<rocket-icon name="bell"></rocket-icon>',
    '</main>',
    '</body></html>',
  ].join('');
}
`,
    );

    process.chdir(projectRoot);
    try {
      const pages = new Map([
        ['/', page({ path: '/' }, 'docs/index.rocket.js')],
        ['/icons', page({ path: '/icons', render: 'server' }, 'docs/icons.rocket.js')],
      ]);
      writeFileSync(
        functionFile,
        makeNetlifyFunctionSource(
          makeAdapterBuildContext(pages, {
            iconLibraries: {
              local: iconsFromPath('./src/icons/*.svg'),
            },
            defaultIconLibrary: 'local',
          }),
        ),
      );

      const { default: handler } = await import(pathToFileURL(functionFile).href);
      const response = await handler(new Request('https://rocket.test/icons'), {});
      const body = await response.text();
      const manifest = readIconManifest(body);
      const assetUrl = manifest.icons['local:bell'];
      const assetResponse = await handler(
        new Request(new URL(assetUrl, 'https://rocket.test')),
        {},
      );
      const runtimeResponse = await handler(
        new Request('https://rocket.test/_rocket/rocket-icon.js'),
        {},
      );

      assert.equal(response.status, 200);
      assert.match(iconHostHtml(body, 'box'), /<span part="icon"><svg[\s>]/);
      assert.match(iconHostHtml(body, 'bell'), /<span part="icon"><\/span>/);
      assert.match(assetUrl, /^\/_rocket\/icons\/local\/bell\.[a-f0-9]{12}\.svg$/);
      assert.equal(assetResponse.status, 200);
      assert.equal(assetResponse.headers.get('content-type'), 'image/svg+xml');
      assert.equal(await assetResponse.text(), bellSvg);
      assert.equal(runtimeResponse.status, 200);
      assert.match(await runtimeResponse.text(), /customElements\.define\('rocket-icon'/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('13: fails request-time rendering for missing critical server icons', async () => {
    const tempRoot = path.join(process.cwd(), 'temp');
    mkdirSync(tempRoot, { recursive: true });
    const projectRoot = mkdtempSync(path.join(tempRoot, 'rocket-netlify-missing-icons-'));
    const originalCwd = process.cwd();
    const docsDir = path.join(projectRoot, 'docs');
    const iconDir = path.join(projectRoot, 'src', 'icons');
    const functionFile = path.join(projectRoot, 'generated-netlify-function.mjs');

    mkdirSync(docsDir, { recursive: true });
    mkdirSync(iconDir, { recursive: true });
    writeFileSync(path.join(iconDir, 'box.svg'), '<svg></svg>');
    writeFileSync(
      path.join(docsDir, 'icons.rocket.js'),
      `export const config = { path: '/icons', render: 'server', metadata: { title: 'Icons' } };

export default function iconsPage() {
  return '<main><rocket-icon name="missing" icon-loading="server"></rocket-icon></main>';
}
`,
    );

    process.chdir(projectRoot);
    try {
      const pages = new Map([
        ['/', page({ path: '/' }, 'docs/index.rocket.js')],
        ['/icons', page({ path: '/icons', render: 'server' }, 'docs/icons.rocket.js')],
      ]);
      writeFileSync(
        functionFile,
        makeNetlifyFunctionSource(
          makeAdapterBuildContext(pages, {
            iconLibraries: {
              local: iconsFromPath('./src/icons/*.svg'),
            },
            defaultIconLibrary: 'local',
          }),
        ),
      );

      const { default: handler } = await import(pathToFileURL(functionFile).href);
      await assert.rejects(
        () => handler(new Request('https://rocket.test/icons'), {}),
        /Icon "missing" was not found in Icon Library "local"/,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('14: includes icon runtime routes and source files in Netlify function config', () => {
    const pages = new Map([
      ['/blog/:slug', page({ path: '/blog/:slug', render: 'server' }, 'docs/blog.rocket.js')],
    ]);
    const source = makeNetlifyFunctionSource(
      makeAdapterBuildContext(pages, {
        iconLibraries: {
          local: iconsFromPath('./src/icons/*.svg'),
          bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
        },
        defaultIconLibrary: 'local',
      }),
    );

    assert.match(
      source,
      /import \{ createIconAssetStore, resolveRocketIconAsset \} from '@rocket\/js\/icons\.js';/,
    );
    assert.match(source, /const iconAssetStore = createIconAssetStore\(\);/);
    assert.match(source, /const rocketIconRuntimeOutputsByPath = new Map\(/);
    assert.match(source, /class RocketIcon extends HTMLElement/);
    assert.match(
      source,
      /path: \["\/blog\/:slug","\/_rocket\/icons\/:library\/:iconFile","\/_rocket\/rocket-icon\.js","\/_rocket\/RocketIcon\.js"\]/,
    );
    assert.match(
      source,
      /includedFiles: \["assets\/\*\*","node_modules\/bootstrap-icons\/package\.json","node_modules\/bootstrap-icons\/icons\/\*\.svg","src\/icons\/\*\.svg"\]/,
    );
    assert.match(source, /iconAssetStore,\s+defaultSocialPreviewImages,/);
  });

  it('15: serves Rocket layout Bootstrap icon assets without a warm icon store', async () => {
    const tempRoot = path.join(process.cwd(), 'temp');
    mkdirSync(tempRoot, { recursive: true });
    const projectRoot = mkdtempSync(path.join(tempRoot, 'rocket-netlify-layout-icons-'));
    const originalCwd = process.cwd();
    const docsDir = path.join(projectRoot, 'docs');
    const functionFile = path.join(projectRoot, 'generated-netlify-function.mjs');

    mkdirSync(docsDir, { recursive: true });
    writeFileSync(
      path.join(docsDir, 'icons.rocket.js'),
      `export const config = { path: '/icons', render: 'server', metadata: { title: 'Icons' } };

export default function iconsPage(_request, { pageData }) {
  pageData.addIconLibraries(
    {
      bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
    },
    { defaultIconLibrary: 'bootstrap' },
  );
  return [
    '<!doctype html><html><head><title>Icons</title></head><body>',
    '<rocket-icon name="alarm" icon-loading="client"></rocket-icon>',
    '</body></html>',
  ].join('');
}
`,
    );

    process.chdir(projectRoot);
    try {
      const pages = new Map([
        ['/', page({ path: '/' }, 'docs/index.rocket.js')],
        ['/icons', page({ path: '/icons', render: 'server' }, 'docs/icons.rocket.js')],
      ]);
      writeFileSync(functionFile, makeNetlifyFunctionSource(makeAdapterBuildContext(pages)));

      const functionUrl = pathToFileURL(functionFile).href;
      const warmModule = await import(`${functionUrl}?warm`);
      const pageResponse = await warmModule.default(new Request('https://rocket.test/icons'), {});
      const manifest = readIconManifest(await pageResponse.text());
      const assetUrl = manifest.icons['bootstrap:alarm'];

      const coldModule = await import(`${functionUrl}?cold`);
      const assetResponse = await coldModule.default(
        new Request(new URL(assetUrl, 'https://rocket.test')),
        {},
      );
      const assetBody = await assetResponse.text();

      assert.equal(assetResponse.status, 200);
      assert.equal(assetResponse.headers.get('content-type'), 'image/svg+xml');
      assert.match(assetUrl, /^\/_rocket\/icons\/bootstrap\/alarm\.[a-f0-9]{12}\.svg$/);
      assert.match(assetBody, /<svg[^>]*fill="currentColor"[^>]*>/);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});

/**
 * @param {Map<string, ReturnType<typeof page> | ReturnType<typeof pageWithComponents>>} pages
 * @param {Partial<import('@rocket/js/types.js').ResolvedRocketConfig>} [config]
 * @returns {import('@rocket/js/types.js').RocketAdapterBuildContext}
 */
function makeAdapterBuildContext(pages, config = {}) {
  const pageRegistry = /** @type {PageRegistry} */ (pages);
  const { staticPages, serverPages } = splitPages(pageRegistry);
  return {
    pages: pageRegistry,
    staticPages,
    serverPages,
    outDir: '/tmp/rocket-dist',
    projectRoot: process.cwd(),
    config: {
      includeGlobs: [],
      excludeRegex: [],
      /** @param {import('@web/dev-server').DevServerConfig} config */
      adjustDevServerConfig: config => config,
      adapter: netlify(),
      ...config,
    },
  };
}

/**
 * @param {{ path: string; render?: 'server' | 'static' }} config
 * @param {string} file
 * @param {{ demoNames?: string[] }} [options]
 * @returns {{ file: string; module: { config: { path: string; render?: 'server' | 'static'; metadata: { title: string } } }; metadata: { title: string; linkText?: string }; demoNames: string[] }}
 */
function page(config, file, { demoNames = [] } = {}) {
  const title = config.path;
  const pageConfig = {
    path: config.path,
    ...(config.render ? { render: config.render } : {}),
    metadata: { title },
  };
  return {
    file,
    module: { config: pageConfig },
    metadata: { title },
    demoNames,
  };
}

/**
 * @param {Record<string, unknown>} components
 * @returns {{ file: string; module: { config: { path: string; render: 'server'; metadata: { title: string } }; components: Record<string, unknown> }; metadata: { title: string }; demoNames: string[] }}
 */
function pageWithComponents(components) {
  return {
    file: 'docs/live.rocket.md',
    module: {
      config: { path: '/live', render: 'server', metadata: { title: '/live' } },
      components,
    },
    metadata: { title: '/live' },
    demoNames: [],
  };
}

function makeLiveAssetsStub() {
  return /** @type {any} */ ({
    /** @param {string} file */
    registerEntry(file) {
      return `/assets/live/${path.basename(file)}`;
    },
  });
}

/**
 * @param {ReturnType<typeof rocketMarkdownPlugin>} plugin
 * @param {string} code
 * @param {string} id
 */
async function transformMarkdown(plugin, code, id) {
  const transform = plugin.transform;
  if (typeof transform !== 'function') {
    assert.fail('expected markdown plugin transform hook');
  }
  return await transform.call(/** @type {any} */ ({}), code, id);
}

/**
 * @param {unknown} result
 * @returns {asserts result is { code: string }}
 */
function assertTransformedCode(result) {
  assert.equal(typeof result, 'object');
  assert.notEqual(result, null);
  assert.equal(typeof (/** @type {{ code?: unknown }} */ (result).code), 'string');
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
