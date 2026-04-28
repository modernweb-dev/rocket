import assert from 'node:assert/strict';
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { customElements } from '@lit-labs/ssr-dom-shim';
import { describe, it } from 'node:test';
import { html } from 'lit';
import { createIconAssetStore, finalizeRocketIcons } from '../icons.js';
import { RocketMenu } from '../menus/RocketMenu.js';
import { PageData } from '../PageData.js';
import { atlasDocLayout } from './atlas/atlasDocLayout.js';
import { atlasHeroLayout } from './atlas/atlasHeroLayout.js';
import { document } from './layout-helper.js';

defineSsrRocketMenu();

describe('Test document helper', () => {
  it('01: emits baseline metadata without Site Head Metadata config', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Default Page' }, '/default');
    pageData.content = html`<main>Default body</main>`;

    const body = await ssrRender(
      document(pageData, pageData.content, {
        menu: false,
      }),
    );

    assert.match(body, /<title>[\s\S]*Default Page[\s\S]*<\/title>/);
    assert.match(body, /<main>[\s\S]*Default body[\s\S]*<\/main>/);
    assert.match(body, /<meta charset="utf-8"[^>]*>/);
    assertHeadTag(
      body,
      'meta',
      'name',
      'viewport',
      'content',
      'width=device-width, initial-scale=1',
    );
  });

  it('02: emits one viewport tag for atlas document layout output', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Atlas Page' }, '/atlas');
    pageData.content = html`<p>Atlas body</p>`;

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));

    assert.match(body, /<meta charset="utf-8"[^>]*>/);
    assert.equal(
      countMatches(
        body,
        /<meta[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"[^>]*>/g,
      ),
      1,
    );
    assert.match(body, /Atlas body/);
    assert.doesNotMatch(body, /atlas-tip-card/);
  });

  it('03: emits one viewport tag for atlas hero layout output', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Hero Page' }, '/');
    pageData.content = html`<p>Hero body</p>`;

    const body = await ssrRender(atlasHeroLayout(pageData, makeAtlasHeroData()));

    assert.match(body, /<meta charset="utf-8"[^>]*>/);
    assert.equal(
      countMatches(
        body,
        /<meta[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"[^>]*>/g,
      ),
      1,
    );
    assert.match(body, /Build faster/);
  });

  it('04: uses Web Awesome copy buttons for atlas hero commands', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Hero Page' }, '/');
    const data = makeAtlasHeroData();
    data.heroMainData.installCommand = 'npm install @rocket/js';
    data.quickStartData = {
      title: 'Quick start',
      command: ['npm install @rocket/js', 'npm run build'],
    };

    const body = await ssrRender(atlasHeroLayout(pageData, data));

    assert.equal(countMatches(body, /<wa-copy-button\b/g), 2);
    assert.match(body, /copy-label="Copy install command"/);
    assert.match(body, /copy-label="Copy quick start commands"/);
    assert.doesNotMatch(body, /data-copy-command/);
  });

  it('05: renders atlas document header navigation links as direct children', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Atlas Page' }, '/atlas');
    pageData.content = html`<p>Atlas body</p>`;

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));
    const headerNav = body.match(
      /<nav class="atlas-header-links" aria-label="Primary navigation">[\s\S]*?<\/nav>/,
    )?.[0];

    assert.ok(headerNav);
    assert.doesNotMatch(headerNav, /<nav class="home-nav"/);
    assert.match(headerNav, /<a href="\/docs">[\s\S]*Docs[\s\S]*<\/a>/);
    assert.match(headerNav, /<a href="\/examples">[\s\S]*Examples[\s\S]*<\/a>/);
  });

  it('06: renders page-specific atlas document aside tips', async () => {
    const pageData = new PageData(
      makePageRegistry(),
      {
        title: 'Atlas Page',
        custom: {
          atlasDoc: {
            asideTip: {
              title: 'Loading tip',
              description: 'Start with server loading.',
              iconName: 'cpu',
            },
          },
        },
      },
      '/atlas',
    );

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));

    assert.match(body, /Loading tip/);
    assert.match(body, /Start with server loading\./);
    assert.match(body, /name="cpu"/);
  });

  it('07: hides atlas document aside tips when the page disables them', async () => {
    const pageData = new PageData(
      makePageRegistry(),
      {
        title: 'Atlas Page',
        custom: {
          atlasDoc: {
            asideTip: false,
          },
        },
      },
      '/atlas',
    );

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));

    assert.doesNotMatch(body, /atlas-tip-card/);
  });

  it('08: omits atlas previous-next wrapper when no adjacent pages exist', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Home' }, '/');
    pageData.content = html`<p>Home body</p>`;

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));

    assert.doesNotMatch(body, /id="prev-next"/);
    assert.doesNotMatch(body, /No previous page|No next page/);
  });

  it('09: renders only the available atlas next page card', async () => {
    const pageData = new PageData(makeAtlasNavPageRegistry(), { title: 'Home' }, '/');
    pageData.content = html`<p>Home body</p>`;

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));
    const prevNext = body.match(/<nav id="prev-next"[\s\S]*?<\/nav>/)?.[0];

    assert.ok(prevNext);
    assert.doesNotMatch(prevNext, /<rocket-previous-page/);
    assert.match(prevNext, /<rocket-next-page/);
    assert.doesNotMatch(prevNext, /No previous page|No next page/);
  });

  it('10: serializes atlas table of contents data for hydrated toc elements', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Atlas Page' }, '/atlas');
    pageData.content = html`<h2 id="intro">Intro</h2>`;
    pageData.toc = {
      children: [{ id: 'intro', text: 'Intro', level: 2, children: [] }],
    };

    const body = await ssrRender(atlasDocLayout(pageData, makeAtlasSiteData()));
    const tocElements = body.match(/<rocket-toc\b[^>]*>/g) ?? [];

    assert.equal(tocElements.length, 2);
    assert.ok(tocElements.every(element => / toc=/.test(element)));
    assert.ok(tocElements.every(element => /&quot;intro&quot;/.test(element)));
    assert.ok(tocElements.every(element => !/<!--lit-node/.test(element)));
  });

  it('11: server-renders Atlas static icons and keeps menu icon names author-owned', async () => {
    const pageData = new PageData(
      makeAtlasIconPageRegistry(),
      {
        title: 'Runtime',
        custom: {
          atlasDoc: {
            asideTip: {
              title: 'Icon tip',
              description: 'Server-rendered icons are visible in the first HTML response.',
              iconName: 'cpu',
            },
          },
        },
      },
      '/runtime',
    );
    pageData._hasBrowserLoadedComponents = true;
    pageData.content = html`
      <wa-callout>
        <rocket-icon slot="icon" name="info-circle"></rocket-icon>
        The callout icon is document-owned content.
      </wa-callout>
    `;
    const iconAssetStore = createIconAssetStore();

    const rendered = await ssrRender(atlasDocLayout(pageData, makeAtlasExternalSiteData()));
    const body = await finalizeRocketIcons(rendered, { pageData, iconAssetStore });

    assert.match(
      body,
      /<nav\b(?=[^>]*\bclass="atlas-navigation")(?=[^>]*\bicon-loading-region="atlas-navigation")(?=[^>]*\bicon-server-budget="35")/,
    );
    assert.doesNotMatch(body, /<wa-icon\b/);
    assert.doesNotMatch(body, /cdn\.jsdelivr\.net\/npm\/bootstrap-icons|registerIconLibrary/);

    const externalLinkIcon = assertServerRocketIcon(body, 'arrow-up-right');
    assert.match(externalLinkIcon, /\slibrary="bootstrap"/);

    const asideTipIcon = assertServerRocketIcon(body, 'cpu');
    assert.match(asideTipIcon, /\slibrary="bootstrap"/);

    const menuIcon = assertServerRocketIcon(body, 'house');
    assert.doesNotMatch(menuIcon, /\slibrary=/);
    assert.match(menuIcon, /\bclass="nav-icon"/);

    const calloutIcon = assertServerRocketIcon(body, 'info-circle');
    assert.doesNotMatch(calloutIcon, /\slibrary=/);
    assert.match(calloutIcon, /\bslot="icon"/);

    const manifest = readIconManifest(body);
    assert.equal(manifest.defaultLibrary, 'bootstrap');
    assert.deepEqual(Object.keys(manifest.icons).sort(), [
      'bootstrap:arrow-up-right',
      'bootstrap:cpu',
      'bootstrap:house',
      'bootstrap:info-circle',
    ]);
    assert.equal(iconAssetStore.outputs().length, 4);
  });

  it('12: server-renders Atlas hero layout icons through rocket-icon', async () => {
    const pageData = new PageData(makePageRegistry(), { title: 'Hero Page' }, '/');
    pageData._hasBrowserLoadedComponents = true;
    const data = makeAtlasHeroData();
    data.heroMainData.installCommand = 'npm install @rocket/js';
    data.whyRocketData = [
      {
        icon: 'file-earmark-text',
        tone: 'red',
        title: 'Plain source files',
        description: 'Write Markdown pages with JavaScript layouts.',
      },
      {
        icon: 'lightning-charge',
        tone: 'amber',
        title: 'Flexible loading',
        description: 'Choose component loading per component.',
      },
      {
        icon: 'book-half',
        tone: 'blue',
        title: 'Component docs',
        description: 'Document web-standard components.',
      },
    ];
    data.workflowData = {
      title: 'Workflow',
      steps: [
        { icon: 'file-earmark-text', title: 'Create content' },
        { icon: 'code-slash', title: 'Use JavaScript' },
        { icon: 'terminal', title: 'Run build' },
        { icon: 'folder', title: 'Deploy dist' },
      ],
    };
    const iconAssetStore = createIconAssetStore();

    const rendered = await ssrRender(atlasHeroLayout(pageData, data));
    const body = await finalizeRocketIcons(rendered, { pageData, iconAssetStore });

    assert.doesNotMatch(body, /<svg\b[^>]*\bclass="icon(?:-large)?"/);
    assert.match(assertServerRocketIcon(body, 'arrow-right'), /\bclass="icon"/);
    assertServerRocketIcon(body, 'book');
    assert.match(assertServerRocketIcon(body, 'file-earmark-text'), /\bclass="icon-large"/);
    assertServerRocketIcon(body, 'lightning-charge');
    assertServerRocketIcon(body, 'book-half');
    assertServerRocketIcon(body, 'code-slash');
    assertServerRocketIcon(body, 'terminal');
    assertServerRocketIcon(body, 'folder');
    assertServerRocketIcon(body, 'copy');
    assertServerRocketIcon(body, 'check-lg');
    assertServerRocketIcon(body, 'x-square');

    const manifest = readIconManifest(body);
    assert.equal(manifest.defaultLibrary, 'bootstrap');
    assert.deepEqual(Object.keys(manifest.icons).sort(), [
      'bootstrap:arrow-right',
      'bootstrap:book',
      'bootstrap:book-half',
      'bootstrap:check-lg',
      'bootstrap:code-slash',
      'bootstrap:copy',
      'bootstrap:file-earmark-text',
      'bootstrap:folder',
      'bootstrap:lightning-charge',
      'bootstrap:terminal',
      'bootstrap:x-square',
    ]);
    assert.equal(iconAssetStore.outputs().length, 11);
  });

  it('13: applies custom Atlas navigation icon server budgets', async () => {
    const pageData = new PageData(
      makeAtlasMultiIconPageRegistry(),
      { title: 'Runtime' },
      '/runtime',
    );
    pageData._hasBrowserLoadedComponents = true;
    const iconAssetStore = createIconAssetStore();

    const rendered = await ssrRender(
      atlasDocLayout(pageData, {
        ...makeAtlasSiteData(),
        navigationIconServerBudget: 1,
      }),
    );
    const body = await finalizeRocketIcons(rendered, { pageData, iconAssetStore });

    assert.match(
      body,
      /<nav\b(?=[^>]*\bclass="atlas-navigation")(?=[^>]*\bicon-loading-region="atlas-navigation")(?=[^>]*\bicon-server-budget="1")/,
    );
    assertServerRocketIcon(body, 'house');
    assertClientRocketIcon(body, 'gear');

    const manifest = readIconManifest(body);
    assert.deepEqual(Object.keys(manifest.icons).sort(), ['bootstrap:gear', 'bootstrap:house']);
    assert.equal(iconAssetStore.outputs().length, 2);
  });
});

/**
 * @param {unknown} template
 */
async function ssrRender(template) {
  return collectResult(render(template));
}

/**
 * @returns {import('@rocket/js/types.js').PageRegistry}
 */
function makePageRegistry() {
  return new Map([
    [
      '/',
      {
        file: 'docs/pages/home.rocket.md',
        module: { config: { path: '/', metadata: { title: 'Home' } } },
        metadata: { title: 'Home', linkText: 'Home' },
        demoNames: [],
      },
    ],
  ]);
}

/**
 * @returns {import('@rocket/js/types.js').PageRegistry}
 */
function makeAtlasNavPageRegistry() {
  return new Map([
    [
      '/',
      {
        file: 'docs/pages/home.rocket.md',
        module: { config: { path: '/', metadata: { title: 'Home' }, menu: false } },
        metadata: { title: 'Home', linkText: 'Home' },
        demoNames: [],
      },
    ],
    [
      '/guides',
      {
        file: 'docs/pages/guides.rocket.md',
        module: {
          config: {
            path: '/guides',
            metadata: { title: 'Guides' },
            menu: { noLink: true, order: 10 },
          },
        },
        metadata: { title: 'Guides', linkText: 'Guides' },
        demoNames: [],
      },
    ],
    [
      '/guides/runtime',
      {
        file: 'docs/pages/guides/runtime.rocket.md',
        module: {
          config: {
            path: '/guides/runtime',
            metadata: { title: 'Runtime' },
            menu: { parent: '/guides', order: 10 },
          },
        },
        metadata: { title: 'Runtime', linkText: 'Runtime' },
        demoNames: [],
      },
    ],
  ]);
}

/**
 * @returns {import('@rocket/js/types.js').PageRegistry}
 */
function makeAtlasIconPageRegistry() {
  return new Map([
    [
      '/',
      {
        file: 'docs/pages/home.rocket.md',
        module: { config: { path: '/', metadata: { title: 'Home' }, menu: false } },
        metadata: { title: 'Home', linkText: 'Home' },
        demoNames: [],
      },
    ],
    [
      '/runtime',
      {
        file: 'docs/pages/runtime.rocket.md',
        module: {
          config: {
            path: '/runtime',
            metadata: { title: 'Runtime' },
            menu: { iconName: 'house', order: 10 },
          },
        },
        metadata: { title: 'Runtime', linkText: 'Runtime' },
        demoNames: [],
      },
    ],
  ]);
}

/**
 * @returns {import('@rocket/js/types.js').PageRegistry}
 */
function makeAtlasMultiIconPageRegistry() {
  return new Map([
    [
      '/',
      {
        file: 'docs/pages/home.rocket.md',
        module: { config: { path: '/', metadata: { title: 'Home' }, menu: false } },
        metadata: { title: 'Home', linkText: 'Home' },
        demoNames: [],
      },
    ],
    [
      '/runtime',
      {
        file: 'docs/pages/runtime.rocket.md',
        module: {
          config: {
            path: '/runtime',
            metadata: { title: 'Runtime' },
            menu: { iconName: 'house', order: 10 },
          },
        },
        metadata: { title: 'Runtime', linkText: 'Runtime' },
        demoNames: [],
      },
    ],
    [
      '/settings',
      {
        file: 'docs/pages/settings.rocket.md',
        module: {
          config: {
            path: '/settings',
            metadata: { title: 'Settings' },
            menu: { iconName: 'gear', order: 20 },
          },
        },
        metadata: { title: 'Settings', linkText: 'Settings' },
        demoNames: [],
      },
    ],
  ]);
}

function makeAtlasSiteData() {
  return {
    headerData: {
      logo: ['/assets/logo.svg'],
      homeLink: '/',
      socials: [],
      navLinks: [
        { text: 'Docs', href: '/docs' },
        { text: 'Examples', href: '/examples' },
      ],
    },
    footerData: [],
  };
}

function makeAtlasExternalSiteData() {
  return {
    ...makeAtlasSiteData(),
    headerData: {
      ...makeAtlasSiteData().headerData,
      navLinks: [{ text: 'External docs', href: 'https://example.com/docs' }],
    },
  };
}

/**
 * @returns {import('@rocket/js/types.js').HeroData}
 */
function makeAtlasHeroData() {
  return {
    headerData: {
      logo: ['/assets/logo.svg'],
      homeLink: '/',
      socials: [],
      navLinks: [],
    },
    heroMainData: {
      sloganTop: 'Build faster',
      sloganBottom: 'Ship docs',
      logoWithText: '/assets/logo-text.svg',
      logoNoText: '/assets/logo.svg',
      setupLink: '/setup',
      documentationLink: '/docs',
    },
    featuresData: [],
    footerData: [],
  };
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 */
function countMatches(value, pattern) {
  return value.match(pattern)?.length ?? 0;
}

function defineSsrRocketMenu() {
  if (!customElements.get('rocket-menu')) {
    customElements.define('rocket-menu', RocketMenu);
  }
}

/**
 * @param {string} body
 * @param {string} name
 */
function assertServerRocketIcon(body, name) {
  const host = iconHostHtml(body, name);
  assert.match(host, /<template shadowrootmode="open">/);
  assert.match(host, /<span part="icon"><svg[^>]*fill="currentColor"[^>]*>/);
  assert.doesNotMatch(host, /<span part="icon"><\/span>/);
  return host;
}

/**
 * @param {string} body
 * @param {string} name
 */
function assertClientRocketIcon(body, name) {
  const host = iconHostHtml(body, name);
  assert.match(host, /<template shadowrootmode="open">/);
  assert.match(host, /<span part="icon"><\/span>/);
  assert.doesNotMatch(host, /<span part="icon"><svg[\s>]/);
  return host;
}

/**
 * @param {string} body
 * @param {string} name
 */
function iconHostHtml(body, name) {
  const match = body.match(
    new RegExp(`<rocket-icon\\b(?=[^>]*\\bname="${escapeRegExp(name)}")[\\s\\S]*?<\\/rocket-icon>`),
  );
  assert.ok(match, `Expected rocket-icon ${name}`);
  return match[0];
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
