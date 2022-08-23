import chai from 'chai';
import { execute } from './test-helpers.js';

const { expect } = chai;

describe('validateFolder', () => {
  it('validates internal links', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-link');
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-link/absolute/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            value: '/absolute/index.html',
            file: 'fixtures/internal-link/index.html',
            line: 0,
            character: 9,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-link/relative/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            value: './relative/index.html',
            file: 'fixtures/internal-link/index.html',
            line: 1,
            character: 9,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-link/absolute-page/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            value: '/absolute-page/index.html',
            file: 'fixtures/internal-link/page.html',
            line: 0,
            character: 9,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-link/relative-page/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            value: './relative-page/index.html',
            file: 'fixtures/internal-link/page.html',
            line: 1,
            character: 9,
          },
        ],
      },
    ]);
  });

  it('validates external links', async () => {
    const { errors, cleanup } = await execute('fixtures/external-link', {
      validateExternals: true,
    });
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/external-link/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            attribute: 'href',
            value: '//rocket.modern-web.dev/unexists-page/',
            file: 'fixtures/external-link/index.html',
            line: 6,
            character: 9,
            anchor: '',
          },
          {
            attribute: 'href',
            value: 'http://rocket.modern-web.dev/unexists-page/',
            file: 'fixtures/external-link/index.html',
            line: 7,
            character: 9,
            anchor: '',
          },
          {
            attribute: 'href',
            value: 'https://rocket.modern-web.dev/unexists-page/',
            file: 'fixtures/external-link/index.html',
            line: 8,
            character: 9,
            anchor: '',
          },
        ],
      },
    ]);
  });

  it('validates links with own absolute base url as internal', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-own-absolute-base-path', {
      validateExternals: true,
      absoluteBaseUrl: 'http://localhost',
    });
    expect(cleanup(errors)).to.deep.equal([]);
  });

  it('validates all full urls if there is no absoluteBaseUrl provided', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-own-absolute-base-path', {
      validateExternals: true,
    });
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-own-absolute-base-path/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            character: 9,
            file: 'fixtures/internal-own-absolute-base-path/index.html',
            line: 1,
            value: 'http://localhost/about.html',
          },
        ],
      },
    ]);
  });

  it('groups multiple usage of the same missing file', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-links-to-same-file');
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-links-to-same-file/foo',
        onlyAnchorMissing: false,
        usage: [
          {
            attribute: 'href',
            value: '/foo',
            anchor: '',
            file: 'fixtures/internal-links-to-same-file/index.html',
            line: 0,
            character: 9,
          },
          {
            attribute: 'href',
            value: './foo',
            anchor: '',
            file: 'fixtures/internal-links-to-same-file/index.html',
            line: 1,
            character: 9,
          },
          {
            attribute: 'href',
            value: './foo#my-anchor',
            anchor: 'my-anchor',
            file: 'fixtures/internal-links-to-same-file/index.html',
            line: 2,
            character: 9,
          },
        ],
      },
    ]);
  });

  it('validates that ids of anchors exist', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-link-anchor');
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-link-anchor/page.html',
        onlyAnchorMissing: true,
        usage: [
          {
            attribute: 'href',
            value: './page.html#missing-headline',
            anchor: 'missing-headline',
            file: 'fixtures/internal-link-anchor/index.html',
            line: 2,
            character: 9,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-link-anchor/missing-page.html',
        onlyAnchorMissing: false,
        usage: [
          {
            attribute: 'href',
            value: './missing-page.html#missing-headline',
            anchor: 'missing-headline',
            file: 'fixtures/internal-link-anchor/index.html',
            line: 3,
            character: 9,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-link-anchor/index.html',
        onlyAnchorMissing: true,
        usage: [
          {
            attribute: 'href',
            value: '#local-missing',
            anchor: 'local-missing',
            file: 'fixtures/internal-link-anchor/index.html',
            line: 5,
            character: 9,
          },
        ],
      },
    ]);
  });

  it('can handle urls that end with a /', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-link-folder');
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-link-folder/missing-folder/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            value: './missing-folder/',
            file: 'fixtures/internal-link-folder/index.html',
            line: 2,
            character: 9,
          },
          {
            anchor: 'my-anchor',
            attribute: 'href',
            value: './missing-folder/#my-anchor',
            file: 'fixtures/internal-link-folder/index.html',
            line: 3,
            character: 9,
          },
        ],
      },
    ]);
  });

  it('ignores mailto links', async () => {
    const { errors, cleanup } = await execute('fixtures/mailto');
    expect(cleanup(errors)).to.deep.equal([]);
  });

  it('ignores tel links', async () => {
    const { errors, cleanup } = await execute('fixtures/tel');
    expect(cleanup(errors)).to.deep.equal([]);
  });

  it('ignore not http schema urls', async () => {
    const { errors, cleanup } = await execute('fixtures/not-http-schema');
    expect(cleanup(errors)).to.deep.equal([]);
  });

  it('ignoring a folder', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-link-ignore', {
      ignoreLinkPatterns: ['./relative/*', './relative/**/*'],
    });
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-link-ignore/absolute/index.html',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'href',
            character: 9,
            file: 'fixtures/internal-link-ignore/index.html',
            line: 0,
            value: '/absolute/index.html',
          },
        ],
      },
    ]);
  });

  it('can handle img src', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-images');
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-images/missing.png',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'src',
            value: '/missing.png',
            file: 'fixtures/internal-images/index.html',
            line: 0,
            character: 10,
          },
          {
            anchor: '',
            attribute: 'src',
            character: 10,
            file: 'fixtures/internal-images/index.html',
            line: 1,
            value: './missing.png',
          },
        ],
      },
      {
        filePath: 'fixtures/internal-images/absolute/missing.png',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'src',
            character: 10,
            file: 'fixtures/internal-images/index.html',
            line: 2,
            value: '/absolute/missing.png',
          },
        ],
      },
      {
        filePath: 'fixtures/internal-images/relative/missing.png',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'src',
            character: 10,
            file: 'fixtures/internal-images/index.html',
            line: 3,
            value: './relative/missing.png',
          },
        ],
      },
    ]);
  });

  it('can handle picture source srcset', async () => {
    const { errors, cleanup } = await execute('fixtures/internal-pictures');
    expect(cleanup(errors)).to.deep.equal([
      {
        filePath: 'fixtures/internal-pictures/images/missing-300.png',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'srcset',
            value: '/images/missing-300.png',
            file: 'fixtures/internal-pictures/index.html',
            line: 6,
            character: 18,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-pictures/images/missing-600.png',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'srcset',
            value: '/images/missing-600.png',
            file: 'fixtures/internal-pictures/index.html',
            line: 6,
            character: 18,
          },
        ],
      },
      {
        filePath: 'fixtures/internal-pictures/images/missing.png',
        onlyAnchorMissing: false,
        usage: [
          {
            anchor: '',
            attribute: 'src',
            value: '/images/missing.png',
            file: 'fixtures/internal-pictures/index.html',
            line: 7,
            character: 12,
          },
        ],
      },
    ]);
  });
});
