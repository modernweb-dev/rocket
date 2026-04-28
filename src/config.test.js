import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { readConfig } from './config.js';

describe('Test readConfig', () => {
  it('01: rejects Redirect sources that are not internal absolute paths', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          urlLifecycle: {
            redirects: [{ source: 'old-guide', target: '/new-guide' }],
          },
        };
      `,
      async () => {
        await assert.rejects(
          () => readConfig(),
          /Invalid Redirect source "old-guide".*internal absolute path/s,
        );
      },
    );
  });

  it('02: rejects Redirect targets that are not internal or absolute http URLs', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          urlLifecycle: {
            redirects: [{ source: '/old-guide', target: 'new-guide' }],
          },
        };
      `,
      async () => {
        await assert.rejects(
          () => readConfig(),
          /Invalid Redirect target "new-guide".*internal absolute path.*http.*https/s,
        );
      },
    );
  });

  it('03: rejects Redirect statuses outside the supported HTTP redirect set', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          urlLifecycle: {
            redirects: [{ source: '/old-guide', target: '/new-guide', status: 303 }],
          },
        };
      `,
      async () => {
        await assert.rejects(
          () => readConfig(),
          /Invalid Redirect status 303.*301.*302.*307.*308/s,
        );
      },
    );
  });

  it('04: rejects Redirects that share the same source', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          urlLifecycle: {
            redirects: [
              { source: '/old-guide', target: '/new-guide' },
              { source: '/old-guide', target: '/newer-guide' },
            ],
          },
        };
      `,
      async () => {
        await assert.rejects(() => readConfig(), /Duplicate Redirect source "\/old-guide"/);
      },
    );
  });

  it('05: accepts Site Head Metadata with a canonical Site Origin', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          siteOrigin: 'https://docs.rocket.test/',
          siteHeadMetadata: {
            siteName: 'Rocket Docs',
            defaultDescription: 'Rocket project documentation.',
            language: 'en',
          },
        };
      `,
      async () => {
        const config = await readConfig();

        assert.equal(config.siteOrigin, 'https://docs.rocket.test');
        assert.deepEqual(config.siteHeadMetadata, {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
        });
      },
    );
  });

  it('06: accepts Site Head Metadata favicon assets and theme color', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          siteOrigin: 'https://docs.rocket.test',
          siteHeadMetadata: {
            siteName: 'Rocket Docs',
            defaultDescription: 'Rocket project documentation.',
            language: 'en',
            icons: {
              ico: '/missing/favicon.ico',
              svg: '/missing/favicon.svg',
              appleTouchIcon: '/missing/apple-touch-icon.png',
            },
            themeColor: '#123456',
          },
        };
      `,
      async () => {
        const config = await readConfig();

        assert.deepEqual(config.siteHeadMetadata, {
          siteName: 'Rocket Docs',
          defaultDescription: 'Rocket project documentation.',
          language: 'en',
          icons: {
            ico: '/missing/favicon.ico',
            svg: '/missing/favicon.svg',
            appleTouchIcon: '/missing/apple-touch-icon.png',
          },
          themeColor: '#123456',
        });
      },
    );
  });

  it('07: accepts Site Head Metadata Social Preview static delivery config', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          siteOrigin: 'https://docs.rocket.test',
          siteHeadMetadata: {
            siteName: 'Rocket Docs',
            defaultDescription: 'Rocket project documentation.',
            language: 'en',
            socialPreview: {},
          },
        };
      `,
      async () => {
        const config = await readConfig();

        assert.deepEqual(config.siteHeadMetadata?.socialPreview, {
          delivery: 'static',
        });
      },
    );

    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          siteOrigin: 'https://docs.rocket.test',
          siteHeadMetadata: {
            siteName: 'Rocket Docs',
            defaultDescription: 'Rocket project documentation.',
            language: 'en',
            socialPreview: { delivery: 'static' },
          },
        };
      `,
      async () => {
        const config = await readConfig();

        assert.deepEqual(config.siteHeadMetadata?.socialPreview, {
          delivery: 'static',
        });
      },
    );
  });

  it('08: accepts Site Head Metadata Social Preview template function config', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          siteOrigin: 'https://docs.rocket.test',
          siteHeadMetadata: {
            siteName: 'Rocket Docs',
            defaultDescription: 'Rocket project documentation.',
            language: 'en',
            socialPreview: {
              template({ page }) {
                return '<main>' + page.title + '</main>';
              },
            },
          },
        };
      `,
      async () => {
        const config = await readConfig();

        assert.equal(config.siteHeadMetadata?.socialPreview?.delivery, 'static');
        assert.equal(typeof config.siteHeadMetadata?.socialPreview?.template, 'function');
      },
    );
  });

  it('09: rejects invalid Site Head Metadata config with clear errors', async () => {
    /** @type {[string, string, RegExp][]} */
    const cases = [
      [
        'missing-origin',
        `
          export default {
            includeGlobs: [],
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
            },
          };
        `,
        /Site Head Metadata requires a Site Origin.*siteOrigin/s,
      ],
      [
        'invalid-origin',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test/path',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
            },
          };
        `,
        /Invalid Site Origin "https:\/\/docs\.rocket\.test\/path".*absolute origin/s,
      ],
      [
        'non-object',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: true,
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata must be an object/s,
      ],
      [
        'missing-site-name',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.siteName must be a non-empty string/s,
      ],
      [
        'missing-default-description',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              language: 'en',
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.defaultDescription must be a non-empty string/s,
      ],
      [
        'missing-language',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.language must be a non-empty string/s,
      ],
      [
        'non-object-social-preview',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
              socialPreview: true,
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.socialPreview must be an object/s,
      ],
      [
        'unknown-social-preview-field',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
              socialPreview: { cache: true },
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.socialPreview\.cache.*known Social Preview field/s,
      ],
      [
        'invalid-social-preview-template',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
              socialPreview: { template: './card.js' },
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.socialPreview\.template must be a function/s,
      ],
      [
        'invalid-social-preview-delivery',
        `
          export default {
            includeGlobs: [],
            siteOrigin: 'https://docs.rocket.test',
            siteHeadMetadata: {
              siteName: 'Rocket Docs',
              defaultDescription: 'Rocket project documentation.',
              language: 'en',
              socialPreview: { delivery: 'request-time' },
            },
          };
        `,
        /Invalid Site Head Metadata.*siteHeadMetadata\.socialPreview\.delivery.*static/s,
      ],
    ];

    for (const [, configSource, message] of cases) {
      await withProjectConfig(configSource, async () => {
        await assert.rejects(() => readConfig(), message);
      });
    }
  });

  it('10: accepts Icon Library Configuration and Default Icon Library', async () => {
    await withProjectConfig(
      `
        export default {
          includeGlobs: [],
          iconLibraries: {
            bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
            local: { sources: { type: 'path', files: './src/icons/*.svg' } },
          },
          defaultIconLibrary: 'bootstrap',
        };
      `,
      async () => {
        const config = await readConfig();

        assert.deepEqual(config.iconLibraries, {
          bootstrap: { type: 'package', packageName: 'bootstrap-icons', files: 'icons/*.svg' },
          local: { sources: { type: 'path', files: './src/icons/*.svg' } },
        });
        assert.equal(config.defaultIconLibrary, 'bootstrap');
      },
    );
  });

  it('11: rejects invalid Icon Library Configuration with clear errors', async () => {
    /** @type {[string, RegExp][]} */
    const cases = [
      [
        `
          export default {
            includeGlobs: [],
            iconLibraries: true,
          };
        `,
        /Invalid Icon Library Configuration: iconLibraries must be an object/,
      ],
      [
        `
          export default {
            includeGlobs: [],
            iconLibraries: {
              bootstrap: { type: 'remote', url: 'https://example.com/icon.svg' },
            },
          };
        `,
        /Icon Library Source type must be "package" or "path"/,
      ],
      [
        `
          export default {
            includeGlobs: [],
            defaultIconLibrary: '',
          };
        `,
        /defaultIconLibrary must be a non-empty string/,
      ],
    ];

    for (const [configSource, message] of cases) {
      await withProjectConfig(configSource, async () => {
        await assert.rejects(() => readConfig(), message);
      });
    }
  });
});

/**
 * @param {string} configSource
 * @param {() => Promise<void>} callback
 */
async function withProjectConfig(configSource, callback) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'rocket-config-'));
  const originalCwd = process.cwd();
  writeFileSync(path.join(projectRoot, 'rocket-config.js'), configSource);

  process.chdir(projectRoot);
  try {
    await callback();
  } finally {
    process.chdir(originalCwd);
    rmSync(projectRoot, { recursive: true, force: true });
  }
}
