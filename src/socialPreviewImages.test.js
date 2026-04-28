import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  createSocialPreviewBrowserLaunchOptions,
  generateStaticDefaultSocialPreviewImages,
  resolveSocialPreviewBrowserExecutablePath,
} from './socialPreviewImages.js';

describe('Test socialPreviewImages', () => {
  it('01: uses serverless Chromium executable on Linux', async () => {
    let calls = 0;

    const executablePath = await resolveSocialPreviewBrowserExecutablePath({
      platform: 'linux',
      env: {},
      fileExists: () => false,
      async chromiumExecutablePath() {
        calls += 1;
        return '/tmp/chromium';
      },
    });

    assert.equal(executablePath, '/tmp/chromium');
    assert.equal(calls, 1);
  });

  it('02: uses local browser executable on macOS', async () => {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    const executablePath = await resolveSocialPreviewBrowserExecutablePath({
      platform: 'darwin',
      env: {},
      fileExists: candidate => candidate === chromePath,
      chromiumExecutablePath() {
        throw new Error('Should not use serverless Chromium locally');
      },
    });

    assert.equal(executablePath, chromePath);
  });

  it('03: accepts explicit Puppeteer executable path', async () => {
    const executablePath = await resolveSocialPreviewBrowserExecutablePath({
      platform: 'darwin',
      env: { PUPPETEER_EXECUTABLE_PATH: '/custom/chrome' },
      fileExists: () => false,
      chromiumExecutablePath() {
        throw new Error('Should not use serverless Chromium when an explicit path is configured');
      },
    });

    assert.equal(executablePath, '/custom/chrome');
  });

  it('04: uses local-safe browser launch arguments on macOS', async () => {
    const launchOptions = await createSocialPreviewBrowserLaunchOptions({
      platform: 'darwin',
      env: { PUPPETEER_EXECUTABLE_PATH: '/custom/chrome' },
      fileExists: () => false,
    });

    assert.deepEqual(launchOptions.args, ['--no-sandbox', '--disable-setuid-sandbox']);
  });

  it('05: renders custom Social Preview Template output with home Page facts', async () => {
    /** @type {import('./socialPreviewImages.js').SocialPreviewCaptureOptions[]} */
    const captures = [];
    const outputs = await generateStaticDefaultSocialPreviewImages({
      pages: new Map([
        ['/', makePage({ metadata: { title: 'Home', description: 'Welcome home.' } })],
      ]),
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
        socialPreview: {
          delivery: 'static',
          template({ site, page }) {
            return `<main style="display:grid"><h1>${page.title}</h1><p>${site.name}</p></main>`;
          },
        },
      },
      async captureSocialPreviewImage(options) {
        captures.push(options);
        return Buffer.from('png');
      },
    });

    assert.equal(outputs.size, 1);
    assert.equal(
      captures[0].html,
      '<main style="display:grid"><h1>Home</h1><p>Rocket Docs</p></main>',
    );
  });

  it('06: passes template data for home and non-home Pages', async () => {
    /** @type {import('@rocket/js/types.js').SocialPreviewTemplateData[]} */
    const received = [];

    await generateStaticDefaultSocialPreviewImages({
      pages: new Map([
        ['/', makePage({ path: '/', metadata: { title: 'Home', description: 'Welcome home.' } })],
        [
          '/guides/runtime',
          makePage({
            path: '/guides/runtime',
            metadata: { title: 'Runtime Guide', description: 'Learn runtime.' },
          }),
        ],
      ]),
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
        themeColor: '#123456',
        socialPreview: {
          delivery: 'static',
          template(data) {
            received.push(data);
            return '<main>Card</main>';
          },
        },
      },
      async captureSocialPreviewImage() {
        return Buffer.from('png');
      },
    });

    assert.deepEqual(received, [
      {
        site: {
          name: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          themeColor: '#123456',
        },
        page: {
          pathname: '/',
          title: 'Home',
          documentTitle: 'Rocket Docs',
          description: 'Welcome home.',
          canonicalUrl: 'https://docs.rocket.test/',
          language: 'en',
        },
      },
      {
        site: {
          name: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          themeColor: '#123456',
        },
        page: {
          pathname: '/guides/runtime',
          title: 'Runtime Guide',
          documentTitle: 'Runtime Guide | Rocket Docs',
          description: 'Learn runtime.',
          canonicalUrl: 'https://docs.rocket.test/guides/runtime',
          language: 'en',
        },
      },
    ]);
  });

  it('07: uses built-in Social Preview Template when no author template is configured', async () => {
    /** @type {import('./socialPreviewImages.js').SocialPreviewCaptureOptions[]} */
    const captures = [];

    await generateStaticDefaultSocialPreviewImages({
      pages: new Map([
        [
          '/guides/runtime',
          makePage({
            path: '/guides/runtime',
            metadata: { title: 'Runtime Guide', description: 'Learn runtime.' },
          }),
        ],
      ]),
      siteOrigin: 'https://docs.rocket.test',
      siteHeadMetadata: {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
        socialPreview: { delivery: 'static' },
      },
      async captureSocialPreviewImage(options) {
        captures.push(options);
        return Buffer.from('png');
      },
    });

    assert.match(captures[0].html, /<!doctype html>/);
    assert.match(captures[0].html, /Rocket Docs/);
    assert.match(captures[0].html, /<h1>Runtime Guide<\/h1>/);
    assert.doesNotMatch(captures[0].html, /<h1>Runtime Guide \| Rocket Docs<\/h1>/);
    assert.match(captures[0].html, /Learn runtime\./);
  });

  it('08: reuses unchanged Default Social Preview Images by fingerprint', async () => {
    const cacheDirectory = mkdtempSync(path.join(tmpdir(), 'rocket-social-preview-cache-'));
    try {
      /** @type {import('./socialPreviewImages.js').SocialPreviewCaptureOptions[]} */
      const captures = [];
      /** @type {import('@rocket/js/types.js').SiteHeadMetadataConfig} */
      const siteHeadMetadata = {
        siteName: 'Rocket Docs',
        defaultDescription: 'Rocket project documentation.',
        language: 'en',
        socialPreview: { delivery: 'static' },
      };

      const firstOutputs = await generateStaticDefaultSocialPreviewImages({
        pages: new Map([
          ['/', makePage({ metadata: { title: 'Home', description: 'Welcome home.' } })],
        ]),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata,
        cacheDirectory,
        async captureSocialPreviewImage(options) {
          captures.push(options);
          return Buffer.from('first-png');
        },
      });

      const firstOutput = firstOutputs.get('/');
      assert.ok(firstOutput);
      assert.equal(captures.length, 1);
      assert.match(firstOutput.publicPath, /^\/_rocket\/social-preview\/[a-f0-9]{64}\.png$/);

      const secondOutputs = await generateStaticDefaultSocialPreviewImages({
        pages: new Map([
          [
            '/',
            makePage({
              metadata: {
                title: 'Home',
                description: 'Welcome home.',
                body: 'Unrelated body copy',
              },
            }),
          ],
        ]),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata,
        cacheDirectory,
        async captureSocialPreviewImage() {
          throw new Error('Should reuse cached Social Preview Image');
        },
      });

      assert.equal(captures.length, 1);
      assert.deepEqual(secondOutputs.get('/'), firstOutput);

      const thirdOutputs = await generateStaticDefaultSocialPreviewImages({
        pages: new Map([
          ['/', makePage({ metadata: { title: 'Home', description: 'Changed description.' } })],
        ]),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata,
        cacheDirectory,
        async captureSocialPreviewImage(options) {
          captures.push(options);
          return Buffer.from('second-png');
        },
      });

      assert.equal(captures.length, 2);
      const thirdOutput = thirdOutputs.get('/');
      assert.ok(thirdOutput);
      assert.notEqual(thirdOutput.publicPath, firstOutput.publicPath);
    } finally {
      rmSync(cacheDirectory, { recursive: true, force: true });
    }
  });
});

/**
 * @param {{
 *   path?: string;
 *   metadata?: Record<string, unknown> & { title: string };
 *   config?: Record<string, unknown>;
 * }} [options]
 */
function makePage({ path = '/', metadata = { title: 'Home' }, config = {} } = {}) {
  return {
    file: 'docs/page.rocket.md',
    module: {
      config: {
        path,
        metadata: { title: metadata.title },
        ...config,
      },
    },
    metadata,
    demoNames: [],
  };
}
