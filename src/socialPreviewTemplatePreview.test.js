import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { serveSocialPreviewTemplatePreview } from './socialPreviewTemplatePreview.js';

describe('Test socialPreviewTemplatePreview', () => {
  it('01: applies title and description query overrides to the selected Page preview', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/template?page=%2Fguides%2Fruntime&title=Long%20Sample%20Title&description=Long%20sample%20description.',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {
            template({ page }) {
              return `<main><h1>${page.title}</h1><p>${page.description}</p><a>${page.canonicalUrl}</a></main>`;
            },
          },
        },
      },
    );

    assert.ok(response);
    assert.equal(response.status, 200);
    assert.equal(
      await response.text(),
      '<main><h1>Long Sample Title</h1><p>Long sample description.</p><a>https://docs.rocket.test/guides/runtime</a></main>',
    );
  });

  it('02: exposes captured image output for the same selected Page preview', async () => {
    /** @type {import('./socialPreviewImages.js').SocialPreviewCaptureOptions[]} */
    const captures = [];
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/image.png?page=%2Fguides%2Fruntime&title=Image%20Title&description=Image%20description.',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {
            template({ page }) {
              return `<main><h1>${page.title}</h1><p>${page.description}</p></main>`;
            },
          },
        },
        async captureSocialPreviewImage(options) {
          captures.push(options);
          return Buffer.from('captured-png');
        },
      },
    );

    assert.ok(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.equal(Buffer.from(await response.arrayBuffer()).toString('utf8'), 'captured-png');
    assert.deepEqual(captures, [
      {
        html: '<main><h1>Image Title</h1><p>Image description.</p></main>',
        width: 1200,
        height: 630,
        pathname: '/guides/runtime',
      },
    ]);
  });

  it('03: targets a selected Page from a full URL query value', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/template?url=https%3A%2F%2Fdocs.rocket.test%2Fguides%2Fruntime',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {
            template({ page }) {
              return `<main data-page="${page.pathname}">${page.title}</main>`;
            },
          },
        },
      },
    );

    assert.ok(response);
    assert.equal(await response.text(), '<main data-page="/guides/runtime">Runtime Guide</main>');
  });

  it('04: renders a preview workflow page with Page selection and capture viewport links', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request('https://rocket.test/_rocket/social-preview-template-preview/'),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {},
        },
      },
    );

    assert.ok(response);
    const body = await response.text();
    assert.match(
      body,
      /import \{ SocialPreviewPlayground \} from '\/_rocket\/social-preview-template-preview\/SocialPreviewPlayground\.js';/,
    );
    assert.match(body, /customElements\.define\('rocket-social-preview-playground'/);
    assert.match(body, /<rocket-social-preview-playground/);
    assert.match(body, /show-pages/);
    assert.match(body, /show-download/);
    assert.match(body, /sync-history/);
    assert.match(body, /controls-position="left"/);
    assert.match(body, /selected-path="\/guides\/runtime"/);
    assert.match(body, /preview-title="Runtime Guide"/);
    assert.match(body, /preview-description="Learn runtime rendering\."/);
    assert.match(body, /template-url="\/_rocket\/social-preview-template-preview\/template"/);
    assert.match(body, /image-url="\/_rocket\/social-preview-template-preview\/image\.png"/);
    assert.match(body, /workflow-url="\/_rocket\/social-preview-template-preview\/"/);
    assert.match(
      body,
      /"path":"\/guides\/runtime","title":"Runtime Guide","description":"Learn runtime rendering\.","downloadFilename":"social-preview-guides-runtime\.png"/,
    );
    assert.match(body, /data-social-preview-pages>/);
    assert.doesNotMatch(body, /type="submit">Preview/);
  });

  it('05: fills workflow title and description from the selected Page', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/?page=%2Fguides%2Fassets',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {},
        },
      },
    );

    assert.ok(response);
    const body = await response.text();
    assert.match(body, /selected-path="\/guides\/assets"/);
    assert.match(body, /preview-title="Asset Guide"/);
    assert.match(body, /preview-description="Manage public assets\."/);
    assert.match(
      body,
      /"path":"\/guides\/assets","title":"Asset Guide","description":"Manage public assets\.","downloadFilename":"social-preview-guides-assets\.png"/,
    );
    assert.doesNotMatch(body, /<input name="title"/);
    assert.doesNotMatch(body, /<textarea name="description"/);
  });

  it('06: serves the shared Social Preview playground browser modules', async () => {
    const componentResponse = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/SocialPreviewPlayground.js',
      ),
      { pages: makePages() },
    );
    const templateResponse = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/defaultSocialPreviewTemplate.js',
      ),
      { pages: makePages() },
    );

    assert.ok(componentResponse);
    assert.equal(componentResponse.headers.get('content-type'), 'text/javascript; charset=utf-8');
    const componentSource = await componentResponse.text();
    assert.match(componentSource, /export class SocialPreviewPlayground extends HTMLElement/);
    assert.match(componentSource, /data-social-preview-page-select/);
    assert.match(componentSource, /data-social-preview-title-input/);
    assert.match(componentSource, /data-social-preview-png-link/);
    assert.match(componentSource, /window\.history\.replaceState/);
    assert.match(componentSource, /new ResizeObserver/);
    assert.match(componentSource, /'\.\/defaultSocialPreviewTemplate\.js'/);

    assert.ok(templateResponse);
    assert.equal(templateResponse.headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.match(await templateResponse.text(), /export function defaultSocialPreviewTemplate/);
  });

  it('07: keeps explicit workflow title and description overrides', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/?page=%2Fguides%2Fassets&title=Long%20Sample%20Title&description=Long%20sample%20description.',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {},
        },
      },
    );

    assert.ok(response);
    const body = await response.text();
    assert.match(body, /preview-title="Long Sample Title"/);
    assert.match(body, /preview-description="Long sample description\."/);
  });

  it('08: ignores empty workflow title and description query values', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/?page=%2Fguides%2Fassets&title=&description=',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {},
        },
      },
    );

    assert.ok(response);
    const body = await response.text();
    assert.match(body, /selected-path="\/guides\/assets"/);
    assert.match(body, /preview-title="Asset Guide"/);
    assert.match(body, /preview-description="Manage public assets\."/);
    assert.doesNotMatch(body, /Long Sample Title/);
    assert.doesNotMatch(body, /title=&/);
    assert.doesNotMatch(body, /description=&/);
  });

  it('09: ignores empty title and description query overrides in template routes', async () => {
    const response = await serveSocialPreviewTemplatePreview(
      new Request(
        'https://rocket.test/_rocket/social-preview-template-preview/template?page=%2Fguides%2Fassets&title=&description=',
      ),
      {
        pages: makePages(),
        siteOrigin: 'https://docs.rocket.test',
        siteHeadMetadata: {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          socialPreview: {
            template({ page }) {
              if (!page.title || !page.description) {
                throw new Error('missing preview text');
              }
              return `<main><h1>${page.title}</h1><p>${page.description}</p></main>`;
            },
          },
        },
      },
    );

    assert.ok(response);
    assert.equal(
      await response.text(),
      '<main><h1>Asset Guide</h1><p>Manage public assets.</p></main>',
    );
  });
});

function makePages() {
  return new Map([
    [
      '/guides/runtime',
      {
        file: 'docs/runtime.rocket.js',
        module: {
          config: {
            path: '/guides/runtime',
            metadata: { title: 'Runtime Guide', description: 'Learn runtime rendering.' },
          },
        },
        metadata: {
          title: 'Runtime Guide',
          description: 'Learn runtime rendering.',
        },
      },
    ],
    [
      '/guides/assets',
      {
        file: 'docs/assets.rocket.js',
        module: {
          config: {
            path: '/guides/assets',
            metadata: { title: 'Asset Guide', description: 'Manage public assets.' },
          },
        },
        metadata: {
          title: 'Asset Guide',
          description: 'Manage public assets.',
        },
      },
    ],
  ]);
}
