import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { register } from 'node:module';
import { describe, it } from 'node:test';
import { MessageChannel } from 'node:worker_threads';
import { getPages } from './pages.js';

let markdownHookRegistered = false;

describe('Test pages', () => {
  it('01: exposes owned Standalone Demo names without components export', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/demos.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/demos" };',
        '```',
        '',
        '# Demos',
        '',
        '```js demo',
        'export const simpleButton = () => "simple";',
        '```',
        '',
        '```js demo',
        'export function iconButton() {',
        '  return "icon";',
        '}',
        '```',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.md'], []);

      assert.deepEqual(pages.get('/demos')?.demoNames, ['simpleButton', 'iconButton']);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('02: fails when an authored custom element has no components export', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        '```',
        '',
        '# Card',
        '',
        '<demo-card></demo-card>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.md'], []),
        /Markdown Page docs\/card\.rocket\.md uses unregistered custom element tag demo-card/,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('03: fails when an authored custom element is missing from components', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        'export const components = {',
        '  "other-card": { file: "./other-card.js", className: "OtherCard", loading: "client" },',
        '};',
        '```',
        '',
        '# Card',
        '',
        '<demo-card></demo-card>',
        '<demo-panel></demo-panel>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.md'], []),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Markdown Page docs\/card\.rocket\.md/);
          assert.match(error.message, /demo-card/);
          assert.match(error.message, /demo-panel/);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('04: accepts authored custom elements registered by the Page', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        'export const components = {',
        '  "demo-card": { file: "./demo-card.js", className: "DemoCard", loading: "client" },',
        '};',
        '```',
        '',
        '# Card',
        '',
        '<demo-card></demo-card>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.md'], []);

      assert.equal(pages.get('/card')?.file, 'docs/card.rocket.md');
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('05: accepts authored custom elements defined by Page client code', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        '```',
        '',
        '# Card',
        '',
        '```js client',
        'class DemoCard extends HTMLElement {}',
        'customElements.define("demo-card", DemoCard);',
        '```',
        '',
        '<demo-card></demo-card>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.md'], []);

      assert.equal(pages.get('/card')?.file, 'docs/card.rocket.md');
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('06: accepts Rocket-owned rocket-icon elements without Page ownership', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/icons.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/icons" };',
        '```',
        '',
        '# Icons',
        '',
        '<rocket-icon name="alarm"></rocket-icon>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.md'], []);

      assert.equal(pages.get('/icons')?.file, 'docs/icons.rocket.md');
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('07: rejects authored custom elements with computed Page-local names', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        '```',
        '',
        '# Card',
        '',
        '```js client',
        'const tagName = "demo-card";',
        'class DemoCard extends HTMLElement {}',
        'customElements.define(tagName, DemoCard);',
        '```',
        '',
        '<demo-card></demo-card>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.md'], []),
        /Markdown Page docs\/card\.rocket\.md uses unregistered custom element tag demo-card/,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('08: rejects authored custom elements defined only by demos', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        '```',
        '',
        '# Card',
        '',
        '```js demo',
        'class DemoCard extends HTMLElement {}',
        'customElements.define("demo-card", DemoCard);',
        'export const card = () => "demo";',
        '```',
        '',
        '<demo-card></demo-card>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.md'], []),
        /Markdown Page docs\/card\.rocket\.md uses unregistered custom element tag demo-card/,
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('09: rejects authored custom elements with competing owners', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/card.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/card" };',
        'export const components = {',
        '  "demo-card": { file: "./demo-card.js", className: "DemoCard", loading: "client" },',
        '};',
        '```',
        '',
        '# Card',
        '',
        '```js client',
        'class DemoCard extends HTMLElement {}',
        'customElements.define("demo-card", DemoCard);',
        '```',
        '',
        '<demo-card></demo-card>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.md'], []),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Markdown Page docs\/card\.rocket\.md/);
          assert.match(error.message, /demo-card/);
          assert.match(error.message, /Registered Components and Page-local Custom Elements/);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('10: exempts generated Request Demo frames while rejecting manual Request Demo elements', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/generated-request-demo.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/generated-request-demo" };',
        '```',
        '',
        '# Generated Request Demo',
        '',
        '```js request-demo url="/api/example.json"',
        'export default () => ({ ok: true });',
        '```',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/manual-request-demo.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/manual-request-demo" };',
        '```',
        '',
        '# Manual Request Demo',
        '',
        '<rocket-request-demo url="/api/example.json"></rocket-request-demo>',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.md'], []),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Markdown Page docs\/manual-request-demo\.rocket\.md/);
          assert.match(error.message, /rocket-request-demo/);
          return true;
        },
      );

      const pages = await getPages(projectRoot, ['docs/generated-request-demo.rocket.md'], []);

      assert.equal(
        pages.get('/generated-request-demo')?.file,
        'docs/generated-request-demo.rocket.md',
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('11: exposes Markdown Page Metadata from author config and menu link text', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/button.rocket.md'),
      [
        '```js server',
        'export const config = {',
        '  path: "/button",',
        '  metadata: { title: "Configured Button" },',
        '  menu: { linkText: "Button nav" },',
        '};',
        '```',
        '',
        '# Heading Button',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.md'], []);

      assert.deepEqual(pages.get('/button')?.metadata, {
        title: 'Configured Button',
        linkText: 'Button nav',
      });
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('12: resolves Markdown Page Metadata titles through headings, menu link text, and paths', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/heading.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/heading" };',
        '```',
        '',
        '# Heading Title',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/heading-link.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/heading-link" };',
        '```',
        '',
        '<h1 link-text="Heading nav">Heading Link Title</h1>',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/menu-only.rocket.md'),
      [
        '```js server',
        'export const config = { path: "/menu-only", menu: { linkText: "Menu Only" } };',
        '```',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/fallback.rocket.md'),
      ['```js server', 'export const config = { path: "/fallback" };', '```', ''].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.md'], []);

      assert.deepEqual(pages.get('/heading')?.metadata, { title: 'Heading Title' });
      assert.deepEqual(pages.get('/heading-link')?.metadata, {
        title: 'Heading Link Title',
        linkText: 'Heading nav',
      });
      assert.deepEqual(pages.get('/menu-only')?.metadata, {
        title: 'Menu Only',
        linkText: 'Menu Only',
      });
      assert.deepEqual(pages.get('/fallback')?.metadata, { title: 'Fallback' });
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('13: resolves JavaScript Page Metadata from author config, menu link text, and paths', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/configured.rocket.js'),
      [
        'export const config = {',
        '  path: "/configured",',
        '  metadata: { title: "Configured JS" },',
        '  menu: { linkText: "Configured nav" },',
        '};',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/menu-only.rocket.js'),
      ['export const config = { path: "/menu-only", menu: { linkText: "Menu JS" } };', ''].join(
        '\n',
      ),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/fallback.rocket.js'),
      ['export const config = { path: "/fallback" };', ''].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.js'], []);

      assert.deepEqual(pages.get('/configured')?.metadata, {
        title: 'Configured JS',
        linkText: 'Configured nav',
      });
      assert.deepEqual(pages.get('/menu-only')?.metadata, {
        title: 'Menu JS',
        linkText: 'Menu JS',
      });
      assert.deepEqual(pages.get('/fallback')?.metadata, { title: 'Fallback' });
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('14: normalizes descriptive and custom Page Metadata from author config', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();
    registerMarkdownHook();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/metadata.rocket.md'),
      [
        '```js server',
        'export const config = {',
        '  path: "/metadata",',
        '  metadata: {',
        '    title: "Metadata",',
        '    description: "Describes the metadata page.",',
        '    date: "2026-05-24",',
        '    updated: "2026-05-25",',
        '    tags: [" docs ", "release", "docs"],',
        '    authors: [" Ada Lovelace ", "Grace Hopper", "Ada Lovelace"],',
        '    custom: {',
        '      title: "Custom title is project data",',
        '      rating: 5,',
        '      flags: ["featured", "internal"],',
        '      details: { owner: "docs" },',
        '    },',
        '  },',
        '};',
        '```',
        '',
        '# Heading Metadata',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/status.rocket.js'),
      [
        'export const config = {',
        '  path: "/status",',
        '  metadata: {',
        '    title: "Status",',
        '    description: "Status page.",',
        '    date: "2026-05-24",',
        '    updated: "2026-05-25",',
        '    tags: [" api ", "api"],',
        '    authors: [" Rocket Team ", "Rocket Team"],',
        '    custom: { releaseStage: "preview" },',
        '  },',
        '};',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.{md,js}'], []);

      assert.deepEqual(pages.get('/metadata')?.metadata, {
        title: 'Metadata',
        description: 'Describes the metadata page.',
        date: '2026-05-24',
        updated: '2026-05-25',
        tags: ['docs', 'release'],
        authors: ['Ada Lovelace', 'Grace Hopper'],
        custom: {
          title: 'Custom title is project data',
          rating: 5,
          flags: ['featured', 'internal'],
          details: { owner: 'docs' },
        },
      });
      assert.deepEqual(pages.get('/status')?.metadata, {
        title: 'Status',
        description: 'Status page.',
        date: '2026-05-24',
        updated: '2026-05-25',
        tags: ['api'],
        authors: ['Rocket Team'],
        custom: { releaseStage: 'preview' },
      });
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('15: fails Page discovery for invalid known Page Metadata fields', async () => {
    const cases = [
      ['title-number', '{ title: 42 }', 'metadata.title'],
      ['description-number', '{ description: 42 }', 'metadata.description'],
      ['date-calendar', '{ date: "2026-02-30" }', 'metadata.date'],
      ['updated-datetime', '{ updated: "2026-05-24T12:00:00Z" }', 'metadata.updated'],
      ['tags-string', '{ tags: "docs" }', 'metadata.tags'],
      ['tags-item', '{ tags: ["docs", 42] }', 'metadata.tags'],
      ['authors-item', '{ authors: ["Ada", null] }', 'metadata.authors'],
      ['custom-function', '{ custom: () => ({ internal: true }) }', 'metadata.custom'],
    ];

    for (const [name, metadataSource, field] of cases) {
      const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
      const originalCwd = process.cwd();

      mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
      writeFileSync(
        path.join(projectRoot, `docs/${name}.rocket.js`),
        [
          'export const config = {',
          `  path: "/${name}",`,
          `  metadata: ${metadataSource},`,
          '};',
          '',
        ].join('\n'),
      );

      process.chdir(projectRoot);
      try {
        await assert.rejects(
          () => getPages(projectRoot, ['docs/**/*.rocket.js'], []),
          error => {
            if (!(error instanceof Error)) {
              return false;
            }
            assert.match(error.message, /Invalid Page Metadata/);
            assert.match(error.message, new RegExp(`docs/${name}\\.rocket\\.js`));
            assert.match(error.message, new RegExp(field));
            return true;
          },
        );
      } finally {
        process.chdir(originalCwd);
        rmSync(projectRoot, { recursive: true, force: true });
      }
    }
  });

  it('16: rejects unknown root Page Metadata fields while preserving custom keys', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/unknown-root.rocket.js'),
      [
        'export const config = {',
        '  path: "/unknown-root",',
        '  metadata: { summary: "Unsupported root field" },',
        '};',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      await assert.rejects(
        () => getPages(projectRoot, ['docs/**/*.rocket.js'], []),
        error => {
          if (!(error instanceof Error)) {
            return false;
          }
          assert.match(error.message, /Invalid Page Metadata/);
          assert.match(error.message, /docs\/unknown-root\.rocket\.js/);
          assert.match(error.message, /metadata.summary/);
          assert.match(error.message, /known Page Metadata field/);
          return true;
        },
      );
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }

    const customProjectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    mkdirSync(path.join(customProjectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(customProjectRoot, 'docs/custom.rocket.js'),
      [
        'export const config = {',
        '  path: "/custom",',
        '  metadata: {',
        '    title: "Custom",',
        '    custom: { summary: "Project field", date: "release candidate" },',
        '  },',
        '};',
        '',
      ].join('\n'),
    );

    process.chdir(customProjectRoot);
    try {
      const pages = await getPages(customProjectRoot, ['docs/**/*.rocket.js'], []);

      assert.deepEqual(pages.get('/custom')?.metadata, {
        title: 'Custom',
        custom: { summary: 'Project field', date: 'release candidate' },
      });
    } finally {
      process.chdir(originalCwd);
      rmSync(customProjectRoot, { recursive: true, force: true });
    }
  });

  it('17: validates Page-level Site Head Metadata indexing options', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/public.rocket.js'),
      [
        'export const config = {',
        '  path: "/public",',
        '  siteHeadMetadata: { indexing: "index" },',
        '};',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/draft.rocket.js'),
      [
        'export const config = {',
        '  path: "/draft",',
        '  siteHeadMetadata: { indexing: "noindex" },',
        '};',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.js'], []);

      assert.deepEqual(pages.get('/public')?.module.config.siteHeadMetadata, {
        indexing: 'index',
      });
      assert.deepEqual(pages.get('/draft')?.module.config.siteHeadMetadata, {
        indexing: 'noindex',
      });
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }

    /** @type {[string, string, RegExp][]} */
    const cases = [
      [
        'non-object',
        'siteHeadMetadata: true',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata must be an object/s,
      ],
      [
        'unknown-field',
        'siteHeadMetadata: { preview: false }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.preview.*known Site Head Metadata Page Option/s,
      ],
      [
        'invalid-indexing',
        'siteHeadMetadata: { indexing: "follow" }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.indexing.*index.*noindex/s,
      ],
    ];

    for (const [name, siteHeadMetadataSource, message] of cases) {
      const invalidProjectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));

      mkdirSync(path.join(invalidProjectRoot, 'docs'), { recursive: true });
      writeFileSync(
        path.join(invalidProjectRoot, `docs/${name}.rocket.js`),
        [
          'export const config = {',
          `  path: "/${name}",`,
          `  ${siteHeadMetadataSource},`,
          '};',
          '',
        ].join('\n'),
      );

      process.chdir(invalidProjectRoot);
      try {
        await assert.rejects(
          () => getPages(invalidProjectRoot, ['docs/**/*.rocket.js'], []),
          message,
        );
      } finally {
        process.chdir(originalCwd);
        rmSync(invalidProjectRoot, { recursive: true, force: true });
      }
    }
  });

  it('18: validates Page-level Social Preview Image options', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/page-relative.rocket.js'),
      [
        'export const config = {',
        '  path: "/page-relative",',
        '  siteHeadMetadata: { socialPreview: { image: "social/card.png" } },',
        '};',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/site-root.rocket.js'),
      [
        'export const config = {',
        '  path: "/site-root",',
        '  siteHeadMetadata: { socialPreview: { image: "/social/card.png" } },',
        '};',
        '',
      ].join('\n'),
    );
    writeFileSync(
      path.join(projectRoot, 'docs/absolute.rocket.js'),
      [
        'export const config = {',
        '  path: "/absolute",',
        '  siteHeadMetadata: { socialPreview: { image: "https://cdn.rocket.test/card.png" } },',
        '};',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.js'], []);

      assert.deepEqual(pages.get('/page-relative')?.module.config.siteHeadMetadata, {
        socialPreview: { image: 'social/card.png' },
      });
      assert.deepEqual(pages.get('/site-root')?.module.config.siteHeadMetadata, {
        socialPreview: { image: '/social/card.png' },
      });
      assert.deepEqual(pages.get('/absolute')?.module.config.siteHeadMetadata, {
        socialPreview: { image: 'https://cdn.rocket.test/card.png' },
      });
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }

    /** @type {[string, string, RegExp][]} */
    const cases = [
      [
        'non-object-social-preview',
        'siteHeadMetadata: { socialPreview: true }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.socialPreview must be an object/s,
      ],
      [
        'unknown-social-preview-field',
        'siteHeadMetadata: { socialPreview: { template: "card" } }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.socialPreview\.template.*known Social Preview field/s,
      ],
      [
        'non-string-image',
        'siteHeadMetadata: { socialPreview: { image: true } }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.socialPreview\.image must be a string/s,
      ],
      [
        'empty-image',
        'siteHeadMetadata: { socialPreview: { image: " " } }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.socialPreview\.image must be a non-empty string/s,
      ],
      [
        'unsupported-image-url',
        'siteHeadMetadata: { socialPreview: { image: "ftp://cdn.rocket.test/card.png" } }',
        /Invalid Page-level Site Head Metadata.*siteHeadMetadata\.socialPreview\.image.*Page-relative.*site-root.*http.*https/s,
      ],
    ];

    for (const [name, siteHeadMetadataSource, message] of cases) {
      const invalidProjectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));

      mkdirSync(path.join(invalidProjectRoot, 'docs'), { recursive: true });
      writeFileSync(
        path.join(invalidProjectRoot, `docs/${name}.rocket.js`),
        [
          'export const config = {',
          `  path: "/${name}",`,
          `  ${siteHeadMetadataSource},`,
          '};',
          '',
        ].join('\n'),
      );

      process.chdir(invalidProjectRoot);
      try {
        await assert.rejects(
          () => getPages(invalidProjectRoot, ['docs/**/*.rocket.js'], []),
          message,
        );
      } finally {
        process.chdir(originalCwd);
        rmSync(invalidProjectRoot, { recursive: true, force: true });
      }
    }
  });

  it('19: validates Page Icon References', async () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));
    const originalCwd = process.cwd();

    mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'docs/icons.rocket.js'),
      [
        'export const config = {',
        '  path: "/icons",',
        '  iconReferences: [',
        '    { library: "bootstrap", name: "plus-square" },',
        '    { library: "bootstrap", name: "plus-square" },',
        '    { name: "dash-square" },',
        '  ],',
        '};',
        '',
      ].join('\n'),
    );

    process.chdir(projectRoot);
    try {
      const pages = await getPages(projectRoot, ['docs/**/*.rocket.js'], []);

      assert.deepEqual(pages.get('/icons')?.module.config.iconReferences, [
        { library: 'bootstrap', name: 'plus-square' },
        { name: 'dash-square' },
      ]);
    } finally {
      process.chdir(originalCwd);
      rmSync(projectRoot, { recursive: true, force: true });
    }

    /** @type {[string, string, RegExp][]} */
    const cases = [
      [
        'non-array',
        'iconReferences: true',
        /Invalid Page Icon References.*config\.iconReferences: must be an array/s,
      ],
      [
        'non-object-reference',
        'iconReferences: [true]',
        /Invalid Page Icon References.*config\.iconReferences\[0\]: must be an object/s,
      ],
      [
        'unknown-reference-field',
        'iconReferences: [{ icon: "plus-square", name: "plus-square" }]',
        /Invalid Page Icon References.*config\.iconReferences\[0\]\.icon.*known Icon Reference field/s,
      ],
      [
        'empty-reference-name',
        'iconReferences: [{ name: " " }]',
        /Page Icon References.*config\.iconReferences\[0\]\.name must be a non-empty string/s,
      ],
      [
        'empty-reference-library',
        'iconReferences: [{ library: " ", name: "plus-square" }]',
        /Page Icon References.*config\.iconReferences\[0\]\.library must be a non-empty string/s,
      ],
    ];

    for (const [name, iconReferencesSource, message] of cases) {
      const invalidProjectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-pages-'));

      mkdirSync(path.join(invalidProjectRoot, 'docs'), { recursive: true });
      writeFileSync(
        path.join(invalidProjectRoot, `docs/${name}.rocket.js`),
        [
          'export const config = {',
          `  path: "/${name}",`,
          `  ${iconReferencesSource},`,
          '};',
          '',
        ].join('\n'),
      );

      process.chdir(invalidProjectRoot);
      try {
        await assert.rejects(
          () => getPages(invalidProjectRoot, ['docs/**/*.rocket.js'], []),
          message,
        );
      } finally {
        process.chdir(originalCwd);
        rmSync(invalidProjectRoot, { recursive: true, force: true });
      }
    }
  });
});

function registerMarkdownHook() {
  if (markdownHookRegistered) {
    return;
  }

  const { port1, port2 } = new MessageChannel();
  port2.on('message', message => port2.postMessage(message));
  port2.unref();
  register('./markdownHook.js', {
    parentURL: import.meta.url,
    data: { port: port1 },
    transferList: [port1],
  });
  markdownHookRegistered = true;
}
